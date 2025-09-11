// app/admin/news/edit/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import EditNewsForm from './EditNewsForm'

interface PageProps {
  params: { id: string }
}

export default async function EditNewsPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return <div className="p-4 text-red-600">Failed to load news data</div>
  }

  return <EditNewsForm initialData={data} />
}