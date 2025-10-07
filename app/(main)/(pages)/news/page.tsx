import { createClient } from "@/utils/supabase/client";

export const revalidate = 86400;

export default async function NewsPage() {
  const supabase = createClient();
  const { data: initialNews } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false })
    .range(0, 11);

  const hasMore = (initialNews?.length ?? 0) === 12;

  return (
    <NewsClient initialNews={initialNews || []} initialHasMore={hasMore} />
  );
}
