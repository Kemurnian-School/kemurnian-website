"use server";

import { revalidatePath } from "next/cache";
import { deleteFromR2 } from "@/utils/r2/delete";
import { newsRepository } from "@/utils/supabase/repository/news";

export async function deleteNewsImage(formData: FormData) {
  const id = Number(formData.get("newsId"));
  const url = formData.get("imageUrl") as string;
  if (!id || !url) throw new Error("Invalid request");

  const repo = await newsRepository();
  const record = await repo.getById(id);
  if (!record) throw new Error("News not found");

  await deleteFromR2(url);

  const nextImages = record.image_urls.filter((u) => u !== url);
  await repo.updateNews({ id, image_urls: nextImages });

  revalidatePath(`/news/${id}`);
  revalidatePath("/");
  revalidatePath("/news");
}
