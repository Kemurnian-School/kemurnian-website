import EditKurikulumForm from './EditKurikulumForm'
import { kurikulumRepository } from '@repository/kurikulum'

import 'react-quill-new/dist/quill.snow.css'

interface PageProps {
  params: { id: string }
}

export default async function EditKurikulumPage({ params }: PageProps) {
  const repo = await kurikulumRepository()
  const id = Number(params.id)

  const data = await repo.getById(id)

  if (!data) {
    return <div className="p-4 text-red-600">Failed to load kurikulum data</div>
  }

  return <EditKurikulumForm initialData={data} />
}
