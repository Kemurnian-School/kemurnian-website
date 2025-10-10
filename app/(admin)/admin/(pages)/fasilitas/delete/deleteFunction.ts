"use server";

import { revalidatePath } from "next/cache";
import { createClientAuth } from "@/utils/supabase/server";
import { getR2Client } from "@/utils/r2/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME!;

export async function deleteFacility(id: string) {
  const supabase = await createClientAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  // fetch record to get storage path
  const { data: record, error: selectError } = await supabase
    .from("fasilitas")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (selectError || !record) {
    throw new Error("Facility not found");
  }

  // delete file from R2
  try {
    const r2 = getR2Client();
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: record.storage_path,
      })
    );
    console.log(`Deleted from R2: ${record.storage_path}`);
  } catch (err) {
    console.error("Failed to delete from R2:", err);
  }

  // delete row from DB
  const { error: deleteError } = await supabase
    .from("fasilitas")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(`Failed to delete DB row: ${deleteError.message}`);
  }

  revalidatePath("/admin/fasilitas");

  return { success: true };
}
