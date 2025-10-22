"use server";

import { redirect } from "next/navigation";
import { kurikulumRepository } from "@repository/kurikulum";
import { revalidatePath } from "next/cache";

/**
 * Deletes a Kurikulum record by its ID.
 * Uses the authenticated repository layer for consistent access and error handling.
 */
export async function deleteKurikulum(id: number) {
  try {
    const repo = await kurikulumRepository();

    await repo.deleteById(id);

    revalidatePath("/");
    redirect(
      "/admin/kurikulum?success=" +
        encodeURIComponent("Kurikulum deleted successfully"),
    );
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
}
