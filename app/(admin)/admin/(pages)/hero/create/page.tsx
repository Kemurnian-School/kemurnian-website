'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadHeroBanner } from './actions'
import { compressImageToWebP } from '@/utils/ImageCompression'

export default function NewHeroBannerForm() {
  const [headerText, setHeaderText] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [hrefText, setHrefText] = useState('')
  const [desktopImage, setDesktopImage] = useState<File | null>(null)
  const [tabletImage, setTabletImage] = useState<File | null>(null)
  const [mobileImage, setMobileImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompressing, setIsCompressing] = useState({
    desktop: false,
    tablet: false,
    mobile: false
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    deviceType: 'desktop' | 'tablet' | 'mobile'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isValidType = file.type.startsWith('image/')
    const isValidSize = file.size <= 10 * 1024 * 1024
    if (!isValidType || !isValidSize) {
      setErrorMessage('Please select a valid image file (max 10MB).')
      return
    }
    setErrorMessage('')

    setIsCompressing(prev => ({ ...prev, [deviceType]: true }))
    setSuccessMessage(`Compressing ${deviceType} image...`)

    try {
      const compressedFile = await compressImageToWebP(file, {
        quality: 0.8,
        maxWidth: deviceType === 'desktop' ? 1920 : deviceType === 'tablet' ? 1024 : 768,
        maxHeight: deviceType === 'desktop' ? 1080 : deviceType === 'tablet' ? 768 : 1024
      })

      const savings = ((file.size - compressedFile.size) / file.size * 100).toFixed(1)

      if (deviceType === 'desktop') setDesktopImage(compressedFile)
      else if (deviceType === 'tablet') setTabletImage(compressedFile)
      else setMobileImage(compressedFile)

      setSuccessMessage(`${deviceType} image compressed successfully! Saved ${savings}% in file size.`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Compression failed:', error)
      setErrorMessage(`Failed to compress ${deviceType} image. Adding original file instead.`)
      if (deviceType === 'desktop') setDesktopImage(file)
      else if (deviceType === 'tablet') setTabletImage(file)
      else setMobileImage(file)
    } finally {
      setIsCompressing(prev => ({ ...prev, [deviceType]: false }))
    }
  };

  const removeImage = (deviceType: 'desktop' | 'tablet' | 'mobile') => {
    if (deviceType === 'desktop') setDesktopImage(null)
    else if (deviceType === 'tablet') setTabletImage(null)
    else setMobileImage(null)
  };

  const renderImagePreview = (image: File | null, deviceType: 'desktop' | 'tablet' | 'mobile') => {
    if (!image) return null

    return (
      <div className="mt-3">
        <div className="relative border rounded p-2 bg-green-50 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-700 truncate font-medium">{image.name}</span>
            <p className="text-xs text-gray-600">{(image.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => removeImage(deviceType)}
            className="text-red-500 hover:text-red-700 ml-2 text-lg font-bold"
          >
            ×
          </button>
        </div>
      </div>
    );
  };


  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!desktopImage) {
      setErrorMessage('A desktop image is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('Saving hero banner...')

    try {
      const formData = new FormData()
      formData.append('headerText', headerText)
      formData.append('buttonText', buttonText)
      formData.append('hrefText', hrefText)

      if (desktopImage) formData.append('desktopImage', desktopImage)
      if (tabletImage) formData.append('tabletImage', tabletImage)
      if (mobileImage) formData.append('mobileImage', mobileImage)

      await uploadHeroBanner(formData)
      router.push('/admin/hero?success=' + encodeURIComponent('Hero banner created successfully!'))
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to save hero banner.')
      setSuccessMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAnyCompressing = isCompressing.desktop || isCompressing.tablet || isCompressing.mobile

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link href="/admin/hero" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← Back to Hero Banners
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

      <form className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Header Text (optional)</label>
          <input
            type="text"
            value={headerText}
            onChange={e => setHeaderText(e.target.value)}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Button Text (optional)</label>
          <input
            type="text"
            value={buttonText}
            onChange={e => setButtonText(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Link URL (optional)</label>
          <input
            type="text"
            value={hrefText}
            onChange={e => setHrefText(e.target.value)}
            className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Desktop Image */}
        <div>
          <label className="block mb-1 font-medium">Desktop Image *</label>
          <p className="text-sm text-gray-600 mb-2">
            Will be compressed to WebP (max 1920×1080).
          </p>
          {!desktopImage && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'desktop')}
              disabled={isCompressing.desktop}
              className="border p-2 w-full rounded"
            />
          )}
          {renderImagePreview(desktopImage, 'desktop')}
        </div>

        {/* Tablet Image */}
        <div>
          <label className="block mb-1 font-medium">Tablet Image (optional)</label>
          <p className="text-sm text-gray-600 mb-2">
            Will be compressed to WebP (max 1024×768).
          </p>
          {!tabletImage && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'tablet')}
              disabled={isCompressing.tablet}
              className="border p-2 w-full rounded"
            />
          )}
          {renderImagePreview(tabletImage, 'tablet')}
        </div>

        {/* Mobile Image */}
        <div>
          <label className="block mb-1 font-medium">Mobile Image (optional)</label>
          <p className="text-sm text-gray-600 mb-2">
            Will be compressed to WebP (max 768×1024).
          </p>
          {!mobileImage && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'mobile')}
              disabled={isCompressing.mobile}
              className="border p-2 w-full rounded"
            />
          )}
          {renderImagePreview(mobileImage, 'mobile')}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isAnyCompressing}
          className={`px-4 py-2 rounded text-white transition-colors ${isSubmitting || isAnyCompressing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isSubmitting ? 'Saving...' : isAnyCompressing ? 'Compressing...' : 'Save Hero Banner'}
        </button>
      </form>
    </div>
  )
}
