"use server";

import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/utils/r2/upload";
import { deleteFromR2 } from "@/utils/r2/delete";
import { fasilitasRepository } from "@repository/fasilitas";
import type { FasilitasRecord } from "@/utils/supabase/models/fasilitas";

/**
 * Upload multiple facility images per school.
 * Handles both upload and DB insert, with rollback on failure.
 */
export async function uploadFacilities(formData: FormData) {
  const namaSekolah = formData.get("nama_sekolah") as string;
  if (!namaSekolah) throw new Error("School selection is required");

  const files = formData.getAll("images") as File[];
  const titles = formData.getAll("titles") as string[];

  if (files.length === 0 || titles.length === 0)
    throw new Error("At least one image with title is required");

  if (files.length !== titles.length)
    throw new Error("Number of images and titles must match");

  // School mapping (slug → readable folder name)
  const folderMapping: Record<string, string> = {
    "sekolah-kemurnian-1": "Sekolah Kemurnian I",
    "sekolah-kemurnian-2": "Sekolah Kemurnian II",
    "sekolah-kemurnian-3": "Sekolah Kemurnian III",
  };

  const folderName = folderMapping[namaSekolah];
  if (!folderName) throw new Error("Invalid school selection");

  const repo = await fasilitasRepository();
  const uploadedFacilities: FasilitasRecord[] = [];

  try {
    // Upload each file to R2 and prepare DB records
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i];

      if (!file || !title || title.trim() === "") continue;

      const uploadedUrl = await uploadToR2(file, "fasilitas", {
        subfolder: folderName,
        filenamePrefix: `${Date.now()}_${i}_`,
      });

      if (!uploadedUrl) throw new Error(`Failed to upload ${file.name}`);

      uploadedFacilities.push({
        nama_sekolah: namaSekolah,
        title: title.trim(),
        image_urls: uploadedUrl,
        storage_path: uploadedUrl.replace(`${process.env.R2_CDN}/`, ""),
      });
    }

    if (uploadedFacilities.length === 0)
      throw new Error("No valid facilities to insert");

    // Insert metadata into Supabase
    await repo.createMany(uploadedFacilities);

    // Revalidate page
    revalidatePath("/admin/fasilitas");

    return {
      success: true,
      facilitiesCount: uploadedFacilities.length,
      school: folderName,
    };
  } catch (error) {
    console.error("Upload failed:", error);

    // Rollback: delete already uploaded files
    await Promise.all(
      uploadedFacilities.map((f) => deleteFromR2(f.image_urls)),
    );

    throw new Error(
      "Upload failed — all uploaded files have been rolled back.",
    );
  }
}
