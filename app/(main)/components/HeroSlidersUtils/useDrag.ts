"use client";
import { useRef, PointerEvent } from "react";

interface UseDragProps {
  sliderRef: React.RefObject<HTMLDivElement | null>;
  currentIndex: number;
  totalSlides: number;
  nextSlide: () => void;
  prevSlide: () => void;
  stopAutoPlay: () => void;
  startAutoPlay: () => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

export function useDrag({
  sliderRef,
  currentIndex,
  totalSlides,
  nextSlide,
  prevSlide,
  stopAutoPlay,
  startAutoPlay,
  setIsTransitioning,
}: UseDragProps) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const updateTransform = () => {
    if (!sliderRef.current) return;
    const containerWidth = sliderRef.current.offsetWidth || 1;
    const offsetPercent = (dragOffsetRef.current / containerWidth) * 100;
    sliderRef.current.style.transform = `translateX(${-currentIndex * 100 + offsetPercent}%)`;
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (totalSlides <= 1 || window.innerWidth > 1024) return;
    isDraggingRef.current = true;
    startPosRef.current = e.clientX;
    dragOffsetRef.current = 0;
    setIsTransitioning(false);
    stopAutoPlay();
    if (sliderRef.current) sliderRef.current.style.cursor = "grabbing";
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || totalSlides <= 1 || window.innerWidth > 1024)
      return;
    e.preventDefault();
    dragOffsetRef.current = e.clientX - startPosRef.current;
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        updateTransform();
        animationFrameRef.current = null;
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || totalSlides <= 1 || window.innerWidth > 1024)
      return;
    isDraggingRef.current = false;
    setIsTransitioning(true);
    if (sliderRef.current) sliderRef.current.style.cursor = "grab";

    const swipeThreshold = 50;
    if (dragOffsetRef.current < -swipeThreshold) {
      nextSlide();
    } else if (dragOffsetRef.current > swipeThreshold) {
      prevSlide();
    } else {
      // Snap back if swipe is not far enough
      const currentTransform = `translateX(${-currentIndex * 100}%)`;
      if (sliderRef.current)
        sliderRef.current.style.transform = currentTransform;
    }

    dragOffsetRef.current = 0;
    startAutoPlay();
  };

  const handlePointerLeave = () => {
    if (isDraggingRef.current) handlePointerUp();
  };

  // Returns props with the correct 'onEvent' names
  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerLeave,
  };
}
