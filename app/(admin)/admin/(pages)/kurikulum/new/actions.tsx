'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function uploadKurikulum(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.log("Session error:", sessionError)
    }

    const title = formData.get('title') as string
    const body = formData.get('body') as string
    const preview = formData.get('preview') as string | null

    if (!title || !body) {
      throw new Error("Title and Body are required")
    }

    const previewValue = preview === '' ? null : preview

    // Get the highest order value from the table
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('kurikulum')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single()

    if (maxOrderError && maxOrderError.code !== 'PGRST116') {
      console.log("Error fetching max order:", maxOrderError)
      throw new Error('Failed to fetch max order value')
    }

    const nextOrder = maxOrderData ? (maxOrderData.order || 0) + 1 : 1

    // Insert with the calculated order
    const { data, error } = await supabase
      .from('kurikulum')
      .insert({
        title,
        body,
        preview: previewValue,
        order: nextOrder
      })
      .select()

    if (error) {
      console.log("Insert error:", error)
      throw new Error('Failed to insert kurikulum')
    }

    revalidatePath('/admin/kurikulum')
    return data
  } catch (error) {
    console.error("Error in uploadKurikulum:", error)
    throw error
  }
}
