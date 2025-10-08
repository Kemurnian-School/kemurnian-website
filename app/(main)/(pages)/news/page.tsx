export const revalidate = 86400;

import { createClient } from "@/utils/supabase/client";
import NewsList from "./NewsList";

const ITEMS_PER_PAGE = 12;

export default async function NewsPage() {
  const supabase = await createClient();

  try {
    const { data: initialNews, error: newsError } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false })
      .range(0, ITEMS_PER_PAGE - 1);

    if (newsError) throw newsError;

    const hasMore = (initialNews?.length ?? 0) === ITEMS_PER_PAGE;

    return (
      <NewsList
        initialNews={initialNews || []}
        initialHasMore={hasMore}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    );
  } catch (error) {
    console.error("Error fetching initial news:", error);
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">
          Failed to load news. Please refresh the page.
        </p>
      </div>
    );
  }
}
