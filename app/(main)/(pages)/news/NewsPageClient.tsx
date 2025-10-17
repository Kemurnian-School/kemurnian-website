"use client";
import { useState } from "react";
import NewsPreview from "@component/NewsPreview";
import LoadMoreNews from "./LoadMoreNews";

interface NewsPageClientProps {
  allNews: any[];
  initialNews: any[];
  itemsPerPage: number;
}

export default function NewsPageClient({
  allNews,
  initialNews,
  itemsPerPage,
}: NewsPageClientProps) {
  const [displayedNews, setDisplayedNews] = useState(initialNews);
  const [currentCount, setCurrentCount] = useState(initialNews.length);

  const hasMore = currentCount < allNews.length;

  const loadMore = async () => {
    const newCount = Math.min(currentCount + itemsPerPage, allNews.length);
    setDisplayedNews(allNews.slice(0, newCount));
    setCurrentCount(newCount);
  };

  return (
    <>
      <NewsPreview news={displayedNews} />
      <LoadMoreNews loadMoreAction={loadMore} hasMore={hasMore} />
    </>
  );
}
