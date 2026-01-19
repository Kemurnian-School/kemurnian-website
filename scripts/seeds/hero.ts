import { SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

// Type definition for the configuration object
interface SeedConfig {
    bucketName: string;
    cdnUrl: string;
}

// Internal Directory Paths (Specific to this seed)
const DESKTOP_DIR = path.join(process.cwd(), './scripts/images/hero/desktop');
const MOBILE_DIR = path.join(process.cwd(), './scripts/images/hero/mobile');

/**
 * Helper: Uploads a file to Minio/S3
 */
async function uploadToMinio(
    s3: S3Client,
    config: SeedConfig,
    fullPath: string, 
    s3Folder: string
): Promise<string | null> {
    if (!fs.existsSync(fullPath)) return null;

    const filename = path.basename(fullPath);
    const fileBuffer = fs.readFileSync(fullPath);
    const mimeType = mime.lookup(filename) || 'application/octet-stream';

    // Construct S3 Key: folder/timestamp_filename
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const objectKey = `${s3Folder}/${timestamp}_${sanitizedName}`;

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
        console.error(`❌ Upload failed for ${filename}:`, error);
        return null;
    }
}

/**
 * Main Hero Seed Function
 */
export async function seedHero(
    supabase: SupabaseClient, 
    s3: S3Client, 
    config: SeedConfig
) {
    console.log('\n--- Checking Hero Banners ---');

    const { count, error: checkError } = await supabase
        .from('hero_sliders')
        .select('*', { count: 'exact', head: true });

    if (checkError) {
        console.error(`❌ Error checking existing data: ${checkError.message}`);
        return;
    }

    if (count !== null && count > 0) {
        console.log(`⚠️  Skipping seed: 'hero_sliders' already contains ${count} records.`);
        return;
    }

    console.log('--- Starting Seeding Process for Hero ---');

    if (!fs.existsSync(DESKTOP_DIR)) {
        console.error(`❌ Directory not found: ${DESKTOP_DIR}`);
        return;
    }

    const desktopFiles = fs.readdirSync(DESKTOP_DIR).filter(file => file.endsWith('.webp'));

    if (desktopFiles.length === 0) {
        console.warn("⚠️  No .webp files found in images/desktop");
        return;
    }

    console.log(`Found ${desktopFiles.length} desktop images. Processing...`);

    for (const [index, filename] of desktopFiles.entries()) {
        console.log(`   Processing: ${filename}`);

        const desktopPath = path.join(DESKTOP_DIR, filename);
        const mobilePath = path.join(MOBILE_DIR, filename);

        // Upload Desktop Image
        const desktopUrl = await uploadToMinio(s3, config, desktopPath, 'hero-banners/desktop');

        // Upload Mobile Image (if exists)
        let mobileUrl: string | null = null;
        if (fs.existsSync(mobilePath)) {
            mobileUrl = await uploadToMinio(s3, config, mobilePath, 'hero-banners/mobile');
        } else {
            console.warn(`      (No matching mobile image found for ${filename}, using null)`);
        }

        if (!desktopUrl) continue;

        // Generate dummy text
        const title = filename.replace('.webp', '').replace(/[-_]/g, ' ');
        const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

        // Insert into DB
        const { error } = await supabase.from('hero_sliders').insert({
            header_text: `Welcome to ${capitalizedTitle}`,
            button_text: 'Learn More',
            href_text: '#',
            image_urls: desktopUrl,
            tablet_image_urls: mobileUrl,
            mobile_image_urls: mobileUrl,
            order: index + 1,
        });

        if (error) {
            console.error(`   ❌ DB Insert Error: ${error.message}`);
        } else {
            console.log(`   ✅ Created Hero Banner #${index + 1}`);
        }
    }
}
