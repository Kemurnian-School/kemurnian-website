import KurikulumList from '@admin/components/KurikulumList'
import { kurikulumRepository } from '@repository/kurikulum'

export default async function AdminKurikulum() {
  const repo = await kurikulumRepository()
  const kurikulums = await repo.getAll()

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <KurikulumList initialKurikulums={kurikulums} />
    </div>
  )
}
