import { newsRepository } from '@repository/news'
import EditNewsForm from './EditNewsForm'

interface PageProps {
  params: { id: number }
}

export default async function EditNewsPage({ params }: PageProps) {
  const repo = await newsRepository()
  const newsItem = await repo.getById(params.id)

  if (!newsItem) {
    return (
      <div className="p-4 text-red-600">
        News not found or failed to load.
      </div>
    )
  }

  return <EditNewsForm initialData={newsItem} />
}
