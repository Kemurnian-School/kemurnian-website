'use server'
import { revalidatePath } from 'next/cache'
import { createClientAuth } from '@/utils/supabase/server'
import { getR2Client } from '@/utils/r2/client'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.R2_BUCKET_NAME!
const CDN_URL = process.env.R2_CDN! // e.g. https://cdn.mystiatesting.online

function extractKeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, '')
}

async function uploadFile(file: File): Promise<string> {
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const key = `enrollment/${timestamp}_${sanitizedName}`

  const r2 = getR2Client()
  const arrayBuffer = await file.arrayBuffer()

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    })
  )

  return `${CDN_URL}/${key}`
}

async function deleteFile(url: string) {
  if (!url) return
  const key = extractKeyFromUrl(url)
  const r2 = getR2Client()

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    )
    console.log(`Deleted: ${key}`)
  } catch (error) {
    console.error(`Failed to delete: ${key}`, error)
  }
}

export async function updateEnrollment(formData: FormData) {
  const supabase = await createClientAuth()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const date = formData.get('date') as string
  const newImage = formData.get('image') as File | null

  if (!id || !title || !body || !date) {
    throw new Error('Missing required fields')
  }

  let image_url: string | null = null

  // Upload new image if provided
  if (newImage && newImage.size > 0) {
    try {
      // Get existing record to delete old image
      const { data: existingRecord } = await supabase
        .from('enrollment')
        .select('image_url')
        .eq('id', id)
        .single()

      if (existingRecord?.image_url) {
        await deleteFile(existingRecord.image_url)
      }

      image_url = await uploadFile(newImage)
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  // Update database
  const { error: updateError } = await supabase
    .from('enrollment')
    .update({
      title,
      body,
      date,
      ...(image_url ? { image_url } : {}),
    })
    .eq('id', id)

  if (updateError) throw updateError

  revalidatePath('/admin/enrollment')
  revalidatePath('/')

  return { success: true, image_url }
}

export async function deleteEnrollmentImage(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error('Missing enrollment ID')

  const supabase = await createClientAuth()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) throw new Error('Unauthorized')

  // Fetch the enrollment record
  const { data: record, error: selectError } = await supabase
    .from('enrollment')
    .select('id, image_url')
    .eq('id', id)
    .single()

  if (selectError) throw selectError
  if (!record) throw new Error('Enrollment not found')

  if (record.image_url) {
    await deleteFile(record.image_url)
  }

  const { error: updateError } = await supabase
    .from('enrollment')
    .update({ image_url: null })
    .eq('id', id)

  if (updateError) throw updateError

  revalidatePath('/admin/enrollment')
  revalidatePath('/')

  return { success: true }
}
