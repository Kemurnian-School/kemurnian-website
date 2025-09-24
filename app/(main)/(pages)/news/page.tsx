"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import NewsPreview from "@/app/(main)/components/NewsPreview";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 12;
  const supabase = createClient();

  const fetchNews = async (currentOffset = 0, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .range(currentOffset, currentOffset + ITEMS_PER_PAGE - 1);

      if (newsError) throw newsError;

      if (newsData) {
        if (isLoadMore) setNews((prev) => [...prev, ...newsData]);
        else setNews(newsData);
        setHasMore(newsData.length === ITEMS_PER_PAGE);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news. Please try again.");
      if (!isLoadMore) setNews([]);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchNews(0, false);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const newOffset = offset + ITEMS_PER_PAGE;
      setOffset(newOffset);
      fetchNews(newOffset, true);
    }
  };

  const retryLoad = () => {
    setError(null);
    setOffset(0);
    setHasMore(true);
    fetchNews(0, false);
  };

  return (
    <>
      <div>
        {loading && <div className="p-4 text-center">Loading news...</div>}

        {error && news.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retryLoad}
              className="px-6 py-2 bg-[#8b0000] text-white rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <NewsPreview news={news} />
            {hasMore && (
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
        )}
      </div>
    </>
  );
}
