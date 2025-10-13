'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { deleteFromR2 } from '@/utils/r2/delete'
import { getHeroRepository } from '@/utils/supabase/repository/hero'

export async function deleteHeroBanner(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error('Missing hero banner ID')

  try {
    const heroRepo = await getHeroRepository()
    const record = await heroRepo.getById(id)
    if (!record) throw new Error('Hero banner not found')

    // Delete all images from R2 concurrently
    const urls = [record.image_urls, record.tablet_image_urls, record.mobile_image_urls]

    await Promise.all(
      urls
        .filter((url): url is string => Boolean(url))
        .map((url) => deleteFromR2(url))
    )

    // Delete from database
    await heroRepo.deleteById(id)

    // Normalize remaining order
    await heroRepo.normalizeOrder()

    // Revalidate pages
    revalidatePath('/admin/hero')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Delete failed:', error)
    throw error
  }

  redirect('/admin/hero?success=' + encodeURIComponent('Hero banner deleted successfully!'))
}
