'use client'
import { useState } from 'react'
import { compressImageToWebP } from '@/utils/ImageCompression'

export type DeviceType = 'desktop' | 'tablet' | 'mobile'

interface CompressionState {
  desktop: boolean
  tablet: boolean
  mobile: boolean
}

export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState<CompressionState>({
    desktop: false,
    tablet: false,
    mobile: false
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const compressImage = async (file: File, deviceType: DeviceType): Promise<File> => {
    const isValidType = file.type.startsWith('image/')
    const isValidSize = file.size <= 10 * 1024 * 1024
    if (!isValidType || !isValidSize) {
      throw new Error('Please select a valid image file (max 10MB).')
    }

    setIsCompressing(prev => ({ ...prev, [deviceType]: true }))
    setSuccessMessage(`Compressing ${deviceType} image...`)

    try {
      const compressedFile = await compressImageToWebP(file, {
        quality: 0.8,
        maxWidth: deviceType === 'desktop' ? 1920 : deviceType === 'tablet' ? 1024 : 768,
        maxHeight: deviceType === 'desktop' ? 1080 : deviceType === 'tablet' ? 768 : 1024
      })

      const savings = ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
      setSuccessMessage(`${deviceType} image compressed successfully! Saved ${savings}% in file size.`)
      setTimeout(() => setSuccessMessage(''), 3000)

      return compressedFile
    } catch (err) {
      console.error('Compression failed:', err)
      setErrorMessage(`Failed to compress ${deviceType} image. Adding original file instead.`)
      return file
    } finally {
      setIsCompressing(prev => ({ ...prev, [deviceType]: false }))
    }
  }

  return { compressImage, isCompressing, errorMessage, setErrorMessage, successMessage, setSuccessMessage }
}
