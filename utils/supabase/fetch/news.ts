import { createClient } from "@/utils/supabase/client";

export async function getNewsData(filterFrom?: string[]) {
  const supabase = createClient();
  let query = supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false });

  if (filterFrom?.length) {
    query = query.in("from", filterFrom);
  }

  const { data, error } = await query;
  return error ? [] : data || [];
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

// fetch single record instead of all
export async function getSingleNews(id: string) {
  const supabase = createClient();
  return await supabase.from("news").select("*").eq("id", id).single();
}
