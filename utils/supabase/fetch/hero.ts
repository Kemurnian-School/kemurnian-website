import { createClient } from "@/utils/supabase/client";

export async function getHeroData() {
  const supabase = createClient();
  const { data: heroData, error: heroDataError } = await supabase
    .from("hero_sliders")
    .select("*")
    .order("order", { ascending: true });

  const heroImages = heroDataError ? [] : heroData || [];

  return heroImages;
}
