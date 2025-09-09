'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function uploadImage(formData: FormData) {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.log("Session error:", sessionError)
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const file = formData.get('file') as File
  if (!file) return

  const filename = `hero-images/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('hero_sliders')
    .upload(filename, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('hero_sliders')
    .getPublicUrl(filename)

  const { error: insertError } = await supabase
    .from('hero_sliders')
    .insert({ image_urls: publicUrl, order: 1 })

  if (insertError) throw insertError

  revalidatePath('/admin')
}

// Reorder
export async function reorderImages(formData: FormData) {
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
  revalidatePath('/admin')
}

// Delete
export async function deleteImage(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) throw new Error('Unauthorized')

  const { data: record } = await supabase
    .from('hero_sliders')
    .select('id, storage_path')
    .eq('id', id)
    .single()

  if (record?.storage_path) {
    await supabase.storage.from('hero_sliders').remove([record.storage_path])
  }
  await supabase.from('hero_sliders').delete().eq('id', id)

  // Recalculate order
  const { data: remaining } = await supabase
    .from('hero_sliders')
    .select('id')
    .order('order', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from('hero_sliders')
        .update({ order: i + 1 })
        .eq('id', remaining[i].id)
    }
  }
  revalidatePath('/admin')
}