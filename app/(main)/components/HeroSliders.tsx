'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface HeroImage {
  id: number
  image_urls: string
  order: number
  created_at?: string
}

interface HeroSlidersProps {
  images?: HeroImage[]
  interval?: number
}

export default function HeroSliders({ images = [], interval = 5000 }: HeroSlidersProps) {
  const [currentIndex, setCurrentIndex] = useState(1) // Start at 1 to account for cloned first slide
  const [isTransitioning, setIsTransitioning] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Sort images by order field, then map to URLs
  const sortedImages = images
    .sort((a, b) => a.order - b.order)
    .map(img => img.image_urls)

  const totalSlides = sortedImages.length

  // Create slides array with clones for infinite effect
  const slides = totalSlides > 1 
    ? [sortedImages[totalSlides - 1], ...sortedImages, sortedImages[0]]
    : sortedImages

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1) // +1 to account for cloned first slide
    setIsTransitioning(true)
  }

  const nextSlide = () => {
    if (totalSlides <= 1) return
    setCurrentIndex(prev => prev + 1)
    setIsTransitioning(true)
  }

  // Handle infinite loop reset
  useEffect(() => {
    if (totalSlides <= 1) return

    // When we reach the cloned last slide, reset to first real slide
    if (currentIndex === totalSlides + 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(1)
      }, 500) // Match transition duration
      return () => clearTimeout(timer)
    }

    // When we're at the cloned first slide (index 0), reset to last real slide
    if (currentIndex === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(totalSlides)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, totalSlides])

  // Auto-advance and pause on visibility change
  useEffect(() => {
    if (totalSlides <= 1) return

    const timer = setInterval(nextSlide, interval)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(timer)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [interval, totalSlides])

  // Show empty state if no images
  if (totalSlides === 0) {
    return (
      <div className="relative w-full h-[460px] flex items-center justify-center bg-[#641609] text-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">No hero banners available</p>
          <p className="text-sm opacity-75 mt-2">Add some images to see them here</p>
        </div>
      </div>
    )
  }

  // Single image - no slider needed
  if (totalSlides === 1) {
    return (
      <div className="relative w-full h-[460px] bg-[#641609]">
        <Image
          src={sortedImages[0]}
          alt="Hero Banner"
          width={1920}
          height={480}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-[460px] overflow-hidden bg-[#641609]">
      <div
        ref={sliderRef}
        className="flex w-full h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
        }}
      >
        {slides.map((src, idx) => (
          <div key={idx} className="flex-shrink-0 w-full h-full">
            <Image
              src={src}
              alt={`Hero Banner ${idx}`}
              width={1920}
              height={640}
              className="h-full w-full object-contain"
              priority={idx <= 1}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {sortedImages.map((_, idx) => {
          // Calculate active indicator accounting for cloned slides
          const isActive = 
            currentIndex === idx + 1 || 
            (currentIndex === 0 && idx === totalSlides - 1) || 
            (currentIndex === totalSlides + 1 && idx === 0)
            
          return (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                isActive ? 'bg-red-500' : 'bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}