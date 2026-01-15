import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mime from 'mime-types';

// Load environment variables
dotenv.config({ path: '.env.local' });

// --- CONFIGURATION ---

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'kemurnian-bucket';

// Minio / S3 Config
const R2_ENDPOINT = 'http://127.0.0.1:9000';
const CDN_URL = process.env.R2_CDN || `${R2_ENDPOINT}/${BUCKET_NAME}`;

const DESKTOP_DIR = path.join(process.cwd(), './scripts/images/hero/desktop');
const MOBILE_DIR = path.join(process.cwd(), './scripts/images/hero/mobile');

// --- CLIENT INITIALIZATION ---

if (!SUPABASE_SERVICE_ROLE_KEY) {
	console.error("❌ MISSING: SUPABASE_SERVICE_ROLE_KEY in .env.local");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { autoRefreshToken: false, persistSession: false },
});

const s3 = new S3Client({
	region: 'us-east-1',
	endpoint: R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || 'minioadmin',
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'minioadmin',
	},
	forcePathStyle: true,
});

// --- HELPER FUNCTIONS ---

/**
 * Uploads a file from a specific path to Minio
 */
async function uploadToMinio(fullPath: string, s3Folder: string): Promise<string | null> {
	if (!fs.existsSync(fullPath)) {
		return null;
	}

	const filename = path.basename(fullPath);
	const fileBuffer = fs.readFileSync(fullPath);
	const mimeType = mime.lookup(filename) || 'application/octet-stream';

	// Construct S3 Key: folder/timestamp_filename
	const timestamp = Date.now();
	const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
	const objectKey = `${s3Folder}/${timestamp}_${sanitizedName}`;

	try {
		await s3.send(new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: objectKey,
			Body: fileBuffer,
			ContentType: mimeType,
			CacheControl: "public, max-age=31536000, immutable",
		}));

		return `${CDN_URL}/${objectKey}`;
	} catch (error) {
		console.error(`❌ Upload failed for ${filename}:`, error);
		return null;
	}
}

// --- SEEDING LOGIC ---

async function seedHero() {
	console.log('\n--- Seeding Hero Banners ---');

	// 1. Get all webp files from desktop folder
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

		// Define Paths
		const desktopPath = path.join(DESKTOP_DIR, filename);
		const mobilePath = path.join(MOBILE_DIR, filename);

		// 2. Upload to Minio
		const desktopUrl = await uploadToMinio(desktopPath, 'hero-banners/desktop');

		// Attempt mobile upload (if file exists)
		let mobileUrl: string | null = null;
		if (fs.existsSync(mobilePath)) {
			mobileUrl = await uploadToMinio(mobilePath, 'hero-banners/mobile');
		} else {
			console.warn(`      (No matching mobile image found for ${filename}, using null)`);
		}

		if (!desktopUrl) continue;

		// 3. Generate dummy text based on filename
		// e.g. "slide_1.webp" -> "Slide 1"
		const title = filename.replace('.webp', '').replace(/[-_]/g, ' ');
		const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

		// 4. Insert into Database
		const { error } = await supabase.from('hero_sliders').insert({
			header_text: `Welcome to ${capitalizedTitle}`,
			button_text: 'Learn More',
			href_text: '#',
			image_urls: desktopUrl,
			tablet_image_urls: mobileUrl, // Using mobile image for tablet as fallback?
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

// --- MAIN ---

async function main() {
	try {
		await seedHero();
		console.log('\n✨ Seeding complete!');
	} catch (e) {
		console.error('Fatal Error:', e);
		process.exit(1);
	}
}

main();
