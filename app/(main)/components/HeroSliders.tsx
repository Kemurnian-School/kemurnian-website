"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroImage {
  id: number;
  order: number;
  image_urls: string; // Desktop image
  tablet_image_urls?: string | null;
  mobile_image_urls?: string | null;
  header_text?: string | null;
  button_text?: string | null;
  href_text?: string | null;
}

interface HeroSlidersProps {
  images?: HeroImage[];
  interval?: number;
}

export default function HeroSliders({
  images = [],
  interval = 5000,
}: HeroSlidersProps) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  const sortedSlidesData = images.sort((a, b) => a.order - b.order);
  const initialSlide = sortedSlidesData.find((s) => s.order === 1);
  const totalSlides = sortedSlidesData.length;

  const slides =
    totalSlides > 1
      ? [
          sortedSlidesData[totalSlides - 1],
          ...sortedSlidesData,
          sortedSlidesData[0],
        ]
      : sortedSlidesData;

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1);
    setIsTransitioning(true);
  };

  const nextSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  };

  useEffect(() => {
    if (totalSlides <= 1) return;
    if (currentIndex === totalSlides + 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 500);
      return () => clearTimeout(timer);
    }
    if (currentIndex === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalSlides);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(nextSlide, interval);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(timer);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interval, totalSlides]);

  const SlideContent = ({
    slide,
    priority = false,
  }: {
    slide: HeroImage;
    priority?: boolean;
  }) => (
    <>
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet={slide.mobile_image_urls || slide.image_urls}
        />
        <source
          media="(max-width: 1024px)"
          srcSet={slide.tablet_image_urls || slide.image_urls}
        />
        <Image
          src={slide.image_urls}
          alt="Hero Banner"
          width={1920}
          height={680}
          className="h-full w-full object-contain"
          priority={priority}
        />
      </picture>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 font-raleway">
        <div className="max-w-sm md:max-w-3xl lg:max-w-4xl">
          {slide.header_text && (
            <h1
              className="tracking-wider mb-8 break-words text-lg md:text-2xl lg:text-3xl font-bold"
              style={{
                textShadow:
                  "2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)",
              }}
            >
              {slide.header_text}
            </h1>
          )}

          {slide.href_text && slide.button_text && (
            <Link href={slide.href_text}>
              <button
                className="text-md tracking-widest px-5 py-4 bg-transparent text-white border-3 border-btn-primary hover:bg-btn-primary transition-all duration-200 font-bold"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)",
                  boxShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {slide.button_text}
              </button>
            </Link>
          )}
        </div>
      </div>
    </>
  );

  if (totalSlides === 0) {
    return (
      <div className="relative w-full h-[540px] flex items-center justify-center bg-[#641609] text-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">No hero banners available</p>
          <p className="text-sm opacity-75 mt-2">
            Add some images to see them here
          </p>
        </div>
      </div>
    );
  }

  if (totalSlides === 1) {
    return (
      <div className="relative w-full h-[540px] bg-[#641609]">
        <SlideContent slide={sortedSlidesData[0]} priority={true} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[540px] overflow-hidden bg-[#641609]">
      <div
        ref={sliderRef}
        className="flex w-full h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
        }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className="relative flex-shrink-0 w-full h-full">
            <SlideContent
              slide={slide}
              priority={slide.id === initialSlide?.id}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {sortedSlidesData.map((_, idx) => {
          const isActive =
            currentIndex === idx + 1 ||
            (currentIndex === 0 && idx === totalSlides - 1) ||
            (currentIndex === totalSlides + 1 && idx === 0);

          return (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-4 h-4 rounded-full border-4 transition-all duration-300 shadow-xl ${
                isActive
                  ? "border-btn-primary bg-transparent"
                  : "border-white bg-transparent hover:border-btn-primary"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

