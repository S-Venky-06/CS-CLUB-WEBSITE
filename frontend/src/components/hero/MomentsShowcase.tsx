"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const MOMENT_IMAGES = [
  {
    src: "/moments/_MG_0503.jpg",
    alt: "Cybersecurity Club event session collaborating in lab",
  },
  {
    src: "/moments/DSC00125.jpg",
    alt: "Cybersecurity Club workshop and live coding presentation",
  },
  {
    src: "/moments/IMG_0924.JPG",
    alt: "Cybersecurity Club members listening to speaker during event",
  },
  {
    src: "/moments/IMG_1103.JPG",
    alt: "GCET Cybersecurity Club team hackathon presentation screen",
  },
  {
    src: "/moments/IMG_3169.JPG",
    alt: "Cybersecurity Club student working on forensics exercise",
  },
  {
    src: "/moments/IMG_3951.JPG",
    alt: "Students interacting at GCET Cybersecurity Club meetup",
  },
];

export default function MomentsShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Prevent server/client hydration mismatch by randomizing on mount
  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * MOMENT_IMAGES.length));
    setHasMounted(true);
  }, []);

  // Auto-transition timer
  useEffect(() => {
    if (isHovered || !hasMounted) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Choose a random next index that is different from the current one
        let nextIndex = prev;
        if (MOMENT_IMAGES.length > 1) {
          while (nextIndex === prev) {
            nextIndex = Math.floor(Math.random() * MOMENT_IMAGES.length);
          }
        } else {
          nextIndex = (prev + 1) % MOMENT_IMAGES.length;
        }
        return nextIndex;
      });
    }, 6000); // 6 seconds

    return () => clearInterval(interval);
  }, [isHovered, hasMounted]);

  if (!hasMounted) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
        <div className="w-[340px] h-[340px] rounded-2xl bg-[#13131A]/85 border border-glass-border/30 animate-pulse" />
      </div>
    );
  }

  const currentImage = MOMENT_IMAGES[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Ambient purple glow behind */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none ${
          isHovered ? "opacity-55" : "opacity-35"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Glassmorphic card frame wrapper */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-[340px] h-[340px] rounded-2xl bg-[#13131A]/85 border border-glass-border shadow-[0_0_30px_rgba(108,99,255,0.12)] p-4.5 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:border-accent/40 hover:shadow-[0_0_40px_rgba(108,99,255,0.25)]"
      >
        {/* Carousel image slide viewport */}
        <div className="relative w-full h-[260px] rounded-xl overflow-hidden bg-[#0B0B0F]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                priority={currentIndex === 0 || currentIndex === 1}
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover transition-transform duration-700 ease-out pointer-events-none select-none"
                style={{
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Small pagination dots */}
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {MOMENT_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? "bg-accent w-4"
                  : "bg-muted/40 hover:bg-muted/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
