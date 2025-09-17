"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function uploadFacilities(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  const namaSekolah = formData.get("nama_sekolah") as string;

  if (!namaSekolah) throw new Error("School selection is required");

  const files = formData.getAll("images") as File[];
  const titles = formData.getAll("titles") as string[];

  if (files.length === 0 || titles.length === 0) {
    throw new Error("At least one image with title is required");
  }

  if (files.length !== titles.length) {
    throw new Error("Number of images and titles must match");
  }

  // Determine folder name based on nama_sekolah value
  const folderMapping: { [key: string]: string } = {
    "sekolah-kemurnian-1": "Sekolah Kemurnian I",
    "sekolah-kemurnian-2": "Sekolah Kemurnian II",
    "sekolah-kemurnian-3": "Sekolah Kemurnian III",
  };

  const folderName = folderMapping[namaSekolah];
  if (!folderName) throw new Error("Invalid school selection");

  const facilitiesToInsert = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const title = titles[i];

    if (!file || file.size === 0) continue;
    if (!title || title.trim() === "") continue;

    const timestamp = Date.now();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9.-]/g, "_");
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${folderName}/${timestamp}_${i}_${sanitizedTitle}_${sanitizedName}`;

    // Upload image to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("fasilitas")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`Upload error for ${filename}:`, uploadError);
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("fasilitas").getPublicUrl(filename);

    // Prepare data for database insertion
    facilitiesToInsert.push({
      nama_sekolah: namaSekolah,
      title: title.trim(),
      image_urls: publicUrl,
      storage_path: filename,
    });
  }

  if (facilitiesToInsert.length === 0) {
    throw new Error("No valid facilities to insert");
  }

  // Insert all facilities into database
  const { error: insertError } = await supabase
    .from("fasilitas")
    .insert(facilitiesToInsert);

  if (insertError) {
    console.error("Insert error:", insertError);

    // If database insert fails, clean up uploaded files
    for (const facility of facilitiesToInsert) {
      await supabase.storage.from("fasilitas").remove([facility.storage_path]);
    }

    throw new Error(`Failed to save facilities: ${insertError.message}`);
  }

  revalidatePath("/admin/facilities");

  return {
    success: true,
    facilitiesCount: facilitiesToInsert.length,
    school: folderName,
  };
}
