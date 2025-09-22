import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import QuillRenderer from "@/app/(main)/components/QuillRenderer";

export default async function EnrollmentPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("enrollment")
    .select("*")
    .single();

  return (
    <main>
      <h1>{data.title}</h1>
      <Image src={data.image_url} alt="image" width={100} height={100} />
      <QuillRenderer content={data.body} />
    </main>
  );
}

