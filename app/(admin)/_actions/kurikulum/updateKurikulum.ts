"use server";

import { revalidatePath } from "next/cache";
import { kurikulumRepository } from "@repository/kurikulum";

export async function updateKurikulum(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const preview = (formData.get("preview") as string) || null;

  if (!id)
    throw new Error("ID required!");

  try {
    const repo = await kurikulumRepository();
    await repo.updateKurikulum({ id, title, body, preview });

    revalidatePath(`/kurikulum/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
}
