'use server'

import { getAuthorizedClient } from '@/utils/supabase/auth'

export interface KurikulumRecord {
  id: number
  title: string
  body: string
  preview?: string | null
  order?: number
  created_at: string
}

export async function kurikulumRepository() {
  const { supabase, user } = await getAuthorizedClient()

  return {
    supabase,
    user,

    async getAll(): Promise<KurikulumRecord[]> {
      const { data, error } = await supabase
        .from('kurikulum')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      return data || []
    },

    async getById(id: number): Promise<KurikulumRecord | null> {
      const { data, error } = await supabase
        .from('kurikulum')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    },

    async getNextOrder(): Promise<number> {
      const { data, error } = await supabase
        .from('kurikulum')
        .select('order')
        .order('order', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? (data.order || 0) + 1 : 1
    },

    async createKurikulum(record: Partial<KurikulumRecord>): Promise<void> {
      const { error } = await supabase.from('kurikulum').insert(record)
      if (error) throw error
    },

    async deleteById(id: number): Promise<void> {
      const { error } = await supabase.from('kurikulum').delete().eq('id', id)
      if (error) throw error
    },

    async updateKurikulum(record: Partial<KurikulumRecord> & { id: number }): Promise<void> {
      const { id, title, body, preview } = record
      if (!id || !title || !body) throw new Error('Missing required fields for update')

      const { error } = await supabase
        .from('kurikulum')
        .update({ title, body, preview })
        .eq('id', id)

      if (error) throw error
    },
  }
}
