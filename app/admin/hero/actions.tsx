'use server'
import { revalidatePath } from 'next/cache'
import { supabaseClient } from '@/utils/supabase/client'

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return
  const supabase = supabaseClient()

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('hero_sliders')
    .upload(`hero-images/${Date.now()}_${file.name}`, file)
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('hero_sliders')
    .getPublicUrl(uploadData.path)

  // Determine new order value = current max + 1
  const { data: existing, error } = await supabase
    .from('hero_sliders')
    .select('order')
  if (error) throw error
  const orders = existing?.map(e => e.order ?? 0) || []
  const maxOrder = orders.length ? Math.max(...orders) : 0

  await supabase
    .from('hero_sliderss')
    .insert({ image_urls: publicUrl, order: maxOrder + 1 })
  revalidatePath('/admin')
}

export async function reorderImages(formData: FormData) {
  const orderStr = formData.get('order') as string
  if (!orderStr) return
  const newOrderIds: number[] = JSON.parse(orderStr)
  const supabase = supabaseClient()

  // Update each item's `order` field to its index+1
  for (let i = 0; i < newOrderIds.length; i++) {
    await supabase
      .from('hero_sliders')
      .update({ order: i + 1 })
      .eq('id', newOrderIds[i])
  }
  revalidatePath('/admin')
}

export async function deleteImage(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = supabaseClient()

  const { data: record } = await supabase
    .from('hero_sliders')
    .select('image_url')
    .eq('id', id)
    .single()
  if (record?.image_url) {
    const path = record.image_url.split('/').pop() || ''
    if (path) {
      await supabase.storage.from('hero_sliders').remove([path])
    }
  }
  await supabase.from('hero_sliders').delete().eq('id', id)

  // Recalculate orders to close any gap
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
