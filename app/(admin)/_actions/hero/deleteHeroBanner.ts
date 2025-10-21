"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFromR2 } from "@/utils/r2/delete";
import { heroRepository } from "@/utils/supabase/repository/hero";

/**
 * Deletes a hero banner and all associated images from R2.
 * Also reorders remaining banners and revalidates the admin pages.
 */
export async function deleteHeroBanner(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing hero banner ID");

  try {
    const repo = await heroRepository();
    const record = await repo.getById(id);
    if (!record) throw new Error("Hero banner not found");

    // Delete all images from R2 concurrently
    const urls = [
      record.image_urls,
      record.tablet_image_urls,
      record.mobile_image_urls,
    ];

    await Promise.all(
      urls
        .filter((url): url is string => Boolean(url))
        .map((url) => deleteFromR2(url)),
    );

    // Delete from database
    await repo.deleteHero(id);

    // Normalize remaining order
    await repo.normalizeOrder();

    // Revalidate pages
    revalidatePath("/admin/hero");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }

  redirect(
    "/admin/hero?success=" +
      encodeURIComponent("Hero banner deleted successfully!"),
  );
}
