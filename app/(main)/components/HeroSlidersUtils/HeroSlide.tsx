import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HeroImage } from "./types";

interface HeroSlideProps {
  slide: HeroImage;
  priority?: boolean;
}

export default function HeroSlide({ slide, priority = false }: HeroSlideProps) {
  const [src, setSrc] = useState(slide.image_urls);

  useEffect(() => {
    const updateSrc = () => {
      if (window.innerWidth <= 768) {
        setSrc(slide.mobile_image_urls || slide.image_urls);
      } else if (window.innerWidth <= 1024) {
        setSrc(slide.tablet_image_urls || slide.image_urls);
      } else {
        setSrc(slide.image_urls);
      }
    };

    updateSrc();
    window.addEventListener("resize", updateSrc);
    return () => window.removeEventListener("resize", updateSrc);
  }, [slide]);

  return (
    <div className="relative flex-shrink-0 w-full h-full">
      <Image
        src={src}
        alt="Hero Banner"
        width={1920}
        height={680}
        className="h-full w-full object-contain"
        priority={priority}
        draggable="false"
        sizes="100vw"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 font-raleway">
        <div className="max-w-sm md:max-w-3xl lg:max-w-4xl">
          {slide.header_text && (
            <h2
              className="tracking-wider mb-8 break-words text-lg md:text-2xl lg:text-3xl font-bold"
              style={{
                textShadow:
                  "2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)",
              }}
            >
              {slide.header_text}
            </h2>
          )}

          {slide.href_text && slide.button_text && (
            <Link href={slide.href_text}>
              <button
                className="text-md tracking-widest px-5 py-4 bg-transparent text-white border-3 border-btn-primary hover:bg-btn-primary transition-all duration-200 font-bold cursor-pointer"
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
    </div>
  );
}
