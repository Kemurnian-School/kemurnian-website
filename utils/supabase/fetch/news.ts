import { createClient } from "@/utils/supabase/client";

export async function getNewsData() {
  const supabase = createClient();
  const { data: newsData, error: newsDataError } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false });

  const newsTable = newsDataError ? [] : newsData || [];

  return newsTable;
}

export async function getLatestNewsData() {
  const supabase = createClient();
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
