import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { seedHero } from './seeds/hero';

dotenv.config({ path: '.env.local' });

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'kemurnian-bucket';

const R2_ENDPOINT = 'http://127.0.0.1:9000';
const CDN_URL = process.env.R2_CDN || `${R2_ENDPOINT}/${BUCKET_NAME}`;

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

// --- MAIN ---
async function main() {
    console.log('🌱 Starting Database Seed...');
    console.log(`   Target Bucket: ${BUCKET_NAME}`);

    try {
        await seedHero(supabase, s3, { bucketName: BUCKET_NAME, cdnUrl: CDN_URL });
        console.log('\n✨ All seeding processes complete!');
    } catch (e) {
        console.error('Fatal Error during seeding:', e);
        process.exit(1);
    }
}

main();
