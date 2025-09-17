"use client";
import { useState, useEffect, useRef, PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroImage {
  id: number;
  order: number;
  image_urls: string;
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
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startAutoPlay = () => {
    if (totalSlides <= 1) return;
    stopAutoPlay();
    intervalRef.current = setInterval(nextSlide, interval);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1);
    setIsTransitioning(true);
    stopAutoPlay();
    startAutoPlay();
  };

  const nextSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  };

  const prevSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => prev - 1);
    setIsTransitioning(true);
  };

  // Infinite loop adjustment
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

  // Auto-play & visibility
  useEffect(() => {
    startAutoPlay();
    const handleVisibilityChange = () => {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stopAutoPlay();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interval, totalSlides]);

  // Drag functions (tablet/mobile only)
  const updateTransform = () => {
    if (!sliderRef.current) return;
    const containerWidth = sliderRef.current.offsetWidth || 1;
    const offsetPercent = (dragOffsetRef.current / containerWidth) * 100;
    sliderRef.current.style.transform = `translateX(${-currentIndex * 100 + offsetPercent}%)`;
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (totalSlides <= 1) return;
    if (window.innerWidth > 1024) return; // disable on desktop

    isDraggingRef.current = true;
    startPosRef.current = e.clientX;
    dragOffsetRef.current = 0;
    setIsTransitioning(false);
    stopAutoPlay();
    if (sliderRef.current) sliderRef.current.style.cursor = "grabbing";
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || totalSlides <= 1) return;
    if (window.innerWidth > 1024) return;

    dragOffsetRef.current = e.clientX - startPosRef.current;
    e.preventDefault();

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        updateTransform();
        animationFrameRef.current = null;
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || totalSlides <= 1) return;
    if (window.innerWidth > 1024) return;

    isDraggingRef.current = false;
    setIsTransitioning(true);
    if (sliderRef.current) sliderRef.current.style.cursor = "grab";

    const swipeThreshold = 50;
    if (dragOffsetRef.current < -swipeThreshold) nextSlide();
    else if (dragOffsetRef.current > swipeThreshold) prevSlide();

    dragOffsetRef.current = 0;
    updateTransform();

    stopAutoPlay();
    startAutoPlay();
  };

  const handlePointerLeave = () => {
    if (isDraggingRef.current) handlePointerUp();
  };

  // Slide content
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
          draggable="false"
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

  if (totalSlides === 0)
    return (
      <div className="relative w-full h-[400px] md:h-[540px] flex items-center justify-center bg-[#641609] text-white">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z"
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

  if (totalSlides === 1)
    return (
      <div className="relative w-full h-[400px] md:h-[540px] bg-[#641609]">
        <SlideContent slide={sortedSlidesData[0]} priority={true} />
      </div>
    );

  return (
    <div
      className="relative w-full h-[600px] md:h-[540px] overflow-hidden bg-[#641609]"
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={sliderRef}
        className="flex w-full h-full"
        style={{
          transform: `translateX(${-currentIndex * 100}%)`,
          transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
          cursor: "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
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

      {/* Dot indicators */}
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
