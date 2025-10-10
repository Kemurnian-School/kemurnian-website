'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadHeroBanner } from '@server/hero/uploadHeroBanner'
import { useImageCompression, DeviceType } from './useImageCompression'

export function useHeroBannerForm() {
  const [headerText, setHeaderText] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [hrefText, setHrefText] = useState('')
  const [desktopImage, setDesktopImage] = useState<File | null>(null)
  const [tabletImage, setTabletImage] = useState<File | null>(null)
  const [mobileImage, setMobileImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const {
    compressImage,
    isCompressing,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage
  } = useImageCompression()

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    deviceType: DeviceType
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, deviceType)
      if (deviceType === 'desktop') setDesktopImage(compressed)
      else if (deviceType === 'tablet') setTabletImage(compressed)
      else setMobileImage(compressed)
    } catch (err: any) {
      setErrorMessage(err.message)
    }
  }

  const removeImage = (deviceType: DeviceType) => {
    if (deviceType === 'desktop') setDesktopImage(null)
    else if (deviceType === 'tablet') setTabletImage(null)
    else setMobileImage(null)
  }

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

  return {
    headerText, setHeaderText,
    buttonText, setButtonText,
    hrefText, setHrefText,
    desktopImage, tabletImage, mobileImage,
    isSubmitting, handleSubmit,
    handleImageChange, removeImage,
    isAnyCompressing,
    errorMessage, successMessage
  }
}
