import { createClient } from '@/utils/supabase/server'
import EditKurikulumForm from './EditKurikulumForm'

import 'react-quill-new/dist/quill.snow.css'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditKurikulumPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kurikulum')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return <div className="p-4 text-red-600">Failed to load kurikulum data</div>
  }

  return <EditKurikulumForm initialData={data} />
}
