import KurikulumList from "@admin/components/KurikulumList";
import { kurikulumRepository } from "@repository/kurikulum";
import ActionButton from "@admin/components/ActionButton";

export default async function AdminKurikulum() {
  const repo = await kurikulumRepository();
  const kurikulums = await repo.getAll();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Kurikulum Management
        </h1>
        <ActionButton href="/admin/kurikulum/create" label="+ New Kurikulum" />
      </div>
      <KurikulumList initialKurikulums={kurikulums} />
    </div>
  );
}
