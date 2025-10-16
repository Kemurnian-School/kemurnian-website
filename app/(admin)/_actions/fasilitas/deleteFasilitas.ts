"use server";

import { revalidatePath } from "next/cache";
import { deleteFromR2 } from "@/utils/r2/delete";
import { fasilitasRepository } from "@repository/fasilitas";

/**
 * Deletes a facility from both the database and R2 storage.
 */
export async function deleteFacility(id: number) {
  if (!id) throw new Error("Missing facility ID");

  const repo = await fasilitasRepository();

  try {
    // Delete from DB and get storage path
    const { storage_path } = await repo.deleteById(id);

    // Delete the file from R2
    if (storage_path) {
      await deleteFromR2(`${process.env.R2_CDN}/${storage_path}`);
    }

    // Revalidate related paths
    revalidatePath("/admin/fasilitas");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete facility:", error);
    throw new Error("Failed to delete facility");
  }
}
