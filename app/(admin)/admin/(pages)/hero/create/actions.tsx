'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

async function uploadFile(
  supabase: any, 
  file: File | null,
  device: 'desktop' | 'tablet' | 'mobile'
) {
  if (!file) {
    return { publicUrl: null, storagePath: null }
  }

  const filename = `hero-banners/${device}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('hero_sliders')
    .upload(filename, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('hero_sliders')
    .getPublicUrl(filename)

  return { publicUrl, storagePath: filename }
}


export async function uploadHeroBanner(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const headerText = formData.get('headerText') as string
  const buttonText = formData.get('buttonText') as string
  const hrefText = formData.get('hrefText') as string
  
  const desktopFile = formData.get('desktopImage') as File | null
  const tabletFile = formData.get('tabletImage') as File | null
  const mobileFile = formData.get('mobileImage') as File | null

  if (!desktopFile) {
    throw new Error("A desktop image is required")
  }

  try {
    const desktopUpload = await uploadFile(supabase, desktopFile, 'desktop')
    const tabletUpload = await uploadFile(supabase, tabletFile, 'tablet')
    const mobileUpload = await uploadFile(supabase, mobileFile, 'mobile')

    const { data: maxOrderData } = await supabase
      .from('hero_sliders')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single()
    
    const nextOrder = maxOrderData ? maxOrderData.order + 1 : 1

    const { error: insertError } = await supabase
      .from('hero_sliders')
      .insert({
        header_text: headerText,
        href_text: hrefText,
        button_text: buttonText,
        image_urls: desktopUpload.publicUrl,
        storage_path: desktopUpload.storagePath,
        tablet_image_urls: tabletUpload.publicUrl,
        tablet_storage_path: tabletUpload.storagePath,
        mobile_image_urls: mobileUpload.publicUrl,
        mobile_storage_path: mobileUpload.storagePath,
        order: nextOrder
      })

    if (insertError) throw insertError

    revalidatePath('/admin/hero')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

// CHANGE: Updated delete function to handle single string paths
export async function deleteHeroBanner(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: record } = await supabase
    .from('hero_sliders')
    .select('id, storage_path, tablet_storage_path, mobile_storage_path')
    .eq('id', id)
    .single()

  if (record) {
    const filesToDelete: string[] = []
    // Check for each path individually since they are no longer arrays
    if (record.storage_path) filesToDelete.push(record.storage_path)
    if (record.tablet_storage_path) filesToDelete.push(record.tablet_storage_path)
    if (record.mobile_storage_path) filesToDelete.push(record.mobile_storage_path)

    if (filesToDelete.length > 0) {
      await supabase.storage.from('hero_sliders').remove(filesToDelete)
    }
  }

  await supabase.from('hero_sliders').delete().eq('id', id)
  
  const { data: remaining } = await supabase
    .from('hero_sliders')
    .select('id')
    .order('order', { ascending: true })

  if (remaining) {
    const updates = remaining.map((item, index) => 
      supabase
        .from('hero_sliders')
        .update({ order: index + 1 })
        .eq('id', item.id)
    )
    await Promise.all(updates)
  }

  revalidatePath('/admin/hero')
  revalidatePath('/admin')
}

export async function reorderHeroBanners(formData: FormData) {
  const orderStr = formData.get('order') as string
  if (!orderStr) return

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) throw new Error('Unauthorized')

  const newOrderIds: number[] = JSON.parse(orderStr)

  for (let i = 0; i < newOrderIds.length; i++) {
    await supabase
      .from('hero_sliders')
      .update({ order: i + 1 })
      .eq('id', newOrderIds[i])
  }

  revalidatePath('/admin/hero')
  revalidatePath('/admin')
}