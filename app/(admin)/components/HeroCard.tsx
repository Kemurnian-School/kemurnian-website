'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { deleteHeroBanner } from '@server/hero/deleteHeroBanner'
import { Hero } from './heroUtils/types'

interface Props {
  hero: Hero
  index: number
  onDragStart: (index: number, y: number) => void
  onDragMove: (y: number) => void
  onDragEnd: () => void
  onDelete: (id: number) => void
  style?: React.CSSProperties
}

export default function HeroCard({ hero, index, onDragStart, onDragMove, onDragEnd, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleMouseDown(e: React.MouseEvent) {
    setDragging(true)
    onDragStart(index, e.clientY)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  function handleMouseMove(e: MouseEvent) {
    onDragMove(e.clientY)
  }

  function handleMouseUp() {
    setDragging(false)
    onDragEnd()
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onDragStart={e => e.preventDefault()}
      className={`flex items-center space-x-4 bg-white p-4 rounded shadow cursor-grab ${dragging ? 'z-10 scale-105' : ''}`}
      style={{
        ...style,
        position: dragging ? 'relative' : 'relative',
        transition: 'transform 0.2s ease',
      }}
    >
      <Image
        src={hero.image_urls}
        width={150}
        height={80}
        alt={`Hero ${hero.id}`}
        draggable={false}
      />
      <div className="flex-1">
        <p>{hero.header_text}</p>
      </div>
      <form action={deleteHeroBanner} onMouseDown={e => e.stopPropagation()}>
        <input type="hidden" name="id" value={hero.id} />
        <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
          Delete
        </button>
      </form>
    </div>
  )
}
