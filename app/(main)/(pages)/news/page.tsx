export const revalidate = 86400;

import { getNewsData } from "@fetch/news";
import NewsPageClient from "./NewsPageClient";

const ITEMS_PER_PAGE = 12;

export default async function NewsPage() {
  try {
    const allNews = await getNewsData();
    const initialNews = allNews.slice(0, ITEMS_PER_PAGE);

    return (
      <NewsPageClient
        allNews={allNews}
        initialNews={initialNews}
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
