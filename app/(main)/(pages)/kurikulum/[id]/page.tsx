import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import QuillRenderer from "@/app/(main)/components/QuillRenderer";

interface Kurikulum {
  id: string;
  title: string;
  body: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kurikulum")
    .select("title")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return {
      title: "Kurikulum Not Found",
    };
  }

  return {
    title: data.title,
    description: `Learn about ${data.title}`,
  };
}

export default async function KurikulumDetailPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kurikulum")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <div className="p-4 text-red-600">Failed to load kurikulum content.</div>
    );
  }

  return (
    <>
      {/* Title Section */}
      <h1 className="flex items-center justify-center mb-8 w-full h-40 md:h-86 bg-red-primary text-white text-4xl md:text-6xl font-raleway font-bold text-center uppercase">
        {data.title}
      </h1>

      {/* Quill content */}
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

