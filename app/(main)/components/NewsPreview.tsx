"use client";
import Image from "next/image";
import { getSnippet } from "@/utils/sanitize";
import type { NewsRecord } from "@models/news";

interface NewsPreviewProps {
  news: NewsRecord[];
}

export default function NewsPreview({ news }: NewsPreviewProps) {
  return (
    <section className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-lg md:max-w-4xl mx-auto px-4">
      {news.map((item) => (
        <a
          key={item.id}
          className="flex flex-col items-center w-[calc(50%-8px)] sm:w-[260px]"
          href={`/news-detail/${item.id}`}
        >
          <Image
            src={item.image_urls[0]}
            alt={item.title}
            width={300}
            height={200}
            className="rounded mb-4 w-32 sm:w-40 md:w-64"
          />
          <div className="text-center">
            <p className="text-[#8B0000] mb-2 font-raleway font-bold text-xs sm:text-sm">
              {new Date(item.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h2 className="font-raleway font-extrabold text-sm sm:text-lg mb-1 leading-tight">
              {item.title}
            </h2>
            <p className="font-merriweather leading-loose tracking-wider font-light text-sm md:text-base">
              {getSnippet(item.body, 8)}
            </p>
          </div>
        </a>
      ))}
    </section>
  );
}
