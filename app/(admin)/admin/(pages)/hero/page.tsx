import HeroList from '@admin/components/HeroList'
import { createClientAuth } from '@/utils/supabase/server'

export default async function AdminHero() {
  const supabase = await createClientAuth()
  const { data: images, error } = await supabase
    .from('hero_sliders')
    .select('id, image_urls, order, header_text')
    .order('order', { ascending: true })

  if (error) {
    throw new Error('Failed to load images')
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className='flex justify-between'>
        <h1 className="text-3xl font-bold mb-4">Hero Slider Admin</h1>
        <a href='/admin/hero/create' className="mb-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">New Banner</a>
      </div>
      <HeroList initialImages={images} />
    </div>
  )
}
