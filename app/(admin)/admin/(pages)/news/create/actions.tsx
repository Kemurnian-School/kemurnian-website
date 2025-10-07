"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getR2Client } from "@/utils/r2/client";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME!;
const CDN_URL = process.env.R2_CDN!;

export async function uploadNews(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const date = formData.get("date") as string;
  const embed = formData.get("embed") as string | null;
  const from = formData.get("from") as string;

  if (!title || !date || !from) throw new Error("Missing required fields");

  const files = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  const newsDate = new Date(date);
  const year = newsDate.getFullYear();
  const month = newsDate.toLocaleString("default", { month: "long" });

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9.-]/g, "_");

  const r2 = getR2Client();
  const uploadedKeys: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `news/${year}/${month}/${sanitizedTitle}/${timestamp}_${i}_${sanitizedName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
        })
      );

      const publicUrl = `${CDN_URL}/${key}`;
      imageUrls.push(publicUrl);
      uploadedKeys.push(key);
    } catch (err) {
      console.error(`Upload error for ${key}:`, err);
      throw new Error(`Failed to upload ${file.name}`);
    }
  }

  // Insert metadata into Supabase DB
  const { error: insertError } = await supabase.from("news").insert({
    title,
    body: body || "",
    date,
    embed: embed || null,
    from,
    image_urls: imageUrls,
  });

  if (insertError) {
    console.error("Insert error:", insertError);

    // Rollback: delete uploaded files from R2
    for (const path of uploadedKeys) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: path,
          })
        );
      } catch (cleanupError) {
        console.error(`Cleanup failed for ${path}`, cleanupError);
      }
    }

    throw new Error(`Failed to save news: ${insertError.message}`);
  }

  revalidatePath("/admin/news");
  return { success: true, imageCount: imageUrls.length };
}
