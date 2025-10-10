'use server'

import { revalidatePath } from 'next/cache'
import { createClientAuth } from '@/utils/supabase/server'
import { uploadImage } from './helper/uploadImage'

export async function uploadHeroBanner(formData: FormData) {
  const supabase = await createClientAuth()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const headerText = formData.get('headerText') as string
  const buttonText = formData.get('buttonText') as string
  const hrefText = formData.get('hrefText') as string

  const desktopFile = formData.get('desktopImage') as File | null
  const tabletFile = formData.get('tabletImage') as File | null
  const mobileFile = formData.get('mobileImage') as File | null

  if (!desktopFile) throw new Error('A desktop image is required')

  try {
    const desktopUrl = await uploadImage(desktopFile, 'desktop')
    const tabletUrl = await uploadImage(tabletFile, 'tablet')
    const mobileUrl = await uploadImage(mobileFile, 'mobile')

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
        image_urls: desktopUrl,
        tablet_image_urls: tabletUrl,
        mobile_image_urls: mobileUrl,
        order: nextOrder,
      })

    if (insertError) throw insertError

    revalidatePath('/admin/hero')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
