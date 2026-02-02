import { SupabaseClient } from '@supabase/supabase-js';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import {
  SeedConfig,
  shouldSkipSeeding,
  loadJsonData,
  uploadToMinio,
  validateFile,
  logDbResult
} from '../utils/seed-helpers';

interface FasilitasData {
  title: string;
  filename: string;
  nama_sekolah: string;
  order: number;
}

const IMAGES_DIR = path.join(process.cwd(), './scripts/images/fasilitas');
const DATA_PATH = path.join(process.cwd(), './scripts/data/fasilitas.json')

export async function seedFasilitas(
  supabase: SupabaseClient,
  s3: S3Client,
  config: SeedConfig
) {
  console.log('\n--- Seeding Fasilitas ---');

  if (await shouldSkipSeeding(supabase, 'fasilitas')) return;

  const fasilitasList = loadJsonData<FasilitasData>(DATA_PATH);
  if (!fasilitasList) return;

  for(const item of fasilitasList ) {
    const localPath = path.join(IMAGES_DIR, item.filename);

    if (!validateFile(localPath, item.filename)) continue;

    const uploadedUrl = await uploadToMinio({
      s3,
      config,
      localFilePath: localPath,
      s3Folder: 'fasilitas',
      title: item.title,
    });

    if (!uploadedUrl) continue;

    const { error } = await supabase.from('fasilitas').insert({
      title: item.title,
      image_urls: item.filename,
      nama_sekolah: item.nama_sekolah,
      order: item.order
    });

    logDbResult(error, `Seeded: ${item.title}`)
  }

}
