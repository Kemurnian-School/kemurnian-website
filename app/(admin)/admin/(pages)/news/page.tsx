import NewsList from "@/app/(admin)/components/NewsList";
import { newsRepository } from "@repository/news";

export default async function AdminNews() {
  const repo = await newsRepository();
  const news = await repo.getAll();

  return (
    <section className="p-8 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
        <a
          href="/admin/news/create"
          className="bg-btn-primary hover:bg-red-primary text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <span>+ New Article</span>
        </a>
      </div>
      <NewsList initialNews={news || []} />
    </section>
  );
}
