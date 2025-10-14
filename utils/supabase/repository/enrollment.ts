'use server'

import { getAuthorizedClient } from '@/utils/supabase/auth'

export interface EnrollmentRecord {
  id: string
  title: string
  body: string
  date: string
  image_url: string | null
  image_path: string | null
}

export async function enrollmentRepository() {
  const { supabase, user } = await getAuthorizedClient()

  return {
    supabase,
    user,

    async get(): Promise<EnrollmentRecord | null> {
      const { data, error } = await supabase
        .from('enrollment')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async update(id: string, values: Partial<EnrollmentRecord>): Promise<void> {
      const { error } = await supabase.from('enrollment').update(values).eq('id', id)
      if (error) throw error
    },

    async getImageUrl(id: string): Promise<string | null> {
      const { data, error } = await supabase
        .from('enrollment')
        .select('image_url')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.image_url ?? null
    },
  }
}
