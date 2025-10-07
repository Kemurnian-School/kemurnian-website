"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getR2Client } from "@/utils/r2/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME!;
const CDN_URL = process.env.R2_CDN!;

function extractR2KeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, "");
}

export async function deleteNews(newsId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const { data: record, error: fetchError } = await supabase
    .from("news")
    .select("id, image_urls, storage_paths")
    .eq("id", newsId)
    .single();

  if (fetchError || !record) throw new Error("News not found");

  const r2 = getR2Client();

  if (record.storage_paths && record.storage_paths.length > 0) {
    try {
      await supabase.storage.from("news").remove(record.storage_paths);
      console.log("Deleted Supabase files:", record.storage_paths);
    } catch (err) {
      console.error("Failed to delete Supabase files:", err);
    }
  }

  if (record.image_urls && record.image_urls.length > 0) {
    for (let i = 0; i < record.image_urls.length; i++) {
      const imageUrl = record.image_urls[i];
      const storagePath = record.storage_paths?.[i] ?? null;

      if (!storagePath && imageUrl.startsWith(CDN_URL)) {
        try {
          const key = extractR2KeyFromUrl(imageUrl);
          await r2.send(
            new DeleteObjectCommand({
              Bucket: BUCKET,
              Key: key,
            })
          );
          console.log(`Deleted from R2: ${key}`);
        } catch (err) {
          console.error(`Failed to delete from R2: ${imageUrl}`, err);
        }
      }
    }
  }

  await supabase.from("news").delete().eq("id", newsId);

  revalidatePath("/admin/news");
}
