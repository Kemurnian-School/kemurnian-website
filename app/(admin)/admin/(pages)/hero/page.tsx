import HeroList from "@admin/components/HeroList";
import { heroRepository } from "@repository/hero";

export default async function AdminHero() {
  const repo = await heroRepository();
  const images = await repo.getAll();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Hero Slider Admin</h1>
        <a
          href="/admin/hero/create"
          className="mb-6 inline-block px-4 py-2 bg-btn-primary text-white rounded hover:bg-red-primary"
        >
          + New Banner
        </a>
      </div>
      <HeroList initialImages={images} />
    </div>
  );
}
