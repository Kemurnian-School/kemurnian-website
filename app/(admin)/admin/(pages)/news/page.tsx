import NewsList from "@/app/(admin)/components/NewsList";
import { createClient } from "@/utils/supabase/server";

export default async function AdminNews() {
  const supabase = await createClient();
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    throw new Error("Failed to load news");
  }

  return (
    <section className="p-8 bg-gray-100 min-h-screen">
      <NewsList initialNews={news || []} />
    </section>
  );
}

