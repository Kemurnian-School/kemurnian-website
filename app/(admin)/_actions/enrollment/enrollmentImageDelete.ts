"use server";

import { revalidatePath } from "next/cache";
import { enrollmentRepository } from "@repository/enrollment";
import { deleteFromR2 } from "@/utils/r2/delete";

export async function deleteEnrollmentImage(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing enrollment ID");

  const repo = await enrollmentRepository();
  const imageUrl = await repo.getImageUrl(id);

  if (!imageUrl) throw new Error("No image to delete");

  await deleteFromR2(imageUrl);
  await repo.update(id, { image_url: null });

  revalidatePath("/admin/enrollment");
  revalidatePath("/");
  revalidatePath("/enrollment");

  return { success: true };
}
