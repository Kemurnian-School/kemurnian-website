'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadNews } from './actions'
import dynamic from 'next/dynamic'
import { compressMultipleImages } from '@/utils/ImageCompression' // Import your compression utility

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
  const [isCompressing, setIsCompressing] = useState(false) // New state for compression
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Filter valid image files
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // Increased limit since we'll compress
      return isValidType && isValidSize
    })

    if (validFiles.length === 0) {
      setErrorMessage('Please select valid image files (max 10MB each)')
      return
    }

    if (validFiles.length !== files.length) {
      setErrorMessage('Some files were skipped. Please only upload images under 10MB.')
    } else {
      setErrorMessage('') // Clear previous errors
    }

    setIsCompressing(true)
    setSuccessMessage(`Compressing ${validFiles.length} image(s)...`)

    try {
      // Compress images with custom options
      const compressedFiles = await compressMultipleImages(validFiles, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080
      })

      // Calculate compression savings
      const originalSize = validFiles.reduce((sum, file) => sum + file.size, 0)
      const compressedSize = compressedFiles.reduce((sum, file) => sum + file.size, 0)
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)

      setImages(compressedFiles)
      setSuccessMessage(`Images compressed successfully! Saved ${savings}% in file size.`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Compression failed:', error)
      setErrorMessage('Failed to compress images. Adding original files instead.')
      setImages(validFiles)
    } finally {
      setIsCompressing(false)
    }

    // Clear the input
    e.target.value = ''
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
    setSuccessMessage('Saving news...')

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('body', body)
      formData.append('date', date)
      formData.append('from', from)
      formData.append('embed', embed || '')

      // Append each compressed image with the same key name
      images.forEach((img, index) => {
        formData.append('images', img, `compressed_${index}_${img.name}`)
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
      setSuccessMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link href="/admin/news" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← back
      </Link>

      {successMessage && (
        <div className="mb-4 bg-green-100 text-green-800 p-2 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-800 p-2 rounded">
          {errorMessage}
        </div>
      )}

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
          <p className="text-sm text-gray-600 mb-2">
            Images will be automatically compressed to WebP format (max 1920×1080, 80% quality)
          </p>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleImageChange}
            disabled={isCompressing}
            className={`border p-2 w-full rounded focus:border-blue-500 focus:outline-none ${
              isCompressing ? 'bg-gray-100' : ''
            }`}
          />
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">
                Compressed images ready to upload ({images.length}):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative border rounded p-2 bg-green-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 truncate font-medium">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700 ml-2 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">{(image.size / 1024).toFixed(1)} KB</p>
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
          disabled={isSubmitting || isCompressing}
          className={`px-4 py-2 rounded text-white transition-colors ${
            isSubmitting || isCompressing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : isCompressing ? 'Compressing...' : 'Save'}
        </button>
      </form>
    </div>
  )
}