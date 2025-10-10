'use client'
import Link from 'next/link'
import { useHeroBannerForm } from './hooks/useHeroBannerForm'

export default function NewHeroBannerForm() {
  const {
    headerText, setHeaderText,
    buttonText, setButtonText,
    hrefText, setHrefText,
    desktopImage, tabletImage, mobileImage,
    handleImageChange, removeImage,
    handleSubmit,
    isSubmitting, isAnyCompressing,
    errorMessage, successMessage
  } = useHeroBannerForm()

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
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link href="/admin/hero" className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline">
        ← Back to Hero Banners
      </Link>

      {successMessage && <div className="mb-4 bg-green-100 text-green-800 p-2 rounded">{successMessage}</div>}
      {errorMessage && <div className="mb-4 bg-red-100 text-red-800 p-2 rounded">{errorMessage}</div>}

      <form className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Header Text (optional)</label>
          <input type="text" value={headerText} onChange={e => setHeaderText(e.target.value)} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Button Text (optional)</label>
          <input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Link URL (optional)</label>
          <input type="text" value={hrefText} onChange={e => setHrefText(e.target.value)} className="w-full border rounded p-2" />
        </div>

        {/* Desktop Image */}
        <div>
          <label className="block mb-1 font-medium">Desktop Image *</label>
          {!desktopImage && (
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'desktop')} className="border p-2 w-full rounded" />
          )}
          {renderImagePreview(desktopImage, 'desktop')}
        </div>

        {/* Tablet Image */}
        <div>
          <label className="block mb-1 font-medium">Tablet Image (optional)</label>
          {!tabletImage && (
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'tablet')} className="border p-2 w-full rounded" />
          )}
          {renderImagePreview(tabletImage, 'tablet')}
        </div>

        {/* Mobile Image */}
        <div>
          <label className="block mb-1 font-medium">Mobile Image (optional)</label>
          {!mobileImage && (
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'mobile')} className="border p-2 w-full rounded" />
          )}
          {renderImagePreview(mobileImage, 'mobile')}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isAnyCompressing}
          className={`px-4 py-2 rounded text-white transition-colors ${isSubmitting || isAnyCompressing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Saving...' : isAnyCompressing ? 'Compressing...' : 'Save Hero Banner'}
        </button>
      </form>
    </div>
  )
}
