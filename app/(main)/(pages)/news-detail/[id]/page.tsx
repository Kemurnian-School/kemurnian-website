export const revalidate = 86400;

import { Metadata } from "next";
import QuillRenderer from "@component/QuillRenderer";
import ImageCardSlider from "@component/ImageCardSlider";
import NewsPreview from "@component/NewsPreview";
import { getNewsData } from "@/utils/supabase/fetch/news";

interface PageProps {
  params: { id: string };
}

const allNews = await getNewsData();

// Generate Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = allNews.find((n) => String(n.id) === params.id);

  if (!data) {
    return {
      title: "News Not Found",
      description: "This news article could not be found.",
    };
  }

  const bodyText = data.body?.replace(/<[^>]*>/g, "") || "";
  const description =
    bodyText.length > 160 ? bodyText.substring(0, 157) + "..." : bodyText;

  const formattedDate = new Date(data.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pageTitle = `${data.title} - News`;

  return {
    title: pageTitle,
    description: description || `News article from ${formattedDate}`,
    openGraph: {
      title: pageTitle,
      description: description || `News article from ${formattedDate}`,
      type: "article",
      publishedTime: data.date,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description || `News article from ${formattedDate}`,
    },
  };
}

// Helper function for random content generator
function getRandomRecentNews(currentNewsId: string, newsList: any[]) {
  if (!newsList.length) return [];

  // Filter out current article
  const others = newsList.filter((n) => String(n.id) !== currentNewsId);

  const sorted = others.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Take up to last 2 years
  const latestDate = new Date(sorted[0]?.date ?? Date.now());
  const twoYearsBefore = new Date(latestDate);
  twoYearsBefore.setFullYear(latestDate.getFullYear() - 2);

  const recent = sorted.filter(
    (n) => new Date(n.date) >= twoYearsBefore
  );

  const shuffled = [...recent].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// Main Page
export default async function NewsDetailPage({ params }: PageProps) {
  const data = allNews.find((n) => String(n.id) === params.id);

  if (!data) {
    return <div className="p-4 text-red-600">Failed to load news content.</div>;
  }

  const randomNews = getRandomRecentNews(params.id, allNews);

  return (
    <div className="flex justify-center items-center flex-col px-4 py-8">
      <h1 className="font-raleway font-extrabold tracking-widest uppercase text-2xl mb-4 text-center mt-4 md:mt-12">
        {data.title}
      </h1>

      <p className="text-center underline text-btn-primary font-bold text-lg mb-4">
        {new Date(data.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {data.image_urls?.length > 0 && (
        <ImageCardSlider images={data.image_urls} alt={data.title} />
      )}

      {/* Quill content */}
      <QuillRenderer
        content={data.body}
        className="text-justify text-sm md:text-base font-merriweather font-light tracking-wider leading-loose max-w-2xl md:max-w-3xl w-full"
      />

      {/* YouTube embed */}
      {data.embed && (
        <div className="w-full max-w-2xl md:max-w-3xl my-8">
          <div
            className="relative w-full aspect-video [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:absolute [&>iframe]:top-0 [&>iframe]:left-0"
            dangerouslySetInnerHTML={{ __html: data.embed }}
          />
        </div>
      )}

      <hr className="clear-both mx-auto my-10 h-0 w-3/4 w-full md:max-w-4xl border-0 border-t-[3px] border-solid border-[#8b0000]" />

      <h2 className="font-raleway font-extrabold text-2xl text-center mb-8">
        OTHER NEWS AND EVENTS
      </h2>

      {randomNews.length > 0 ? (
        <div className="w-full max-w-6xl">
          <NewsPreview news={randomNews} />
        </div>
      ) : (
        <p className="text-gray-600 font-merriweather">
          No other recent news available.
        </p>
      )}
    </div>
  );
}
