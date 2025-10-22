export const revalidate = 604800;

import { Metadata } from "next";
import QuillRenderer from "@component/QuillRenderer";
import ImageCardSlider from "@component/ImageCardSlider";
import NewsPreview from "@component/NewsPreview";
import {
  getLatestNewsData,
  getSingleNews,
  getNewsData,
} from "@/utils/supabase/fetch/news";

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const allNews = await getNewsData();
  return allNews.map((n) => ({ id: String(n.id) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { data: news, error } = await getSingleNews(params.id);

  if (error || !news) {
    return {
      title: "News Not Found",
      description: "This news article could not be found.",
    };
  }

  const bodyText = news.body?.replace(/<[^>]*>/g, "") || "";
  const description =
    bodyText.length > 160 ? bodyText.substring(0, 157) + "..." : bodyText;

  const formattedDate = new Date(news.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pageTitle = `${news.title} - News`;

  return {
    title: pageTitle,
    description: description || `News article from ${formattedDate}`,
    openGraph: {
      title: pageTitle,
      description: description || `News article from ${formattedDate}`,
      type: "article",
      publishedTime: news.date,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description || `News article from ${formattedDate}`,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { data: news, error } = await getSingleNews(params.id);

  if (error || !news) {
    return <div className="p-4 text-red-600">Failed to load news content.</div>;
  }

  const recentNews = await getLatestNewsData();

  const otherNews = recentNews
    .filter((n) => String(n.id) !== params.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return (
    <div className="flex justify-center items-center flex-col px-4 py-8">
      <h1 className="font-raleway font-extrabold tracking-widest uppercase text-2xl mb-4 text-center mt-4 md:mt-12">
        {news.title}
      </h1>

      <p className="text-center underline text-btn-primary font-bold text-lg mb-4">
        {new Date(news.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {news.image_urls?.length > 0 && (
        <ImageCardSlider images={news.image_urls} alt={news.title} />
      )}

      {/* Quill content */}
      <QuillRenderer
        content={news.body}
        className="text-justify text-sm md:text-base font-merriweather font-light tracking-wider leading-loose max-w-2xl md:max-w-3xl w-full"
      />

      {/* YouTube embed */}
      {news.embed && (
        <div className="w-full max-w-2xl md:max-w-3xl my-8">
          <div
            className="relative w-full aspect-video [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:absolute [&>iframe]:top-0 [&>iframe]:left-0"
            dangerouslySetInnerHTML={{ __html: news.embed }}
          />
        </div>
      )}

      <hr className="clear-both mx-auto my-10 h-0 w-3/4 w-full md:max-w-4xl border-0 border-t-[3px] border-solid border-[#8b0000]" />

      <h2 className="font-raleway font-extrabold text-2xl text-center mb-8">
        OTHER NEWS AND EVENTS
      </h2>

      {otherNews.length > 0 ? (
        <div className="w-full max-w-6xl">
          <NewsPreview news={otherNews} />
        </div>
      ) : (
        <p className="text-gray-600 font-merriweather">
          No other recent news available.
        </p>
      )}
    </div>
  );
}
