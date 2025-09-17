"use client";
import { useMemo, useRef } from "react";
import { HeroImage } from "./HeroSlidersUtils/types";
import { useSlider } from "./HeroSlidersUtils/useSlider";
import { useDrag } from "./HeroSlidersUtils/useDrag";
import HeroSlide from "./HeroSlidersUtils/HeroSlide";
import SliderDots from "./HeroSlidersUtils/SliderDots";

const NoBanners = () => (
  <div className="relative w-full h-[400px] md:h-[540px] flex items-center justify-center bg-[#641609] text-white">
    <div className="text-center">
      <p className="text-lg font-medium">No hero banners available</p>
      <p className="text-sm opacity-75 mt-2">
        Add some images to see them here
      </p>
    </div>
  </div>
);

interface HeroSlidersProps {
  images?: HeroImage[];
  interval?: number;
}

export default function HeroSliders({
  images = [],
  interval = 5000,
}: HeroSlidersProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  // Memoize slide preparation to avoid re-sorting on every render
  const { sortedSlides, loopedSlides, totalSlides } = useMemo(() => {
    const sorted = [...images].sort((a, b) => a.order - b.order);
    const total = sorted.length;
    const looped =
      total > 1 ? [sorted[total - 1], ...sorted, sorted[0]] : sorted;
    return { sortedSlides: sorted, loopedSlides: looped, totalSlides: total };
  }, [images]);

  const {
    currentIndex,
    isTransitioning,
    nextSlide,
    prevSlide,
    goToSlide,
    stopAutoPlay,
    startAutoPlay,
  } = useSlider(totalSlides, interval);

  const dragHandlers = useDrag({
    sliderRef,
    currentIndex,
    totalSlides,
    nextSlide,
    prevSlide,
    stopAutoPlay,
    startAutoPlay,
    setIsTransitioning: (val) => isTransitioning !== val,
  });

  if (totalSlides === 0) {
    return <NoBanners />;
  }

  if (totalSlides === 1) {
    return (
      <div className="relative w-full h-[400px] md:h-[540px] bg-[#641609]">
        <HeroSlide slide={sortedSlides[0]} priority={true} />
      </div>
    );
  }

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
        {...dragHandlers}
      >
        {loopedSlides.map((slide, idx) => (
          <HeroSlide
            key={idx}
            slide={slide}
            priority={slide.id === sortedSlides[0]?.id}
          />
        ))}
      </div>

      <SliderDots
        slides={sortedSlides}
        currentIndex={currentIndex}
        goToSlide={goToSlide}
      />
    </div>
  );
}
