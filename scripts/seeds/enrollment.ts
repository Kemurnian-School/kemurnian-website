import { SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

interface SeedConfig {
  bucketName: string;
  cdnUrl: string;
}

interface EnrollmentData {
  title: string;
  date: string;
  filename: string;
  body: string;
}

const IMAGES_DIR = path.join(process.cwd(), './scripts/images/enrollment');
const DATA_PATH = path.join(process.cwd(), './scripts/data/enrollment.json');

async function uploadToMinio(
  s3: S3Client,
  config: SeedConfig,
  localFilePath: string,
  enrollmentTitle: string,
  enrollmentDate: string
): Promise<string | null> {
  if (!fs.existsSync(localFilePath)) return null;

  const filename = path.basename(localFilePath);
  const fileBuffer = fs.readFileSync(localFilePath);
  const mimeType = mime.lookup(filename) || 'application/octet-stream';

  const dateObj = new Date(enrollmentDate);
  const year = dateObj.getFullYear();
  const month = dateObj.toLocaleString("default", { month: "long" });
  const sanitizedTitle = enrollmentTitle.replace(/[^a-zA-Z0-9.-]/g, "_");
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  const objectKey = `enrollment/${year}/${month}/${sanitizedTitle}/${Date.now()}_${sanitizedFilename}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return `${config.cdnUrl}/${objectKey}`;
  } catch (error) {
    console.error(`❌ Upload failed: ${filename}`, error);
    return null;
  }
}

export async function seedEnrollment(supabase: SupabaseClient, s3: S3Client, config: SeedConfig) {
  console.log('\n--- Seeding enrollment ---');

  const { count } = await supabase.from('enrollment').select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    console.log(`⚠️  Skipping: 'enrollment' already has ${count} records.`);
    return;
  }

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`❌ Missing data file: ${DATA_PATH}`);
    return;
  }
  
  const enrollmentList: EnrollmentData[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  for (const item of enrollmentList) {
    const localPath = path.join(IMAGES_DIR, item.filename);

    if (!fs.existsSync(localPath)) {
      console.error(`❌ Image missing: ${item.filename}`);
      continue;
    }

    const uploadedUrl = await uploadToMinio(s3, config, localPath, item.title, item.date);
    
    if (!uploadedUrl) continue;

    const { error } = await supabase.from('enrollment').insert({
      title: item.title,
      body: item.body,
      date: item.date,
      image_url: uploadedUrl,
    });

    if (error) console.error(`❌ DB Error (${item.title}): ${error.message}`);
    else console.log(`✅ Seeded: ${item.title}`);
  }
}

