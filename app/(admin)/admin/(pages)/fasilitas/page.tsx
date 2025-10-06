'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { deleteFacility } from './delete/deleteFunction'

interface Fasilitas {
  id: string
  nama_sekolah: string
  image_urls: string
  order: number
}

const sekolahList = [
  { key: 'sekolah-kemurnian-1', label: 'Sekolah Kemurnian 1' },
  { key: 'sekolah-kemurnian-2', label: 'Sekolah Kemurnian 2' },
  { key: 'sekolah-kemurnian-3', label: 'Sekolah Kemurnian 3' },
]

export default function FasilitasPage() {
  const [data, setData] = useState<Record<string, Fasilitas[]>>({})
  const [open, setOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      const { data: fasilitas, error } = await supabase
        .from('fasilitas')
        .select('*')
        .order('order', { ascending: true })

      if (error) {
        console.error('Failed to load images', error)
        return
      }

      const grouped: Record<string, Fasilitas[]> = {}
      sekolahList.forEach((s) => {
        grouped[s.key] = fasilitas.filter(
          (item) => item.nama_sekolah === s.key
        )
      })

      setData(grouped)

      // open all sections by default
      const initialOpen: Record<string, boolean> = {}
      sekolahList.forEach((s) => (initialOpen[s.key] = true))
      setOpen(initialOpen)
    }

    fetchData()
  }, [])

  async function handleDelete(id: string, sekolah: string) {
    try {
      await deleteFacility(id) // calls server action

      setData((prev) => ({
        ...prev,
        [sekolah]: prev[sekolah].filter((item) => item.id !== id),
      }))
    } catch (err) {
      console.error("Failed to delete facility:", err)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Fasilitas Management
        </h1>
        <a
          href="/admin/fasilitas/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          <span>Add New</span>
        </a>
      </div>

      {sekolahList.map((sekolah) => (
        <div
          key={sekolah.key}
          className="border rounded-lg shadow-sm bg-white"
        >
          {/* Header (click to toggle) */}
          <button
            onClick={() =>
              setOpen((prev) => ({ ...prev, [sekolah.key]: !prev[sekolah.key] }))
            }
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg"
          >
            <span className="font-semibold text-lg">{sekolah.label}</span>
            <span>{open[sekolah.key] ? '−' : '+'}</span>
          </button>

          {/* Content */}
          {open[sekolah.key] && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data[sekolah.key]?.length > 0 ? (
                data[sekolah.key].map((item) => (
                  <div
                    key={item.id}
                    className="relative border rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Image */}
                    <img
                      src={item.image_urls}
                      alt={item.nama_sekolah}
                      className="w-full h-48 object-cover"
                    />

                    {/* Delete button in top-right */}
                    <button
                      onClick={() => handleDelete(item.id, sekolah.key)}
                      className="absolute top-2 right-2 bg-white/90 text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-full transition-colors duration-200 cursor-pointer shadow"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No images available</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
