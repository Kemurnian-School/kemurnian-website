'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { updateKurikulum } from './actions'
import Link from 'next/link'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

interface Kurikulum {
  id: string
  title: string
  body: string
}

export default function EditKurikulumForm({ initialData }: { initialData: Kurikulum }) {
  const [title, setTitle] = useState(initialData.title)
  const [content, setContent] = useState(initialData.body)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean']
    ]
  }

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'color', 'background', 'list', 'indent',
    'link'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('id', initialData.id)
      formData.append('title', title)
      formData.append('body', content)

      await updateKurikulum(formData)
      setMessage('Kurikulum updated successfully!')
    } catch (err: any) {
      console.error(err)
      setMessage('Failed to update kurikulum.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link href="/admin/kurikulum" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← back
      </Link>

      {message && <div className="mb-4 p-2 rounded bg-gray-200">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Edit your content here..."
            readOnly={isSubmitting}
            className="bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  )
}
