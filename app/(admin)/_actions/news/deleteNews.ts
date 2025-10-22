"use server";

import { redirect } from "next/navigation";
import { deleteFromR2 } from "@/utils/r2/delete";
import { newsRepository } from "@/utils/supabase/repository/news";
import { revalidatePath } from "next/cache";

export async function deleteNews(id: number) {
  const repo = await newsRepository();
  const newsRecord = await repo.getById(id);

  if (!newsRecord) throw new Error("News not found");

  // Delete all R2 files concurrently
  if (newsRecord.image_urls?.length) {
    await Promise.all(newsRecord.image_urls.map((url) => deleteFromR2(url)));
  }

  // Delete record from database
  await repo.deleteById(id);

  // Refresh admin dashboard
  revalidatePath("/");
  revalidatePath("/news");

  // Redirect with success message
  redirect(
    "/admin/news?success=" + encodeURIComponent("News deleted successfully!"),
  );
}
