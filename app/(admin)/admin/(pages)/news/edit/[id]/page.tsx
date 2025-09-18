import { createClient } from '@/utils/supabase/server'
import EditNewsForm from './EditNewsForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditNewsPage(props: PageProps) {
  const params = await props.params;
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