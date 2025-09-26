"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import NewsPreview from "@/app/(main)/components/NewsPreview";

interface NewsClientProps {
  initialNews: any[];
  initialHasMore: boolean;
}

export default function NewsClient({
  initialNews,
  initialHasMore,
}: NewsClientProps) {
  const [news, setNews] = useState<any[]>(initialNews);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [offset, setOffset] = useState(initialNews.length);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 12;
  const supabase = createClient();

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (newsError) throw newsError;

      if (newsData) {
        setNews((prev) => [...prev, ...newsData]);
        setHasMore(newsData.length === ITEMS_PER_PAGE);
        setOffset((prev) => prev + newsData.length);
      }
    } catch (err) {
      console.error("Error loading more news:", err);
      setError("Failed to load more news. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const retryLoadMore = () => {
    setError(null);
    loadMore();
  };

  return (
    <>
      <NewsPreview news={news} />

      {error && (
        <div className="text-center mt-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={retryLoadMore}
            className="px-6 py-2 bg-[#8b0000] text-white rounded hover:bg-[#660000] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {hasMore && !error && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 rounded-full border-2 border-[#8b0000] bg-[#8b0000] text-white hover:bg-transparent hover:text-[#8b0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? "LOADING..." : "LOAD MORE NEWS"}
          </button>
        </div>
      )}
    </>
  );
}
