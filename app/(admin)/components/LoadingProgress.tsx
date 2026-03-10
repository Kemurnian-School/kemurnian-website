"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement).closest("a");
      
      if (
        target && 
        target.href && 
        !target.target && 
        !target.download &&
        target.origin === window.location.origin
      ) {
        if (target.href === window.location.href) return;

        if (target.pathname === window.location.pathname && target.hash) return;

        setIsVisible(true);
        setWidth(70);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (width === 0) return;

    setWidth(100);
    
    const hide = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setWidth(0), 200);
    }, 500);

    return () => clearTimeout(hide);
  }, [pathname, searchParams]);

  return (
    <span
      className={`fixed h-1 bg-red-900 ease-out ${
        isVisible ? "transition-all duration-300 opacity-100" : "transition-none opacity-0"
      }`}
      style={{ width: `${width}%` }}
    />
  );
}
