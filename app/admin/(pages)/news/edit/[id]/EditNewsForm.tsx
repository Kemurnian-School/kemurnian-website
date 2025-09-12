'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { updateNews, deleteNewsImage } from './actions'
import { compressMultipleImages } from '@/utils/ImageCompression' // Import your compression utility

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
  storage_paths?: string[]
}

export default function EditNewsForm({ initialData }: { initialData: News }) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData.title)
  const [body, setBody] = useState(initialData.body)
  const [date, setDate] = useState(initialData.date)
  const [from, setFrom] = useState(initialData.from)
  const [embed, setEmbed] = useState(initialData.embed || '')
  const [existingImages, setExistingImages] = useState<string[]>(initialData.image_urls)
  const [existingPaths, setExistingPaths] = useState<string[]>(initialData.storage_paths || [])
  const [newImages, setNewImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false) // New state for compression
  const [message, setMessage] = useState('')
  const [deletingImage, setDeletingImage] = useState<string | null>(null)

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

  const handleNewImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Filter valid image files
    const validFiles = Array.from(files).filter(f => 
      f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024 // Increased limit since we'll compress
    )

    if (validFiles.length === 0) {
      setMessage('Please select valid image files (max 10MB each)')
      return
    }

    setIsCompressing(true)
    setMessage(`Compressing ${validFiles.length} image(s)...`)

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

      setNewImages(prev => [...prev, ...compressedFiles])
      setMessage(`Images compressed successfully! Saved ${savings}% in file size.`)
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Compression failed:', error)
      setMessage('Failed to compress images. Adding original files instead.')
      setNewImages(prev => [...prev, ...validFiles])
    } finally {
      setIsCompressing(false)
    }

    // Clear the input
    e.target.value = ''
  }

  // Delete image immediately from storage and update local state
  const removeExistingImage = async (url: string, index: number) => {
    const storagePath = existingPaths[index]
    if (!storagePath) {
      // If no storage path, just remove from local state
      setExistingImages(prev => prev.filter(img => img !== url))
      return
    }

    setDeletingImage(url)
    setMessage('Deleting image...')

    try {
      const formData = new FormData()
      formData.append('newsId', initialData.id)
      formData.append('imageUrl', url)
      formData.append('storagePath', storagePath)

      await deleteNewsImage(formData)
      
      // Update local state after successful deletion
      setExistingImages(prev => prev.filter(img => img !== url))
      setExistingPaths(prev => prev.filter((_, i) => i !== index))
      setMessage('Image deleted successfully!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      console.error(err)
      setMessage('Failed to delete image.')
    } finally {
      setDeletingImage(null)
    }
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
    setMessage('Updating news...')

    try {
      const formData = new FormData()
      formData.append('id', initialData.id)
      formData.append('title', title)
      formData.append('body', body)
      formData.append('date', date)
      formData.append('from', from)
      formData.append('embed', embed || '')
      formData.append('existingImages', JSON.stringify(existingImages))
      formData.append('existingPaths', JSON.stringify(existingPaths))

      // Add compressed images to form data
      newImages.forEach((img, idx) => {
        formData.append('images', img, `compressed_${idx}_${img.name}`)
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

      {message && (
        <div className={`mb-4 p-2 rounded ${
          message.includes('successfully') ? 'bg-green-100 text-green-800' : 
          message.includes('Failed') || message.includes('failed') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}

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
                  <button 
                    type="button" 
                    onClick={() => removeExistingImage(url, idx)}
                    disabled={deletingImage === url}
                    className={`absolute top-0 right-0 px-1 rounded text-white ${
                      deletingImage === url ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {deletingImage === url ? '...' : '×'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Add New Images</label>
          <p className="text-sm text-gray-600 mb-2">
            Images will be automatically compressed to WebP format (max 1920×1080, 80% quality)
          </p>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleNewImages}
            disabled={isCompressing}
            className={`w-full border rounded p-2 focus:border-blue-500 focus:outline-none ${
              isCompressing ? 'bg-gray-100' : ''
            }`}
          />
          {newImages.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">
                {newImages.length} compressed image(s) ready to upload:
              </p>
              <div className="flex flex-wrap gap-2">
                {newImages.map((img, idx) => (
                  <div key={idx} className="relative border rounded p-1 bg-green-50">
                    <div className="text-xs">
                      <div className="truncate max-w-24 font-medium">{img.name}</div>
                      <div className="text-gray-500">
                        {(img.size / 1024).toFixed(1)}KB
                      </div>
                    </div>
                    <button type="button" onClick={() => removeNewImage(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white px-1 rounded text-xs">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Body</label>
          <ReactQuill value={body} onChange={setBody} modules={modules} formats={formats} className="bg-white"/>
        </div>

        <button type="button" onClick={handleSubmit}
          disabled={isSubmitting || isCompressing} 
          className={`px-4 py-2 rounded text-white ${
            isSubmitting || isCompressing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}>
          {isSubmitting ? 'Updating...' : isCompressing ? 'Compressing...' : 'Update'}
        </button>
      </form>
    </div>
  )
}