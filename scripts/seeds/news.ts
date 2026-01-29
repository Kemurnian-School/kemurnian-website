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

interface NewsData {
  title: string;
  date: string;
  filename: string;
  body: string;
  from: string;
}

const IMAGES_DIR = path.join(process.cwd(), './scripts/images/news');
const DATA_PATH = path.join(process.cwd(), './scripts/data/news.json');

export async function seedNews(
  supabase: SupabaseClient,
  s3: S3Client,
  config: SeedConfig
) {
  console.log('\n--- Seeding News ---');

  if (await shouldSkipSeeding(supabase, 'news')) return;

  const newsList = loadJsonData<NewsData>(DATA_PATH);
  if (!newsList) return;

  for (const item of newsList) {
    const localPath = path.join(IMAGES_DIR, item.filename);

    if (!validateFile(localPath, item.filename)) continue;

    const uploadedUrl = await uploadToMinio({
      s3,
      config,
      localFilePath: localPath,
      s3Folder: 'news',
      title: item.title,
      date: item.date,
    });

    if (!uploadedUrl) continue;

    const { error } = await supabase.from('news').insert({
      title: item.title,
      body: item.body,
      date: item.date,
      from: item.from,
      image_urls: [uploadedUrl],
      embed: null,
    });

    logDbResult(error, `Seeded: ${item.title}`);
  }
}
