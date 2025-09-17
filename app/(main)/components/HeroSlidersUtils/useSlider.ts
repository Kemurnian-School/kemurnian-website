import { useState, useEffect, useRef } from "react";

export function useSlider(totalSlides: number, interval: number) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const nextSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  };

  const startAutoPlay = () => {
    if (totalSlides <= 1) return;
    stopAutoPlay();
    intervalRef.current = setInterval(nextSlide, interval);
  };

  const prevSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => prev - 1);
    setIsTransitioning(true);
  };

  const goToSlide = (index: number) => {
    stopAutoPlay();
    setCurrentIndex(index + 1);
    setIsTransitioning(true);
    startAutoPlay();
  };

  // Effect for infinite loop
  useEffect(() => {
    if (totalSlides <= 1) return;

    if (currentIndex === 0 || currentIndex === totalSlides + 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex === 0 ? totalSlides : 1);
      }, 500); // Must match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalSlides]);

  // Effect for autoplay and page visibility
  useEffect(() => {
    startAutoPlay();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stopAutoPlay();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interval, totalSlides]);

  return {
    currentIndex,
    isTransitioning,
    nextSlide,
    prevSlide,
    goToSlide,
    stopAutoPlay,
    startAutoPlay,
  };
}
