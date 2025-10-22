"use server";

import { revalidatePath } from "next/cache";
import { enrollmentRepository } from "@repository/enrollment";
import { uploadToR2 } from "@/utils/r2/upload";
import { deleteFromR2 } from "@/utils/r2/delete";

export async function updateEnrollment(formData: FormData) {
  const repo = await enrollmentRepository();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const date = formData.get("date") as string;
  const newImage = formData.get("image") as File | null;

  if (!id || !title || !body || !date)
    throw new Error("Missing required fields");

  // Get current image URL
  const existingImageUrl = await repo.getImageUrl(id);
  let image_url = existingImageUrl;

  // Replace image if new one uploaded
  if (newImage && newImage.size > 0) {
    if (existingImageUrl) await deleteFromR2(existingImageUrl);

    const uploadedUrl = await uploadToR2(newImage, "enrollment");
    if (!uploadedUrl) throw new Error("Image upload failed");

    image_url = uploadedUrl;
  }

  // Update DB record
  await repo.update(id, {
    title,
    body,
    date,
    image_url,
  });

  revalidatePath("/admin/enrollment");
  revalidatePath("/enrollment");
  revalidatePath("/");

  return { success: true, image_url };
}
