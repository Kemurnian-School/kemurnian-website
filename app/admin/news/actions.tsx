'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'


export async function deleteNews(newsId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { data: record, error: fetchError } = await supabase
    .from('news')
    .select('id, storage_paths')
    .eq('id', newsId)
    .single();
  if (fetchError || !record) throw new Error('News not found');

  // Delete images from storage
  if (record.storage_paths?.length) {
    await supabase.storage.from('news').remove(record.storage_paths);
  }

  // Delete record from DB
  await supabase.from('news').delete().eq('id', newsId);

  revalidatePath('/admin/news');
}
