import { SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export interface SeedConfig {
  bucketName: string;
  cdnUrl: string;
}

interface UploadOptions {
  s3: S3Client;
  config: SeedConfig;
  localFilePath: string;
  s3Folder: string;
  title?: string;
  date?: string;
}

/**
 * Checks if a table already has data to prevent duplicate seeding
 */
export async function shouldSkipSeeding(
  supabase: SupabaseClient,
  tableName: string
): Promise<boolean> {
  const { count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log(`⚠️  Skipping: '${tableName}' already has ${count} records.`);
    return true;
  }
  return false;
}

/**
 * Loads and parses JSON data file
 */
export function loadJsonData<T>(dataPath: string): T[] | null {
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Missing data file: ${dataPath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

/**
 * Sanitizes filename/title for S3 object keys
 */
function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Generates S3 object key with optional date-based folder structure
 */
function generateObjectKey(
  baseFolder: string,
  filename: string,
  options?: { title?: string; date?: string }
): string {
  const sanitizedFilename = sanitize(filename);
  const timestamp = Date.now();

  if (options?.date && options?.title) {
    const dateObj = new Date(options.date);
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const sanitizedTitle = sanitize(options.title);
    return `${baseFolder}/${year}/${month}/${sanitizedTitle}/${timestamp}_${sanitizedFilename}`;
  }

  return `${baseFolder}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Uploads a file to MinIO/S3 and returns the CDN URL
 */
export async function uploadToMinio(options: UploadOptions): Promise<string | null> {
  const { s3, config, localFilePath, s3Folder, title, date } = options;

  if (!fs.existsSync(localFilePath)) {
    console.error(`❌ File not found: ${localFilePath}`);
    return null;
  }

  const filename = path.basename(localFilePath);
  const fileBuffer = fs.readFileSync(localFilePath);
  const mimeType = mime.lookup(filename) || 'application/octet-stream';
  const objectKey = generateObjectKey(s3Folder, filename, { title, date });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return `${config.cdnUrl}/${objectKey}`;
  } catch (error) {
    console.error(`❌ Upload failed: ${filename}`, error);
    return null;
  }
}

/**
 * Checks if a local file exists and logs error if missing
 */
export function validateFile(filePath: string, identifier: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Image missing: ${identifier}`);
    return false;
  }
  return true;
}

/**
 * Logs database insertion errors
 */
export function logDbResult(error: any, successMessage: string) {
  if (error) {
    console.error(`❌ DB Error: ${error.message}`);
  } else {
    console.log(`✅ ${successMessage}`);
  }
}
