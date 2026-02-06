"use server";

import { revalidatePath } from "next/cache";
import { enrollmentRepository } from "@repository/enrollment";
import { deleteFromStorage } from "@/utils/storage/delete";

export async function deleteEnrollmentImage(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing enrollment ID");

  const repo = await enrollmentRepository();
  const imageUrl = await repo.getImageUrl(id);

  if (!imageUrl) throw new Error("No image to delete");

  await deleteFromStorage(imageUrl);
  await repo.update(id, { image_url: null });

  revalidatePath("/");
  revalidatePath("/enrollment");

  return { success: true };
}
