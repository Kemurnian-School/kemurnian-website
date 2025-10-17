"use client";
import { useState, useTransition } from "react";

interface LoadMoreNewsProps {
  loadMoreAction: () => Promise<void>;
  hasMore: boolean;
}

export default function LoadMoreNews({
  loadMoreAction,
  hasMore,
}: LoadMoreNewsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleLoadMore = () => {
    setError(null);
    startTransition(async () => {
      try {
        await loadMoreAction();
      } catch (err) {
        console.error("Error loading more news:", err);
        setError("Failed to load more news. Please try again.");
      }
    });
  };

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleLoadMore}
          className="px-6 py-2 bg-[#8b0000] text-white rounded hover:bg-[#660000] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!hasMore) {
    return null;
  }

  return (
    <div className="text-center mt-8">
      <button
        onClick={handleLoadMore}
        disabled={isPending}
        className="font-raleway font-bold tracking-wide px-8 py-3 mb-10 rounded-full border-2 border-[#8b0000] bg-[#8b0000] text-white hover:bg-transparent hover:text-[#8b0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? "LOADING..." : "LOAD MORE"}
      </button>
    </div>
  );
}
