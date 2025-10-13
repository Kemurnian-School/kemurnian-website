import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

export async function getHeroData() {
  const { data: heroData, error: heroDataError } = await supabase
    .from("hero_sliders")
    .select("*")
    .order("order", { ascending: true });

  const heroImages = heroDataError ? [] : heroData || [];

  return heroImages;
}
