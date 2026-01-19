import { SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

interface SeedConfig {
    bucketName: string;
    cdnUrl: string;
}

interface HeroSlideData {
    filename: string;
    header_text: string;
    button_text: string;
    href_text: string;
}

const DESKTOP_DIR = path.join(process.cwd(), './scripts/images/hero/desktop');
const MOBILE_DIR = path.join(process.cwd(), './scripts/images/hero/mobile');
const DATA_PATH = path.join(process.cwd(), './scripts/data/hero.json');

async function uploadToMinio(s3: S3Client, config: SeedConfig, fullPath: string, s3Folder: string): Promise<string | null> {
    if (!fs.existsSync(fullPath)) return null;

    const filename = path.basename(fullPath);
    const fileBuffer = fs.readFileSync(fullPath);
    const mimeType = mime.lookup(filename) || 'application/octet-stream';
    
    // Create unique key: folder/timestamp_filename
    const objectKey = `${s3Folder}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

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

export async function seedHero(supabase: SupabaseClient, s3: S3Client, config: SeedConfig) {
    console.log('\n--- Seeding Hero ---');

    // Check if data exists to prevent duplication
    const { count } = await supabase.from('hero_sliders').select('*', { count: 'exact', head: true });
    if (count && count > 0) {
        console.log(`⚠️  Skipping: 'hero_sliders' already has ${count} records.`);
        return;
    }

    // Load JSON Data
    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌ Missing data file: ${DATA_PATH}`);
        return;
    }
    const heroData: HeroSlideData[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

    // Insert data
    for (const [index, item] of heroData.entries()) {
        const desktopPath = path.join(DESKTOP_DIR, item.filename);
        const mobilePath = path.join(MOBILE_DIR, item.filename);

        if (!fs.existsSync(desktopPath)) {
            console.error(`❌ Image missing: ${item.filename}`);
            continue;
        }

        const desktopUrl = await uploadToMinio(s3, config, desktopPath, 'hero-banners/desktop');
        const mobileUrl = fs.existsSync(mobilePath) 
            ? await uploadToMinio(s3, config, mobilePath, 'hero-banners/mobile') 
            : null;

        if (!desktopUrl) continue;

        const { error } = await supabase.from('hero_sliders').insert({
            header_text: item.header_text,
            button_text: item.button_text,
            href_text: item.href_text,
            image_urls: desktopUrl,
            tablet_image_urls: mobileUrl, // Fallback to mobile image for tablet
            mobile_image_urls: mobileUrl,
            order: index + 1,
        });

        if (error) console.error(`❌ DB Error (${item.filename}): ${error.message}`);
        else console.log(`✅ Seeded: ${item.filename}`);
    }
}
