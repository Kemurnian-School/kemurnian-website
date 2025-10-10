'use server'

import { createClientAuth } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function reorderHeroBanners(formData: FormData) {
  const orderStr = formData.get('order') as string
  if (!orderStr) return

  const supabase = await createClientAuth()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) throw new Error('Unauthorized')

  try {
    const newOrderIds: number[] = JSON.parse(orderStr)

    const updates = newOrderIds.map((id, index) =>
      supabase
        .from('hero_sliders')
        .update({ order: index + 1 })
        .eq('id', id)
    )

    await Promise.all(updates)

    redirect('/admin/hero?success=' + encodeURIComponent('Hero banner reorder successful!'))
  } catch (error) {
    console.error('Reorder failed:', error)
    throw error
  }
}
