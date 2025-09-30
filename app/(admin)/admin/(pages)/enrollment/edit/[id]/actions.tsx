'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { put, del } from '@vercel/blob'

export async function updateEnrollment(formData: FormData) {
  const supabase = await createClient()

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

      // Delete old image from Blob if exists
      if (existingRecord?.image_url) {
        try {
          await del(existingRecord.image_url)
        } catch (error) {
          console.error('Failed to delete old enrollment image:', error)
          // Continue anyway
        }
      }

      // Upload new image to Vercel Blob
      const timestamp = Date.now()
      const sanitizedName = newImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `enrollment/${timestamp}_${sanitizedName}`

      const blob = await put(filename, newImage, {
        access: 'public',
      })

      image_url = blob.url
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  // Update database
  await supabase
    .from('enrollment')
    .update({
      title,
      body,
      date,
      ...(image_url ? { image_url } : {})
    })
    .eq('id', id)

  revalidatePath('/admin/enrollment')
  revalidatePath('/')

  return { success: true, image_url }
}

export async function deleteEnrollmentImage(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error('Missing enrollment ID')

  const supabase = await createClient()

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

  // Delete image from Vercel Blob if exists
  if (record.image_url) {
    try {
      await del(record.image_url)
    } catch (error) {
      console.error('Failed to delete blob:', error)
      // Continue to update DB even if blob deletion fails
    }
  }

  // Update the record to remove image reference
  const { error: updateError } = await supabase
    .from('enrollment')
    .update({ image_url: null })
    .eq('id', id)

  if (updateError) throw updateError

  revalidatePath('/admin/enrollment')
  revalidatePath('/')

  return { success: true }
}
