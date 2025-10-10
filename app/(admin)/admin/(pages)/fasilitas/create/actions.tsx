"use server";
import { revalidatePath } from "next/cache";
import { createClientAuth } from "@/utils/supabase/server";
import { getR2Client } from "@/utils/r2/client";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME!;
const CDN_URL = process.env.R2_CDN!;

export async function uploadFacilities(formData: FormData) {
  const supabase = await createClientAuth();
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

  // Folder mapping
  const folderMapping: { [key: string]: string } = {
    "sekolah-kemurnian-1": "Sekolah Kemurnian I",
    "sekolah-kemurnian-2": "Sekolah Kemurnian II",
    "sekolah-kemurnian-3": "Sekolah Kemurnian III",
  };

  const folderName = folderMapping[namaSekolah];
  if (!folderName) throw new Error("Invalid school selection");

  const r2 = getR2Client();
  const facilitiesToInsert: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const title = titles[i];

    if (!file || file.size === 0) continue;
    if (!title || title.trim() === "") continue;

    const timestamp = Date.now();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9.-]/g, "_");
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `fasilitas/${folderName}/${timestamp}_${i}_${sanitizedTitle}_${sanitizedName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
        })
      );

      const publicUrl = `${CDN_URL}/${key}`;

      facilitiesToInsert.push({
        nama_sekolah: namaSekolah,
        title: title.trim(),
        image_urls: publicUrl,
        storage_path: key,
      });
    } catch (uploadError) {
      console.error(`Upload error for ${key}:`, uploadError);
      throw new Error(`Failed to upload ${file.name}`);
    }
  }

  if (facilitiesToInsert.length === 0) {
    throw new Error("No valid facilities to insert");
  }

  // Insert metadata into Supabase DB
  const { error: insertError } = await supabase
    .from("fasilitas")
    .insert(facilitiesToInsert);

  if (insertError) {
    console.error("Insert error:", insertError);

    // Rollback: delete uploaded files from R2
    for (const facility of facilitiesToInsert) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: facility.storage_path,
          })
        );
      } catch (cleanupError) {
        console.error(`Cleanup failed for ${facility.storage_path}`, cleanupError);
      }
    }

    throw new Error(`Failed to save facilities: ${insertError.message}`);
  }

  revalidatePath("/admin/fasilitas");

  return {
    success: true,
    facilitiesCount: facilitiesToInsert.length,
    school: folderName,
  };
}
