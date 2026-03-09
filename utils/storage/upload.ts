"use server";

import * as ftp from "basic-ftp";
import { Readable } from "stream";

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

  const subpath = options?.subfolder
    ? `${folder}/${options.subfolder}`
    : folder;

  const exactFilename = `${options?.filenamePrefix ?? ""}${timestamp}_${sanitizedName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASSWORD!,
      secure: false, 
    });

    const targetDirectory = `contents/${subpath}`;
    await client.ensureDir(targetDirectory);

    await client.uploadFrom(stream, exactFilename);

    return `${process.env.STORAGE_CDN}/contents/${subpath}/${exactFilename}`;

  } catch (error) {
    console.error("FTP Upload failed:", error);
    throw error;
  } finally {
    client.close();
  }
}
