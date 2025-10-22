"use server";

import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/utils/r2/upload";
import { deleteFromR2 } from "@/utils/r2/delete";
import { newsRepository } from "@/utils/supabase/repository/news";

export async function uploadNews(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const date = formData.get("date") as string;
  const embed = formData.get("embed") as string | null;
  const from = formData.get("from") as string;
  const images = formData.getAll("images") as File[];

  if (!title || !date || !from) throw new Error("Missing required fields");

  // prepare folder structure
  const newsDate = new Date(date);
  const year = newsDate.getFullYear();
  const month = newsDate.toLocaleString("default", { month: "long" });
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9.-]/g, "_");

  const uploadedImagesUrls: string[] = [];

  try {
    // upload all files to R2
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image || image.size === 0) continue;

      const url = await uploadToR2(image, "news", {
        subfolder: `${year}/${month}/${sanitizedTitle}`,
        filenamePrefix: `${Date.now()}_${i}_`,
      });

      if (url) uploadedImagesUrls.push(url);
    }

    // insert metadata into Supabase
    const repo = await newsRepository();
    await repo.createNews({
      title,
      body: body || "",
      date,
      embed: embed || null,
      from,
      image_urls: uploadedImagesUrls,
    });

    revalidatePath("/");
    revalidatePath("/news");
    return { success: true, uploaded: uploadedImagesUrls.length };
  } catch (error) {
    console.error("Upload failed:", error);

    // Rollback: delete any files already uploaded
    await Promise.all(uploadedImagesUrls.map((url) => deleteFromR2(url)));

    throw new Error("Upload failed, rolled back uploaded files.");
  }
}
