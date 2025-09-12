'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Upload news with multiple images
export async function uploadNews(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const date = formData.get('date') as string;
  const embed = formData.get('embed') as string | null;
  const from = formData.get('from') as string;

  if (!title || !body || !date || !from) throw new Error("Missing required fields");

  const files = formData.getAll('images') as File[];
  const imageUrls: string[] = [];
  const storagePaths: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `news/${timestamp}_${i}_${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('news')
      .upload(filename, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('news').getPublicUrl(filename);

    imageUrls.push(publicUrl);
    storagePaths.push(filename);
  }

  await supabase.from('news').insert({
    title,
    body,
    date,
    embed: embed || null,
    from,
    image_urls: imageUrls,
    storage_paths: storagePaths
  });

  revalidatePath('/admin/news');

  return { success: true, imageCount: imageUrls.length };
}