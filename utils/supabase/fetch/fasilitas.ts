import { createClient } from "@/utils/supabase/client";

export async function getFasilitasData(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("fasilitas")
    .select("image_urls, title")
    .eq("nama_sekolah", id);

  if (error) {
    throw error;
  }

  return data || [];
}
