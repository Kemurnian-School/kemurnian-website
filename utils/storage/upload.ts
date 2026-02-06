"use server";

import { getStorageClient } from "@/utils/storage/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.STORAGE_BUCKET_NAME!;
const CDN_URL = process.env.STORAGE_CDN!;

/**
 * A Universal storage upload function
 *
 * @param file - The File object to upload
 * @param folder - Folder name
 * @param options - Optional params like subfolder, device type, or custom filename
 * @returns CDN URL of the uploaded file
 */
export async function uploadToStorage(
  file: File | null,
  folder: string,
  options?: {
    subfolder?: string;
    filenamePrefix?: string;
  },
): Promise<string | null> {
  if (!file) return null;

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

  // for subfolder (example: "hero-banners/desktop")
  const subpath = options?.subfolder
    ? `${folder}/${options.subfolder}`
    : folder;

  const filename = `${subpath}/${options?.filenamePrefix ?? ""}${timestamp}_${sanitizedName}`;

  const storage = getStorageClient();
  const arrayBuffer = await file.arrayBuffer();

  await storage.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: filename,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${CDN_URL}/${filename}`;
}
