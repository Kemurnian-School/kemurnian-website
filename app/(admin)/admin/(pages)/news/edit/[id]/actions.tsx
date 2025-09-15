'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Delete individual news image immediately
export async function deleteNewsImage(formData: FormData) {
  const newsId = formData.get('newsId') as string
  const imageUrl = formData.get('imageUrl') as string
  const storagePath = formData.get('storagePath') as string

  if (!newsId || !imageUrl || !storagePath) {
    throw new Error('Missing required fields for image deletion')
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) throw new Error('Unauthorized')

  // Fetch current news record
  const { data: record, error: selectError } = await supabase
    .from('news')
    .select('id, image_urls, storage_paths')
    .eq('id', newsId)
    .single()

  if (selectError || !record) throw new Error('News not found')

  // Remove the image from storage
  const { error: removeError } = await supabase.storage
    .from('news')
    .remove([storagePath])

  if (removeError) throw removeError

  // Update arrays by removing the deleted image
  const updatedImageUrls = record.image_urls.filter((url: string) => url !== imageUrl)
  const updatedStoragePaths = record.storage_paths?.filter((path: string) => path !== storagePath) || []

  // Update the record in database
  const { error: updateError } = await supabase
    .from('news')
    .update({ 
      image_urls: updatedImageUrls,
      storage_paths: updatedStoragePaths
    })
    .eq('id', newsId)

  if (updateError) throw updateError

  revalidatePath('/admin/news')
  return { success: true }
}

// Update news with proper storage path tracking
export async function updateNews(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const date = formData.get('date') as string;
  const embed = formData.get('embed') as string | null;
  const from = formData.get('from') as string;
  const existingImages = JSON.parse(formData.get('existingImages') as string || '[]') as string[];
  const existingPaths = JSON.parse(formData.get('existingPaths') as string || '[]') as string[];

  if (!id || !title || !body || !date || !from) throw new Error("Missing required fields");

  const files = formData.getAll('images') as File[];
  const imageUrls: string[] = [...existingImages]; // start with existing images
  const storagePaths: string[] = [...existingPaths]; // start with existing paths

  // Upload new images and track their storage paths
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

  // Update the news record with both image URLs and storage paths
  await supabase.from('news')
    .update({ 
      title, 
      body, 
      date, 
      embed: embed || null, 
      from, 
      image_urls: imageUrls,
      storage_paths: storagePaths
    })
    .eq('id', id);

  revalidatePath('/admin/news');
  return { success: true, imageCount: imageUrls.length };
}