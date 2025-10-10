'use server'
import { createClientAuth } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateKurikulum(formData: FormData) {
  const supabase = await createClientAuth()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const preview = formData.get('preview') as string | null  // can be null

  if (!id || !title || !body) throw new Error('ID, title, and body are required')

  const previewValue = preview === '' ? null : preview

  const { data, error } = await supabase
    .from('kurikulum')
    .update({ title, body, preview: previewValue })
    .eq('id', id)
    .select()

  if (error) throw error

  revalidatePath('/admin/kurikulum')
  return data
}
