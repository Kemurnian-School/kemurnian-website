"use server";

import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/utils/r2/upload";
import { newsRepository } from "@/utils/supabase/repository/news";

export async function updateNews(formData: FormData) {
  const repo = await newsRepository();

  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const date = formData.get("date") as string;
  const from = formData.get("from") as string;
  const embed = (formData.get("embed") as string) || null;
  const existingImages = JSON.parse(
    formData.get("existingImages") as string,
  ) as string[];
  const newFiles = formData.getAll("images") as File[];

  const imageUrls = [...existingImages];

  const newsDate = new Date(date);
  const year = newsDate.getFullYear();
  const month = newsDate.toLocaleString("default", { month: "long" });
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9.-]/g, "_");

  try {
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (!file.size) continue;
      const url = await uploadToR2(file, "news", {
        subfolder: `${year}/${month}/${sanitizedTitle}`,
        filenamePrefix: `${Date.now()}_${i}_`,
      });
      if (url) imageUrls.push(url);
    }

    await repo.updateNews({
      id,
      title,
      body,
      date,
      from,
      embed,
      image_urls: imageUrls,
    });

    revalidatePath(`/news/${id}`);
    revalidatePath("/");
    revalidatePath("/news");
  } catch (err) {
    console.error("Update failed", err);
    throw err;
  }
}
