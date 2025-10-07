export const revalidate = 86400;

import { createClient } from "@/utils/supabase/client";
import NewsList from "../../NewsList";
import { notFound } from "next/navigation";

const ITEMS_PER_PAGE = 12;

const CATEGORY_FILTERS: Record<string, string[]> = {
  "sekolah-kemurnian": ["TK Kemurnian", "SD Kemurnian", "SMP Kemurnian"],
  "sekolah-kemurnian-ii": ["TK Kemurnian II", "SD Kemurnian II", "SMP Kemurnian II"],
  "sekolah-kemurnian-iii": ["TK Kemurnian III", "SD Kemurnian III"],
};

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryNewsPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const filterValues = CATEGORY_FILTERS[slug];

  if (!filterValues) {
    notFound();
  }

  const supabase = await createClient();

  try {
    const { data: initialNews, error: newsError } = await supabase
      .from("news")
      .select("*")
      .in("from", filterValues)
      .order("date", { ascending: false })
      .range(0, ITEMS_PER_PAGE - 1);

    if (newsError) throw newsError;

    const hasMore = (initialNews?.length ?? 0) === ITEMS_PER_PAGE;

    return (
      <NewsList
        initialNews={initialNews || []}
        initialHasMore={hasMore}
        itemsPerPage={ITEMS_PER_PAGE}
        filter={filterValues}
      />
    );
  } catch (error) {
    console.error("Error fetching category news:", error);
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">
          Failed to load news. Please refresh the page.
        </p>
      </div>
    );
  }
}
