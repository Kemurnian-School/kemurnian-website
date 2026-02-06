"use server";

import { deleteFromStorage } from "@/utils/storage/delete";
import { fasilitasRepository } from "@repository/fasilitas";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Deletes a facility from both the database and storage.
 */
export async function deleteFacility(id: number) {
  if (!id) throw new Error("Missing facility ID");

  const repo = await fasilitasRepository();

  try {
    const record = await repo.getById(id);

    if (!record) throw new Error("Fasilitas not found");

    const imageUrl = record.image_urls;
    const namaSekolah = record.nama_sekolah;

    await deleteFromStorage(imageUrl);
    await repo.deleteFasilitas(id);

    revalidatePath(`/${namaSekolah}`);

    redirect(
      "/admin/fasilitas?success=" +
        encodeURIComponent("Facility deleted successfully"),
    );
  } catch (error) {
    console.error("Failed to delete facility:", error);
    throw new Error("Failed to delete facility");
  }
}
