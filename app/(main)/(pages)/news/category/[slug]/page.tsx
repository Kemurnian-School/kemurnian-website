export const revalidate = 604800;

import { getNewsData } from "@fetch/news";
import { notFound } from "next/navigation";
import NewsPageClient from "../../NewsPageClient";

const ITEMS_PER_PAGE = 12;

const CATEGORY_FILTERS: Record<string, string[]> = {
  "sekolah-kemurnian": ["TK Kemurnian", "SD Kemurnian", "SMP Kemurnian"],
  "sekolah-kemurnian-ii": [
    "TK Kemurnian II",
    "SD Kemurnian II",
    "SMP Kemurnian II",
  ],
  "sekolah-kemurnian-iii": ["TK Kemurnian III", "SD Kemurnian III"],
};

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryNewsPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const filterValues = CATEGORY_FILTERS[slug];

  if (!filterValues) notFound();

  try {
    const filteredNews = await getNewsData(filterValues);
    const initialNews = filteredNews.slice(0, ITEMS_PER_PAGE);

    return (
      <NewsPageClient
        allNews={filteredNews}
        initialNews={initialNews}
        itemsPerPage={ITEMS_PER_PAGE}
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
