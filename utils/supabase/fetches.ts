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

export async function getKurikulumData() {
  const { data: kurikulumData, error: kurikulumDataError } = await supabase
    .from("kurikulum")
    .select("*")
    .order("order", { ascending: true })

  const kurikulumTable = kurikulumDataError ? [] : kurikulumData || [];

  return kurikulumTable;
}

export async function getNewsData() {
  const { data: newsData, error: newsDataError } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false })

  const newsTable = newsDataError ? [] : newsData || [];

  return newsTable;
}

export async function getLatestNewsData() {
  try {
    const { data: latestNews } = await supabase
      .from("news")
      .select("date")
      .order("date", { ascending: false })
      .limit(1);

    const latestDate = latestNews?.[0]?.date
      ? new Date(latestNews[0].date)
      : null;

    if (!latestDate) {
      const { data: fallbackNews } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .limit(9);
      return fallbackNews || [];
    }

    const twoYearsBefore = new Date(latestDate);
    twoYearsBefore.setFullYear(latestDate.getFullYear() - 2);
    const cutoffDate = twoYearsBefore.toISOString().split("T")[0];

    const { data: recentNews } = await supabase
      .from("news")
      .select("*")
      .gte("date", cutoffDate)
      .order("date", { ascending: false })
      .limit(9);

    return recentNews || [];
  } catch {
    return [];
  }
}

export async function getEnrollmentData() {
  const { data: enrollmentData, error: enrollmentDataError } = await supabase
    .from("enrollment")
    .select("*")
    .single()

  const enrollmentTable = enrollmentDataError ? [] : enrollmentData || [];

  return enrollmentTable;
}
