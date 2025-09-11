'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadNews } from './actions'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

const fromOptions = [
  'TK Kemurnian', 'SD Kemurnian', 'SMP Kemurnian', 'Kemurnian',
  'TK Kemurnian II', 'SD Kemurnian II', 'SMP Kemurnian II', 'SMA Kemurnian II', 'Kemurnian II',
  'TK Kemurnian III', 'SD Kemurnian III', 'Kemurnian III', 'General'
]

export default function NewNewsForm() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState('')
  const [embed, setEmbed] = useState('')
  const [from, setFrom] = useState(fromOptions[0])
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'], ['clean']
    ]
  }

  const formats = ['header', 'bold', 'italic', 'underline', 'color', 'background', 'list', 'link']

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      // Optional: Add file validation
      const validFiles = fileArray.filter(file => {
        const isValidType = file.type.startsWith('image/')
        const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB limit
        return isValidType && isValidSize
      })
      
      if (validFiles.length !== fileArray.length) {
        setErrorMessage('Some files were skipped. Please only upload images under 5MB.')
      }
      
      setImages(validFiles)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!title || !body || !date || !from) {
      setErrorMessage('Title, body, date and from are required.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('body', body)
      formData.append('date', date)
      formData.append('from', from)
      formData.append('embed', embed || '')

      // Append each image with the same key name
      images.forEach((img, index) => {
        formData.append('images', img, `image_${index}_${img.name}`)
      })

      await uploadNews(formData)

      setSuccessMessage('News saved successfully!')
      setTitle('')
      setBody('')
      setDate('')
      setEmbed('')
      setFrom(fromOptions[0])
      setImages([])

      setTimeout(() => router.push('/admin/news'), 2000)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to save news.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link href="/admin/news" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← back
      </Link>

      {successMessage && <div className="mb-4 bg-green-200 p-2 text-green-900 rounded">{successMessage}</div>}
      {errorMessage && <div className="mb-4 bg-red-200 p-2 text-red-900 rounded">{errorMessage}</div>}

      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="border rounded p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="border rounded p-2 w-full focus:border-blue-500 focus:outline-none">
            {fromOptions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Embed (optional)</label>
          <input 
            type="text" 
            value={embed} 
            onChange={e => setEmbed(e.target.value)} 
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
            placeholder="YouTube embed link"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Images</label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleImageChange} 
            className="border p-2 w-full rounded focus:border-blue-500 focus:outline-none"
          />
          <p className="text-sm text-gray-600 mt-1">Select multiple images (max 5MB each)</p>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Selected images ({images.length}):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative border rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700 ml-2 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Body</label>
          <ReactQuill
            value={body}
            onChange={setBody}
            modules={modules}
            formats={formats}
            placeholder="Write news content here..."
            className="bg-white"
          />
        </div>

        <button 
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}