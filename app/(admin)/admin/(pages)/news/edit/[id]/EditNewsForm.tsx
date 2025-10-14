'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { updateNews } from '@server/news/updateNews'
import { deleteNewsImage } from '@server/news/deleteNewsImage'
import { compressMultipleImages } from '@/utils/ImageCompression'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

const fromOptions = [
  'General',
  'TK Kemurnian', 'SD Kemurnian', 'SMP Kemurnian', 'Kemurnian',
  'TK Kemurnian II', 'SD Kemurnian II', 'SMP Kemurnian II', 'SMA Kemurnian II', 'Kemurnian II',
  'TK Kemurnian III', 'SD Kemurnian III', 'Kemurnian III'
]

export default function EditNewsForm({ initialData }: { initialData: any }) {
  const router = useRouter()

  const [state, setState] = useState({
    title: initialData.title,
    body: initialData.body,
    date: initialData.date,
    from: initialData.from,
    embed: initialData.embed ?? '',
    existingImages: initialData.image_urls ?? [],
    newImages: [] as File[],
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
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

  async function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)

    setCompressing(true)
    setMessage(`Compressing ${files.length} image(s)...`)

    try {
      const compressed = await compressMultipleImages(files, { quality: 0.8, maxWidth: 1920, maxHeight: 1080 })
      setState(prev => ({ ...prev, newImages: [...prev.newImages, ...compressed] }))
      setMessage('Compression done!')
    } catch (err) {
      console.error(err)
      setMessage('Compression failed, using originals instead.')
      setState(prev => ({ ...prev, newImages: [...prev.newImages, ...files] }))
    } finally {
      setCompressing(false)
      e.target.value = ''
    }
  }

  async function handleDeleteImage(url: string) {
    setDeletingImage(url)
    const form = new FormData()
    form.append('newsId', initialData.id)
    form.append('imageUrl', url)
    await deleteNewsImage(form)
    setState(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((img: string) => img !== url),
    }))
    setDeletingImage(null)
  }

  function removeNewImage(index: number) {
    setState(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }))
  }

  async function handleSubmit() {
    if (!state.title || !state.body || !state.date || !state.from) {
      setMessage('Title, body, date, and source are required.')
      return
    }

    setLoading(true)
    const form = new FormData()
    form.append('id', initialData.id)
    form.append('title', state.title)
    form.append('body', state.body)
    form.append('date', state.date)
    form.append('from', state.from)
    form.append('embed', state.embed)
    form.append('existingImages', JSON.stringify(state.existingImages))
    for (const img of state.newImages) form.append('images', img)

    try {
      await updateNews(form)
      setMessage('News updated successfully!')
      router.push('/admin/news?success=' + encodeURIComponent("News updated successfully!"))
    } catch (err) {
      console.error(err)
      setMessage('Failed to update news.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link href="/admin/news" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← Back
      </Link>

      {message && (
        <div className={`mb-4 p-2 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-800' :
          message.includes('Failed') ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
          {message}
        </div>
      )}

      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={state.title}
            onChange={e => setState({ ...state, title: e.target.value })}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            value={state.date}
            onChange={e => setState({ ...state, date: e.target.value })}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">From</label>
          <select
            value={state.from}
            onChange={e => setState({ ...state, from: e.target.value })}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
          >
            {fromOptions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Embed</label>
          <input
            type="text"
            value={state.embed}
            onChange={e => setState({ ...state, embed: e.target.value })}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Existing Images</label>
          {state.existingImages.length === 0 ? (
            <p className="text-gray-500">No images</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {state.existingImages.map((url: string, idx: number) => (
                <div key={idx} className="relative border rounded p-1">
                  <img src={url} alt="" className="w-24 h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(url)}
                    disabled={deletingImage === url}
                    className={`absolute top-0 right-0 px-1 rounded text-white ${deletingImage === url ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
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
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddImages}
            disabled={compressing}
            className="w-full border rounded p-2"
          />
          {state.newImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {state.newImages.map((img, i) => (
                <div key={i} className="relative border rounded p-1 bg-green-50">
                  <div className="text-xs truncate max-w-24 font-medium">{img.name}</div>
                  <div className="text-gray-500 text-xs">{(img.size / 1024).toFixed(1)} KB</div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Body</label>
          <ReactQuill
            value={state.body}
            onChange={value => setState({ ...state, body: value })}
            modules={modules}
            formats={formats}
            className="bg-white"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || compressing}
          className={`px-4 py-2 rounded text-white ${loading || compressing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? 'Updating...' : compressing ? 'Compressing...' : 'Update'}
        </button>
      </form>
    </div>
  )
}
