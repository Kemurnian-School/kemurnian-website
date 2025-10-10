export const revalidate = 86400;

import { getKurikulumData } from "@/utils/supabase/fetch/kurikulum";
import { Metadata } from "next";
import QuillRenderer from "@component/QuillRenderer";

interface PageProps {
  params: { id: string };
}

const fromKurikulum = await getKurikulumData();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = fromKurikulum.find((k) => String(k.id) === params.id);

  if (!item) {
    return { title: "Kurikulum Not Found" };
  }

  return {
    title: item.title,
    description: `Learn about ${item.title}`,
  };
}

export default async function KurikulumDetailPage({ params }: PageProps) {
  const data = fromKurikulum.find((k) => String(k.id) === params.id);

  if (!data) {
    return (
      <div className="p-4 text-red-600">
        Failed to load kurikulum content.
      </div>
    );
  }

  return (
    <>
      <h1 className="flex items-center justify-center mb-8 w-full h-40 md:h-86 bg-red-primary text-white text-4xl md:text-6xl font-raleway font-bold text-center uppercase">
        {data.title}
      </h1>
      <section className="flex justify-center mb-10">
        <div className="w-full px-4 max-w-3xl">
          <QuillRenderer
            content={data.body}
            className="font-merriweather font-[100] leading-loose tracking-wider text-justify text-xs md:text-lg"
          />
        </div>
      </section>
    </>
  );
}
