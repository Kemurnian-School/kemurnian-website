'use server'

import { revalidatePath } from 'next/cache'
import { uploadToR2 } from '@/utils/r2/upload'
import { getHeroRepository } from '@/utils/supabase/repository/hero'

export async function uploadHeroBanner(formData: FormData) {
  const headerText = formData.get('headerText') as string
  const buttonText = formData.get('buttonText') as string
  const hrefText = formData.get('hrefText') as string

  const desktopFile = formData.get('desktopImage') as File | null
  const tabletFile = formData.get('tabletImage') as File | null
  const mobileFile = formData.get('mobileImage') as File | null

  if (!desktopFile) throw new Error('A desktop image is required')

  try {
    const heroRepo = await getHeroRepository()

    const desktopUrl = await uploadToR2(desktopFile, 'hero-banners', { subfolder: 'desktop' })
    const tabletUrl = await uploadToR2(tabletFile, 'hero-banners', { subfolder: 'tablet' })
    const mobileUrl = await uploadToR2(mobileFile, 'hero-banners', { subfolder: 'mobile' })

    const nextOrder = await heroRepo.getNextOrderNumber()

    await heroRepo.createHeroBanner({
      header_text: headerText,
      href_text: hrefText,
      button_text: buttonText,
      image_urls: desktopUrl,
      tablet_image_urls: tabletUrl,
      mobile_image_urls: mobileUrl,
      order: nextOrder,
    })

    revalidatePath('/admin/hero')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
