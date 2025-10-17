"use server";

import { getNewsData } from "@fetch/news";

export async function getFilteredNews(filter?: string[]) {
  try {
    const allNews = await getNewsData();

    if (filter && filter.length > 0) {
      return allNews.filter((item) => filter.includes(item.from));
    }

    return allNews;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}
