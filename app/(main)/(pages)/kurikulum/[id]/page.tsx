import { createClient } from '@/utils/supabase/server'
import Head from 'next/head'
import QuillRenderer from '@/app/(main)/components/QuillRenderer'

interface Kurikulum {
  id: string
  title: string
  body: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function KurikulumDetailPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('kurikulum')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return <div className="p-4 text-red-600">Failed to load kurikulum content.</div>
  }

  return (
    <>
      <Head>
        <title>{data.title}</title>
      </Head>
      
      {/* Title Section */}
      <div className="flex items-center justify-center mb-8 w-full h-86 bg-red-primary text-white text-6xl font-raleway font-bold text-center uppercase">
        {data.title}
      </div>
      
      {/* Quill content */}
      <section className="flex justify-center">
        <div className="w-full px-4 max-w-3xl">
          <QuillRenderer 
            content={data.body}
            className="font-merriweather font-[100] leading-loose tracking-wider text-justify"
          />
        </div>
      </section>
    </>
  )
}