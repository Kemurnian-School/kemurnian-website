'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadKurikulum } from '@server/kurikulum/createKurikulum'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="min-h-[200px] rounded border p-2 bg-gray-50">Loading editor...</div>
})

import 'react-quill-new/dist/quill.snow.css'

export default function NewKurikulumForm() {
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
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
      formData.append('preview', preview.trim())
      formData.append('body', content)

      await uploadKurikulum(formData)

      setTitle('')
      setPreview('')
      setContent('')

      router.push('/admin/kurikulum?success=' + encodeURIComponent('Kurikulum saved successfully'))
    } catch (error) {
      console.error('Error saving kurikulum:', error)
      setErrorMessage('Failed to save kurikulum. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <div className="mx-auto max-w-3xl p-4">
      {successMessage && (
        <div className="mb-4 rounded bg-green-200 p-2 text-green-900 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-2 text-green-700 hover:text-green-900">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded bg-red-200 p-2 text-red-900 flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-2 text-red-700 hover:text-red-900">✕</button>
        </div>
      )}

      <Link href="/admin/kurikulum" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← back
      </Link>

      {/* Title */}
      <div className="mb-4">
        <label className="mb-2 block font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter title..."
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Preview (optional) */}
      <div className="mb-4">
        <label className="mb-2 block font-medium">Preview <span className="text-gray-400">(optional)</span></label>
        <textarea
          value={preview}
          onChange={e => setPreview(e.target.value)}
          className="w-full rounded border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Short description or excerpt..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Content */}
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

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSubmit}
          className={`rounded px-4 py-2 text-white transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>

        {(title || content || preview) && !isSubmitting && (
          <button
            onClick={() => {
              setTitle('')
              setPreview('')
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
        Title: {title.length} chars | Preview: {preview.length} chars | Content: {content.replace(/<[^>]*>/g, '').length} chars
      </div>
    </div>
  )
}
