import KurikulumList from "@admin/components/KurikulumList";
import { kurikulumRepository } from "@repository/kurikulum";

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
        <a
          href="/admin/kurikulum/new"
          className="bg-btn-primary hover:bg-red-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          <span>New Curriculum</span>
        </a>
      </div>
      <KurikulumList initialKurikulums={kurikulums} />
    </div>
  );
}
