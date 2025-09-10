'use client'
import { useState } from 'react'

interface Kurikulum {
  id: number
  title: string
  body: string
  created_at: string
}

export default function KurikulumList({ initialKurikulums }: { initialKurikulums: Kurikulum[] }) {
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>(initialKurikulums)

  function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this curriculum?')) return
    // Replace this with your actual delete logic
    setKurikulums(kurikulums.filter(k => k.id !== id))
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kurikulum Management</h1>
        <a
          href="/admin/new-kurikulum"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>New Curriculum</span>
        </a>
      </div>

      {/* Curriculum List */}
      {kurikulums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            ></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No curriculum yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first curriculum content</p>
          <a
            href="/admin/new-kurikulum"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Create First Curriculum
          </a>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {kurikulums.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row justify-between items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{item.title}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">#{item.id}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.body.length > 30 ? item.body.substring(0, 30) + '...' : item.body}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 text-gray-500 text-xs mt-2 md:mt-0">
                <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <div className="flex items-center space-x-2">
                  <a
                    href={`/admin/edit-kurikulum/${item.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
