"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type SlideImage = {
  src: string;
  alt: string;
};

type HowItWorksSliderProps = {
  images: SlideImage[];
  title: string;
};

export default function HowItWorksSlider({
  images,
  title,
}: HowItWorksSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  function showPreviousImage() {
    setActiveIndex((current) => {
      return (current - 1 + images.length) % images.length;
    });
  }

  function showNextImage() {
    setActiveIndex((current) => {
      return (current + 1) % images.length;
    });
  }

  return (
    <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-[28px] border border-[#334155] bg-[#111827] p-3 transition duration-300 hover:scale-[1.02] hover:border-[#10B981] hover:shadow-[0_0_40px_rgba(16,185,129,0.12)] sm:min-h-[380px]">
      <div className="relative h-[260px] w-full sm:h-[350px]">
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 1024px) calc(100vw - 5rem), 50vw"
          className="animate-[imageFadeIn_0.25s_ease-out] rounded-2xl  object-contain object-center"
        />
      </div>

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={showPreviousImage}
            aria-label={`Show previous ${title} screenshot`}
            className="absolute left-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#10B981]/40 bg-[#0F172A]/90 text-[#D4F2D3] shadow-lg backdrop-blur transition hover:scale-105 hover:border-[#10B981] hover:bg-[#10B981] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] sm:left-4 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showNextImage}
            aria-label={`Show next ${title} screenshot`}
            className="absolute right-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#10B981]/40 bg-[#0F172A]/90 text-[#D4F2D3] shadow-lg backdrop-blur transition hover:scale-105 hover:border-[#10B981] hover:bg-[#10B981] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] sm:right-4 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <span className="absolute right-4 top-4 z-20 rounded-full border border-[#334155]/80 bg-[#0F172A]/85 px-3 py-1 text-xs font-medium text-[#CBD5E1] backdrop-blur">
            {activeIndex + 1} / {images.length}
          </span>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#334155]/80 bg-[#0F172A]/85 px-3 py-2 backdrop-blur">
            {images.map((image, imageIndex) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveIndex(imageIndex)}
                aria-label={`Show image ${imageIndex + 1} of ${
                  images.length
                } for ${title}`}
                aria-current={activeIndex === imageIndex ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${
                  activeIndex === imageIndex
                    ? "w-7 bg-[#10B981]"
                    : "w-2.5 bg-[#64748B] hover:bg-[#94A3B8]"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes imageFadeIn {
          from {
            opacity: 0;
            transform: scale(0.985);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}