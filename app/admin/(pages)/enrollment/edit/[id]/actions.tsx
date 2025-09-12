'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateEnrollment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const date = formData.get('date') as string
  const newImage = formData.get('image') as File | null

  if (!id || !title || !body || !date) throw new Error('Missing required fields')

  let image_url: string | null = null
  let image_path: string | null = null

  // Upload new image if provided
  if (newImage) {
    const timestamp = Date.now()
    const sanitizedName = newImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `enrollment/${timestamp}_${sanitizedName}`

    const { error: uploadError } = await supabase.storage
      .from('enrollment')
      .upload(filename, newImage, { cacheControl: '3600', upsert: false })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('enrollment').getPublicUrl(filename)
    image_url = publicUrl
    image_path = filename
  }

  await supabase
    .from('enrollment')
    .update({ title, body, date, ...(image_url ? { image_url, image_path } : {}) })
    .eq('id', id)

  revalidatePath('/admin/enrollment')

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
    .select('id, image_path')
    .eq('id', id)
    .single()

  if (selectError) throw selectError
  if (!record) throw new Error('Enrollment not found')

  // Delete image from storage if exists
  if (record.image_path) {
    const { error: removeError } = await supabase.storage
      .from('enrollment')
      .remove([record.image_path])
    if (removeError) throw removeError
  }

  // Update the record to remove image references
  const { error: updateError } = await supabase
    .from('enrollment')
    .update({ image_url: null, image_path: null })
    .eq('id', id)

  if (updateError) throw updateError

  revalidatePath('/admin/enrollment')
  return { success: true }
}