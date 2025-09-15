'use client'
import { useState } from 'react'
import Image from 'next/image'
import { reorderHeroBanners, deleteHeroBanner } from '@/app/(admin)/admin/(pages)/hero/create/actions'

interface Hero {
  id: number
  image_urls: string
  order: number
}
export default function HeroList({ initialImages }: { initialImages: Hero[] }) {
  const [images, setImages] = useState<Hero[]>(initialImages)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  function handleDragStart(index: number) {
    setDragIdx(index)
  }
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }
  function handleDrop(targetIdx: number) {
    if (dragIdx === null) return
    const updated = [...images]
    const [moved] = updated.splice(dragIdx, 1)
    updated.splice(targetIdx, 0, moved)
    setImages(updated)
    setDragIdx(null)
  }

  return (
    <div>
      <div className="space-y-4">
        {images.map((img, idx) => (
          <div 
            key={img.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            className="flex items-center space-x-4 bg-white p-4 rounded shadow"
          >
            <Image src={img.image_urls} width={150} height={80} alt={`Hero ${img.id}`} />
            <p className="flex-1">Order: {idx+1}</p>
            <form action={deleteHeroBanner}>
              <input type="hidden" name="id" value={img.id} />
              <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>

      <form action={reorderHeroBanners} className="mt-6">
        <input type="hidden" name="order" value={JSON.stringify(images.map(img => img.id))} />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Save Order
        </button>
      </form>
    </div>
  )
}
