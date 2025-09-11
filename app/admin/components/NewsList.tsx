'use client'
import { useState } from 'react'

interface News {
  id: number
  title: string
  body: string
  date: string
  from: string
  image_urls: string[]
  embed?: string
  created_at: string
}

export default function NewsList({ initialNews }: { initialNews: News[] }) {
  const [news, setNews] = useState<News[]>(initialNews)

  function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this news?')) return
    setNews(news.filter(n => n.id !== id))
  }

  // Helper function to strip HTML tags from body
  function stripHtml(html: string) {
    if (typeof window === 'undefined') {
      // Server-side: use regex to strip HTML tags
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    // Client-side: use DOM method
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
        <a
          href="/admin/news/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>New Article</span>
        </a>
      </div>

      {/* News List */}
      {news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            ></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first news article</p>
          <a
            href="/admin/news/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Create First Article
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-full bg-gray-200 overflow-hidden">
                {item.image_urls && item.image_urls.length > 0 ? (
                  <img
                    src={item.image_urls[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                )}
                
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <a
                    href={`/admin/news/detail/${item.id}`}
                    className="bg-white/90 hover:bg-white text-blue-600 hover:text-blue-800 p-1.5 rounded-full shadow-sm transition-colors duration-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="bg-white/90 hover:bg-white text-red-600 hover:text-red-800 p-1.5 rounded-full shadow-sm transition-colors duration-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>

                {/* Badge for multiple images */}
                {item.image_urls && item.image_urls.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    +{item.image_urls.length - 1}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
                    {item.from}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 flex-shrink-0">
                  {item.title}
                </h3>

                {/* Date */}
                <div className="text-xs text-gray-500 mb-2 flex-shrink-0">
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>

                {/* Body Preview */}
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {stripHtml(item.body).substring(0, 80)}
                    {stripHtml(item.body).length > 80 && '...'}
                  </p>
                </div>

                {/* Bottom indicators - Simplified */}
                <div className="flex justify-end items-center mt-1">
                  {item.embed && (
                    <div className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      📹
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}