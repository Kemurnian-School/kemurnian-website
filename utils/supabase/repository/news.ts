'use server'

import { getAuthorizedClient } from '@/utils/supabase/auth'

export interface NewsRecord {
  id: number;
  title: string;
  body: string;
  date: string;
  from: string;
  image_urls: string[];
  embed?: string | null;
  created_at: string;
}

export async function newsRepository() {
  const { supabase, user } = await getAuthorizedClient()

  return {
    supabase,
    user,

    async getAll(): Promise<NewsRecord[] | null> {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      return data || [];
    },

    async getById(id: number): Promise<NewsRecord | null> {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    },

    async createNews(record: Omit<NewsRecord, 'id' | 'created_at'>): Promise<void> {
      const { error } = await supabase.from('news').insert(record)
      if (error) throw error
    },

    async deleteById(id: number): Promise<void> {
      const { error } = await supabase.from('news').delete().eq('id', id)
      if (error) throw error
    },

    async updateNews(record: Partial<NewsRecord> & { id: number }): Promise<void> {
      const { id, ...fields } = record
      const { error } = await supabase.from('news').update(fields).eq('id', id)
      if (error) throw error
    }


  }

}
