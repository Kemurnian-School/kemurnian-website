'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getR2Client } from '@/utils/r2/client'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.R2_BUCKET_NAME!
const CDN_URL = process.env.R2_CDN!

async function uploadFile(
  file: File | null,
  device: 'desktop' | 'tablet' | 'mobile'
) {
  if (!file) return null

  const filename = `hero-banners/${device}/${Date.now()}_${file.name}`
  const r2 = getR2Client()

  const arrayBuffer = await file.arrayBuffer()

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: filename,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    })
  )

  return `${CDN_URL}/${filename}`
}

function extractKeyFromUrl(url: string): string {
  // Remove the CDN URL to get just the key
  return url.replace(`${CDN_URL}/`, '')
}

async function deleteFile(url: string) {
  if (!url) return

  const r2 = getR2Client()
  const key = extractKeyFromUrl(url)

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    )
    console.log(`Successfully deleted: ${key}`)
  } catch (error) {
    console.error(`Failed to delete R2 object: ${key}`, error)
    throw error
  }
}

export async function uploadHeroBanner(formData: FormData) {
  const supabase = await createClient()
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
    const desktopUrl = await uploadFile(desktopFile, 'desktop')
    const tabletUrl = await uploadFile(tabletFile, 'tablet')
    const mobileUrl = await uploadFile(mobileFile, 'mobile')

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

export async function deleteHeroBanner(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
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

      for (const url of urlsToDelete) {
        try {
          await deleteFile(url)
        } catch (error) {
          console.error(`Failed to delete R2 object: ${url}`, error)
        }
      }
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
        supabase
          .from('hero_sliders')
          .update({ order: index + 1 })
          .eq('id', item.id)
      )
      await Promise.all(updates)
    }

    revalidatePath('/admin/hero')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Delete failed:', error)
    throw error
  }
}

export async function reorderHeroBanners(formData: FormData) {
  const orderStr = formData.get('order') as string
  if (!orderStr) return

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) throw new Error('Unauthorized')

  try {
    const newOrderIds: number[] = JSON.parse(orderStr)

    const updates = newOrderIds.map((id, index) =>
      supabase
        .from('hero_sliders')
        .update({ order: index + 1 })
        .eq('id', id)
    )

    await Promise.all(updates)

    redirect('/admin/hero?success=' + encodeURIComponent('Hero banner reorder successful!'))
  } catch (error) {
    console.error('Reorder failed:', error)
    throw error
  }
}
