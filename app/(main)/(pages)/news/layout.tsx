'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const categories = [
  { name: "General", href: "/news" },
  { name: "Sekolah Kemurnian", href: "/news/category/sekolah-kemurnian" },
  { name: "Sekolah Kemurnian II", href: "/news/category/sekolah-kemurnian-ii" },
  { name: "Sekolah Kemurnian III", href: "/news/category/sekolah-kemurnian-iii" },
]

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [selected, setSelected] = useState(categories[0].href)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const href = e.target.value
    setSelected(href)
    router.push(href)
  }

  return (
    <div className='#ecf0f1'>
      <div className="flex items-center justify-center mb-8 w-full h-86 bg-red-primary text-white text-6xl font-raleway font-bold text-center uppercase">
        NEWS & EVENTS
      </div>
      <div className="ml-12 mb-6">
        <h2 className='mb-4 font-raleway font-extrabold tracking-widest text-2xl'>KATEGORI BERITA</h2>
        <select
          value={selected}
          onChange={handleChange}
          className="
            block
            w-[225px]
            max-w-full
            font-raleway
            px-3
            py-3
            border-3
            border-gray-400
            rounded
            text-gray-700
            text-sm
            focus:outline-none
          "
        >
          {categories.map(cat => (
            <option key={cat.name} value={cat.href}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>{children}</div>
    </div>
  )
}