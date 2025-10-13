import { createClientAuth } from '@/utils/supabase/server'

export async function getAuthorizedClient() {
  const supabase = await createClientAuth()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')
  return { supabase, user }
}
