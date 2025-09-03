'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface HeroSlidersProps {
  images: string[]
  interval?: number
}

export default function HeroSliders({ images = [], interval = 5000 }: HeroSlidersProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const totalSlides = images.length

  const slides = totalSlides > 1 ? [...images, images[0]] : images

  const goToSlide = (index: number) => {
    if (!trackRef.current) return
    setIsTransitioning(true)
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => prev + 1)
    setIsTransitioning(true)
  }

  // Timer
  const startTimer = () => {
    stopTimer()
    if (totalSlides > 1) {
      timerRef.current = setInterval(nextSlide, interval)
    }
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Reset to first slide seamlessly after last duplicate
  useEffect(() => {
    if (currentIndex === totalSlides) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, totalSlides])

  // Visibility change (pause when tab not active)
  useEffect(() => {
    const handleVisibility = () => {
      document.hidden ? stopTimer() : startTimer()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    startTimer()
    return stopTimer
  }, [totalSlides, interval])

  if (totalSlides === 0) {
    return (
      <div className="relative w-full h-[480px] flex items-center justify-center bg-[#641609] text-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">No hero banners available</p>
          <p className="text-sm opacity-75 mt-2">Add some images to see them here</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-[480px] overflow-hidden bg-[#641609]"
      id="hero-carousel"
    >
      {/* Slides */}
      <div
        ref={trackRef}
        className="flex w-full h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
        }}
      >
        {slides.map((src, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-full h-full flex items-center justify-center"
          >
            <Image
              src={src}
              alt={`Hero Banner ${idx + 1}`}
              width={1920}
              height={480}
              className="h-full object-contain"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      {/* Indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 transform hover:scale-110 ${
                currentIndex === idx || (currentIndex === totalSlides && idx === 0)
                  ? 'bg-red-500'
                  : 'bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
