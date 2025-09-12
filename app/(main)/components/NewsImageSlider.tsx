"use client"
import { useState } from "react"
import Image from "next/image"

interface NewsImageSliderProps {
  images: string[]
  alt: string
}

export default function NewsImageSlider({ images, alt }: NewsImageSliderProps) {
  const [current, setCurrent] = useState(0)
  const nextImage = () => setCurrent((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrent((prev) => (prev - 1 + images.length) % images.length)
  
  if (images.length === 0) return null
  
  return (
    <div className="relative w-full max-w-3xl mx-auto mb-8">
      <div className="flex justify-center">
        <Image
          src={images[current]}
          alt={alt}
          width={400}
          height={300}
          className="rounded object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}