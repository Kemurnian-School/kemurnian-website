'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateKurikulum(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string

  if (!id || !title || !body) throw new Error('All fields are required')

  const { data, error } = await supabase
    .from('kurikulum')
    .update({ title, body })
    .eq('id', id)
    .select()

  if (error) throw error

  revalidatePath('/admin/kurikulum')
  return data
}