'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClientAuth } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClientAuth()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect('/login?error=true')
  }
  revalidatePath('/admin')
  redirect('/admin')
}
