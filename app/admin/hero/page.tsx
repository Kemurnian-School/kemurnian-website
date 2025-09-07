import HeroList from '@/app/admin/components/HeroList'
import { createClient } from '@/utils/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: images, error } = await supabase
    .from('hero_sliders')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    throw new Error('Failed to load images')
  }
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Hero Slider Admin</h1>
      <HeroList initialImages={images} />
    </div>
  )
}
