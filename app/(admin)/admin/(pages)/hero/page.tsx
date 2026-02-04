import HeroList from "@admin/components/HeroList";
import { heroRepository } from "@repository/hero";
import ActionButton from "@admin/components/ActionButton";

export default async function AdminHero() {
  const repo = await heroRepository();
  const images = await repo.getAll();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Hero Slider Admin</h1>
        <ActionButton href="/admin/hero/create" label="+ New Banner" />
      </div>
      <HeroList initialImages={images} />
    </div>
  );
}
