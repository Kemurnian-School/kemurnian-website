"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import NewsPreview from "@component/NewsPreview";

interface NewsListProps {
  initialNews: any[];
  initialHasMore: boolean;
  itemsPerPage: number;
  filter?: string[];
}

export default function NewsList({
  initialNews,
  initialHasMore,
  itemsPerPage,
  filter,
}: NewsListProps) {
  const [news, setNews] = useState<any[]>(initialNews);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [offset, setOffset] = useState(initialNews.length);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      let query = supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      // Apply filter if provided (for category pages)
      if (filter && filter.length > 0) {
        query = query.in("from", filter);
      }

      const { data: newsData, error: newsError } = await query;

      if (newsError) throw newsError;

      if (newsData) {
        setNews((prev) => [...prev, ...newsData]);
        setHasMore(newsData.length === itemsPerPage);
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
            className="font-raleway font-bold tracking-wide px-8 py-3 mb-10 rounded-full border-2 border-[#8b0000] bg-[#8b0000] text-white hover:bg-transparent hover:text-[#8b0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingMore ? "LOADING..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </>
  );
}
