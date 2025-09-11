'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { updateNews } from './actions'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

const fromOptions = [
  'TK Kemurnian', 'SD Kemurnian', 'SMP Kemurnian', 'Kemurnian',
  'TK Kemurnian II', 'SD Kemurnian II', 'SMP Kemurnian II', 'SMA Kemurnian II', 'Kemurnian II',
  'TK Kemurnian III', 'SD Kemurnian III', 'Kemurnian III', 'General'
]

interface News {
  id: string
  title: string
  body: string
  date: string
  from: string
  embed?: string
  image_urls: string[]
}

export default function EditNewsForm({ initialData }: { initialData: News }) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData.title)
  const [body, setBody] = useState(initialData.body)
  const [date, setDate] = useState(initialData.date)
  const [from, setFrom] = useState(initialData.from)
  const [embed, setEmbed] = useState(initialData.embed || '')
  const [existingImages, setExistingImages] = useState<string[]>(initialData.image_urls)
  const [newImages, setNewImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'], ['clean']
    ]
  }

  const formats = ['header', 'bold', 'italic', 'underline', 'color', 'background', 'list', 'link']

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
      setNewImages(prev => [...prev, ...validFiles])
    }
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title || !body || !date || !from) {
      setMessage('Title, body, date, and from are required.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('id', initialData.id)
      formData.append('title', title)
      formData.append('body', body)
      formData.append('date', date)
      formData.append('from', from)
      formData.append('embed', embed || '')
      formData.append('existingImages', JSON.stringify(existingImages))

      newImages.forEach((img, idx) => {
        formData.append('images', img, `image_${idx}_${img.name}`)
      })

      await updateNews(formData)
      setMessage('News updated successfully!')
      setTimeout(() => router.push('/admin/news'), 1500)
    } catch (err) {
      console.error(err)
      setMessage('Failed to update news.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link href="/admin/news" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← back
      </Link>

      {message && <div className="mb-4 p-2 rounded bg-gray-200">{message}</div>}

      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"/>
        </div>

        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"/>
        </div>

        <div>
          <label className="block mb-1 font-medium">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none">
            {fromOptions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Embed</label>
          <input type="text" value={embed} onChange={e => setEmbed(e.target.value)}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"/>
        </div>

        <div>
          <label className="block mb-1 font-medium">Existing Images</label>
          {existingImages.length === 0 ? <p>No images</p> : (
            <div className="flex flex-wrap gap-2">
              {existingImages.map((url, idx) => (
                <div key={idx} className="relative border rounded p-1">
                  <img src={url} alt={`img-${idx}`} className="w-24 h-24 object-cover rounded"/>
                  <button type="button" onClick={() => removeExistingImage(url)}
                    className="absolute top-0 right-0 bg-red-500 text-white px-1 rounded">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Add New Images</label>
          <input type="file" multiple accept="image/*" onChange={handleNewImages}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"/>
          {newImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {newImages.map((img, idx) => (
                <div key={idx} className="relative border rounded p-1">
                  <span className="block truncate max-w-24">{img.name}</span>
                  <button type="button" onClick={() => removeNewImage(idx)}
                    className="absolute top-0 right-0 bg-red-500 text-white px-1 rounded">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Body</label>
          <ReactQuill value={body} onChange={setBody} modules={modules} formats={formats} className="bg-white"/>
        </div>

        <button type="button" onClick={handleSubmit}
          disabled={isSubmitting} className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isSubmitting ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  )
}