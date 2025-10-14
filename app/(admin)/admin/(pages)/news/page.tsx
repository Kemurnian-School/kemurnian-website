import NewsList from "@/app/(admin)/components/NewsList";
import { newsRepository } from "@repository/news"

export default async function AdminNews() {
  const repo = await newsRepository()
  const news = await repo.getAll()

  return (
    <section className="p-8 bg-gray-100 min-h-screen">
      <NewsList initialNews={news || []} />
    </section>
  );
}

