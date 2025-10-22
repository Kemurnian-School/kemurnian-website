"use server";

import { revalidatePath } from "next/cache";
import { kurikulumRepository } from "@repository/kurikulum";

export async function updateKurikulum(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const preview = (formData.get("preview") as string) || null;

  if (!id || !title || !body)
    throw new Error("ID, title, and body are required");

  try {
    const repo = await kurikulumRepository();
    await repo.updateKurikulum({ id, title, body, preview });

    revalidatePath("/admin/kurikulum");
    revalidatePath(`/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
}
