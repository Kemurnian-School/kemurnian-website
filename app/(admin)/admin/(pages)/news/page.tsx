import NewsList from "@/app/(admin)/components/NewsList";
import { newsRepository } from "@repository/news";
import ActionButton from "@admin/components/ActionButton";

export default async function AdminNews() {
  const repo = await newsRepository();
  const news = await repo.getAll();

  return (
    <section className="p-8 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
        <ActionButton href="/admin/news/create" label="+ Add News" />
      </div>
      <NewsList initialNews={news || []} />
    </section>
  );
}
