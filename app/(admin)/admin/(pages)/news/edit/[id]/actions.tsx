'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { getR2Client } from '@/utils/r2/client';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.R2_BUCKET_NAME!;
const CDN_URL = process.env.R2_CDN!; // e.g. https://cdn.mystiatesting.online

function extractR2KeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, '');
}

export async function deleteNewsImage(formData: FormData) {
  const newsId = formData.get('newsId') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const rawPath = formData.get('storagePath');

  if (!newsId || !imageUrl) throw new Error('Missing required fields for image deletion');

  const storagePath =
    rawPath === null || rawPath === '' || rawPath === 'null' ? null : (rawPath as string);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Unauthorized');

  // Old (Supabase) image
  if (storagePath) {
    const { error: removeError } = await supabase.storage.from('news').remove([storagePath]);
    if (removeError) throw removeError;
  } else {
    // New (R2) image
    const r2 = getR2Client();
    const key = extractR2KeyFromUrl(imageUrl);
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  }

  const { data: record, error: selectError } = await supabase
    .from('news')
    .select('image_urls')
    .eq('id', newsId)
    .single();
  if (selectError || !record) throw new Error('News not found');

  const nextUrls = (record.image_urls as string[]).filter((u) => u !== imageUrl);

  const { error: updateError } = await supabase
    .from('news')
    .update({ image_urls: nextUrls })
    .eq('id', newsId);
  if (updateError) throw updateError;

  revalidatePath('/admin/news');
  return { success: true };
}

export async function updateNews(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const date = formData.get('date') as string;
  const embed = formData.get('embed') as string | null;
  const from = formData.get('from') as string;

  // existing image URLs (keep them)
  const existingImages = JSON.parse((formData.get('existingImages') as string) || '[]') as string[];

  if (!id || !title || !body || !date || !from) throw new Error('Missing required fields');

  const files = formData.getAll('images') as File[];
  const imageUrls: string[] = [...existingImages];

  // build folder structure by date + title
  const newsDate = new Date(date);
  const year = newsDate.getFullYear();
  const month = newsDate.toLocaleString('default', { month: 'long' });
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9.-]/g, '_');

  const r2 = getR2Client();

  // Upload new images to R2 only
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `news/${year}/${month}/${sanitizedTitle}/${timestamp}_${i}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      })
    );

    imageUrls.push(`${CDN_URL}/${key}`);
  }

  const { error: updateError } = await supabase
    .from('news')
    .update({
      title,
      body,
      date,
      embed: embed || null,
      from,
      image_urls: imageUrls,
    })
    .eq('id', id);

  if (updateError) throw updateError;

  revalidatePath('/admin/news');
  return { success: true, imageCount: imageUrls.length };
}
