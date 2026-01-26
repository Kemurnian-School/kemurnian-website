import { SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface KurikulumSeedData {
    title: string;
    body: string;
    order: number;
    preview: string | null;
}

const DATA_PATH = path.join(process.cwd(), './scripts/data/kurikulum.json');

export async function seedKurikulum(supabase: SupabaseClient) {
    console.log('\n--- Seeding Kurikulum ---');

    // Check if data exists to prevent duplication
    const { count, error: checkError } = await supabase
        .from('kurikulum')
        .select('*', { count: 'exact', head: true });

    if (checkError) {
        console.error(`❌ Error checking kurikulum: ${checkError.message}`);
        return;
    }

    if (count !== null && count > 0) {
        console.log(`⚠️  Skipping: 'kurikulum' already contains ${count} records.`);
        return;
    }

    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌ Missing data file: ${DATA_PATH}`);
        return;
    }

    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    let kurikulumData: KurikulumSeedData[] = [];

    try {
        const parsed = JSON.parse(rawData);
        kurikulumData = parsed.map((item: any) => ({
            title: item.title,
            body: item.body,
            order: item.order,
            preview: item.preview || null
        }));
    } catch (e) {
        console.error("❌ Error parsing kurikulum.json");
        return;
    }

    console.log(`Found ${kurikulumData.length} items. Inserting...`);

    const { error } = await supabase
        .from('kurikulum')
        .insert(kurikulumData);

    if (error) {
        console.error(`❌ Insert Error: ${error.message}`);
    } else {
        console.log(`✅ Successfully seeded ${kurikulumData.length} kurikulum records.`);
    }
}
