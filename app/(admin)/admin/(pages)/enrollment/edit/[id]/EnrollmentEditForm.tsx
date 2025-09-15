'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { updateEnrollment, deleteEnrollmentImage } from './actions'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface Enrollment {
  id: string
  title: string
  body: string
  date: string
  image_url: string | null
  image_path: string | null
}

export default function EnrollmentEditForm({ initialData }: { initialData: Enrollment }) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData.title)
  const [body, setBody] = useState(initialData.body)
  const [date, setDate] = useState(initialData.date)
  const [existingImage, setExistingImage] = useState(initialData.image_url)
  const [existingImagePath, setExistingImagePath] = useState(initialData.image_path)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'], ['clean']
    ]
  }
  const quillFormats = ['header','bold','italic','underline','color','background','list','link']

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setNewImage(file)
  }

  // Delete image immediately
  const handleRemoveImage = async () => {
    if (!existingImagePath) return
    setMessage('Deleting image...')
    try {
      const formData = new FormData()
      formData.append('id', initialData.id)
      await deleteEnrollmentImage(formData)
      setExistingImage(null)
      setExistingImagePath(null)
      setMessage('Image deleted successfully!')
    } catch (err) {
      console.error(err)
      setMessage('Failed to delete image.')
    }
  }

  const handleSubmit = async () => {
    if (!title || !body || !date) {
      setMessage('Title, body, and date are required.')
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
      if (existingImagePath) formData.append('existingImagePath', existingImagePath)
      if (newImage) formData.append('image', newImage)

      const result = await updateEnrollment(formData)
      setMessage('Enrollment updated successfully!')
      if (result.image_url) setExistingImage(result.image_url)
      setTimeout(() => router.push('/admin/enrollment'), 1500)
    } catch (err) {
      console.error(err)
      setMessage('Failed to update enrollment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      {message && <div className="mb-4 p-2 rounded bg-gray-200">{message}</div>}

      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSubmit() }}>
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
          <label className="block mb-1 font-medium">Image</label>
          {existingImage ? (
            <div className="relative w-48 h-48">
              <img src={existingImage} alt="Enrollment" className="w-full h-full object-cover rounded"/>
              <button type="button" onClick={handleRemoveImage}
                className="absolute top-0 right-0 bg-red-500 text-white px-1 rounded">×</button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={handleImageChange}
              className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"/>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Body</label>
          <ReactQuill value={body} onChange={setBody} modules={quillModules} formats={quillFormats} className="bg-white min-h-[200px]"/>
        </div>

        <button type="submit"
          disabled={isSubmitting} className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isSubmitting ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  )
}
