import { SupabaseClient } from '@supabase/supabase-js';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import {
  SeedConfig,
  shouldSkipSeeding,
  loadJsonData,
  uploadToMinio,
  validateFile,
  logDbResult,
} from '../utils/seed-helpers';

interface EnrollmentData {
  title: string;
  date: string;
  filename: string;
  body: string;
}

const IMAGES_DIR = path.join(process.cwd(), './scripts/images/enrollment');
const DATA_PATH = path.join(process.cwd(), './scripts/data/enrollment.json');

export async function seedEnrollment(
  supabase: SupabaseClient,
  s3: S3Client,
  config: SeedConfig
) {
  console.log('\n--- Seeding enrollment ---');

  if (await shouldSkipSeeding(supabase, 'enrollment')) return;

  const enrollmentList = loadJsonData<EnrollmentData>(DATA_PATH);
  if (!enrollmentList) return;

  for (const item of enrollmentList) {
    const localPath = path.join(IMAGES_DIR, item.filename);
    
    if (!validateFile(localPath, item.filename)) continue;

    const uploadedUrl = await uploadToMinio({
      s3,
      config,
      localFilePath: localPath,
      s3Folder: 'enrollment',
      title: item.title,
      date: item.date,
    });

    if (!uploadedUrl) continue;

    const { error } = await supabase.from('enrollment').insert({
      title: item.title,
      body: item.body,
      date: item.date,
      image_url: uploadedUrl,
    });

    logDbResult(error, `Seeded: ${item.title}`);
  }
}
