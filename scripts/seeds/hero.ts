import { SupabaseClient } from '@supabase/supabase-js';
import { S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import {
  SeedConfig,
  shouldSkipSeeding,
  loadJsonData,
  uploadToMinio,
  validateFile,
  logDbResult,
} from '../utils/seed-helpers';

interface HeroSlideData {
  filename: string;
  header_text: string;
  button_text: string;
  href_text: string;
}

const DESKTOP_DIR = path.join(process.cwd(), './scripts/images/hero/desktop');
const MOBILE_DIR = path.join(process.cwd(), './scripts/images/hero/mobile');
const DATA_PATH = path.join(process.cwd(), './scripts/data/hero.json');

export async function seedHero(
  supabase: SupabaseClient,
  s3: S3Client,
  config: SeedConfig
) {
  console.log('\n--- Seeding Hero ---');

  if (await shouldSkipSeeding(supabase, 'hero_sliders')) return;

  const heroData = loadJsonData<HeroSlideData>(DATA_PATH);
  if (!heroData) return;

  for (const [index, item] of heroData.entries()) {
    const desktopPath = path.join(DESKTOP_DIR, item.filename);
    const mobilePath = path.join(MOBILE_DIR, item.filename);

    if (!validateFile(desktopPath, item.filename)) continue;

    const desktopUrl = await uploadToMinio({
      s3,
      config,
      localFilePath: desktopPath,
      s3Folder: 'hero-banners/desktop',
    });

    const mobileUrl = fs.existsSync(mobilePath)
      ? await uploadToMinio({
          s3,
          config,
          localFilePath: mobilePath,
          s3Folder: 'hero-banners/mobile',
        })
      : null;

    if (!desktopUrl) continue;

    const { error } = await supabase.from('hero_sliders').insert({
      header_text: item.header_text,
      button_text: item.button_text,
      href_text: item.href_text,
      image_urls: desktopUrl,
      tablet_image_urls: mobileUrl,
      mobile_image_urls: mobileUrl,
      order: index + 1,
    });

    logDbResult(error, `Seeded: ${item.filename}`);
  }
}
