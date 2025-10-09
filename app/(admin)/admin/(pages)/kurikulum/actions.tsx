'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteKurikulum(id: number) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Delete from DB
  const { error: deleteError } = await supabase
    .from('kurikulum')
    .delete()
    .eq('id', id)

  if (deleteError) throw new Error(deleteError.message)

  redirect('/admin/kurikulum?success=' + encodeURIComponent('Kurikulum deleted successfully'))
}
