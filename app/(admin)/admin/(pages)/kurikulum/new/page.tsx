'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadKurikulum } from './actions'

// Import Quill dynamically to avoid SSR issues
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="min-h-[200px] rounded border p-2 bg-gray-50">Loading editor...</div>
})

import 'react-quill-new/dist/quill.snow.css'

export default function NewKurikulumForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  }

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'color', 'background', 'list', 'indent',
    'link'
  ]

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    if (e) e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Title and content are required.')
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('body', content)
      
      await uploadKurikulum(formData)
      
      setSuccessMessage('Kurikulum saved successfully!')
      setTitle('')
      setContent('')
      
      setTimeout(() => {
        router.push('/admin/kurikulum')
      }, 2000)
    } catch (error) {
      console.error('Error saving kurikulum:', error)
      setErrorMessage('Failed to save kurikulum. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
        setErrorMessage('')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [successMessage, errorMessage])

  return (
    <>
      {/* Quill CSS - You can also add this to your global CSS */}
      <style jsx global>{`
        .quill-wrapper .ql-editor {
          min-height: 200px;
        }
        
        .quill-wrapper .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }

        .quill-wrapper .ql-toolbar.ql-snow {
          border: 1px solid #d1d5db;
          border-bottom: none;
        }

        .quill-wrapper .ql-container.ql-snow {
          border: 1px solid #d1d5db;
        }

        .quill-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>

      <div className="mx-auto max-w-3xl p-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded bg-green-200 p-2 text-green-900 flex justify-between items-center">
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-green-700 hover:text-green-900 ml-2"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 rounded bg-red-200 p-2 text-red-900 flex justify-between items-center">
            <span>{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage('')}
              className="text-red-700 hover:text-red-900 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <div>
          {/* Back Link */}
          <Link 
            href="/admin/kurikulum" 
            className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline"
          >
            ← back
          </Link>

          {/* Title Field */}
          <div className="mb-4">
            <label className="mb-2 block font-medium">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter title..."
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
          </div>

          {/* Content Field with Quill Editor */}
          <div className="mb-4">
            <label className="mb-2 block font-medium">Content</label>
            <div className="quill-wrapper">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Write your content here..."
                className="bg-white"
                readOnly={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSubmit}
              className={`rounded px-4 py-2 text-white transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>

            {/* Reset Button */}
            {(title || content) && !isSubmitting && (
              <button 
                onClick={() => {
                  setTitle('')
                  setContent('')
                  setErrorMessage('')
                  setSuccessMessage('')
                }}
                className="rounded px-4 py-2 text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Title: {title.length} characters | Content: {content.replace(/<[^>]*>/g, '').length} characters
          </div>
        </div>
      </div>
    </>
  )
}