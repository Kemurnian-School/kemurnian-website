'use server'

import { revalidatePath } from 'next/cache'
import { createClientAuth } from '@/utils/supabase/server'
import { deleteImage } from './helper/deleteImage'
import { redirect } from 'next/navigation'

export async function deleteHeroBanner(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClientAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  try {
    const { data: record, error: fetchError } = await supabase
      .from('hero_sliders')
      .select('id, image_urls, tablet_image_urls, mobile_image_urls')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (record) {
      const urlsToDelete: string[] = []
      if (record.image_urls) urlsToDelete.push(record.image_urls)
      if (record.tablet_image_urls) urlsToDelete.push(record.tablet_image_urls)
      if (record.mobile_image_urls) urlsToDelete.push(record.mobile_image_urls)

      await Promise.all(
        urlsToDelete.map(async (url) => {
          try {
            await deleteImage(url)
          } catch (err) {
            console.error(`Failed to delete R2 object: ${url}`, err)
          }
        })
      )
    }

    const { error: deleteError } = await supabase
      .from('hero_sliders')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    const { data: remaining } = await supabase
      .from('hero_sliders')
      .select('id')
      .order('order', { ascending: true })

    if (remaining && remaining.length > 0) {
      const updates = remaining.map((item, index) =>
        supabase.from('hero_sliders').update({ order: index + 1 }).eq('id', item.id)
      )
      await Promise.all(updates)
    }

    revalidatePath('/admin/hero')
    revalidatePath('/admin')

  } catch (error) {
    console.error('Delete failed:', error)
    throw error
  }
  redirect('/admin/hero?success=' + encodeURIComponent('Hero banner deleted successfully!'))
}
