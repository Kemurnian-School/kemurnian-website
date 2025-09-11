'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function uploadNews(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const date = formData.get('date') as string;
  const embed = formData.get('embed') as string | null;
  const from = formData.get('from') as string;

  // Validate required fields
  if (!title || !body || !date || !from) {
    throw new Error("Missing required fields");
  }

  // Get all image files
  const files = formData.getAll('images') as File[];
  const imageUrls: string[] = [];

  console.log(`Processing ${files.length} images`); // Debug log

  // Upload each image
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Skip empty files
      if (!file || file.size === 0) {
        console.log(`Skipping empty file at index ${i}`);
        continue;
      }

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `news/${timestamp}_${i}_${sanitizedName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('news')
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for ${filename}:`, uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('news')
          .getPublicUrl(filename);

        imageUrls.push(publicUrl);
        console.log(`Successfully uploaded: ${filename} -> ${publicUrl}`);

      } catch (error) {
        console.error(`Failed to upload ${filename}:`, error);
        throw new Error(`Failed to upload image: ${file.name}`);
      }
    }
  }

  console.log(`Final imageUrls array:`, imageUrls);

  try {
    const { data, error } = await supabase
      .from('news')
      .insert({ 
        title, 
        body, 
        date, 
        embed: embed || null, 
        from, 
        image_urls: imageUrls
      })
      .select();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    console.log('News inserted successfully:', data);

  } catch (error) {
    console.error('Database operation failed:', error);
    throw new Error('Failed to save news to database');
  }

  revalidatePath('/admin/news');
  
  return { success: true, imageCount: imageUrls.length };
}