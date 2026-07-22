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
    }, 6000);

    return () => clearInterval(interval);
  }, [isHovered, hasMounted]);

  if (!hasMounted) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center pt-8">
        <div className="w-[360px] h-[360px] rounded-2xl glass-card border border-glass-border/30 animate-pulse" />
      </div>
    );
  }

  const currentImage = MOMENT_IMAGES[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex flex-col items-center justify-center pt-8">
      
      {/* Floating Badge */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: -20, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="absolute top-0 z-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/30 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          <span className="text-[10px] font-bold text-cyan tracking-widest uppercase">Live Moments</span>
        </div>
      </motion.div>

      {/* Ambient purple glow behind */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          isHovered ? "opacity-60 scale-110" : "opacity-40 scale-100"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(108,63,255,0.3) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Glassmorphic card frame wrapper with holographic border */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-[360px] h-[360px] rounded-2xl bg-surface/50 backdrop-blur-xl border border-glass-border shadow-2xl p-4 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(108,63,255,0.3)] group z-10"
      >
        {/* Holographic Border Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-r from-primary via-cyan to-primary pointer-events-none p-[1px] -z-10">
           <div className="w-full h-full bg-surface/90 rounded-2xl" />
        </div>

        {/* Carousel image slide viewport */}
        <div className="relative w-full h-[280px] rounded-xl overflow-hidden bg-[#050507]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                priority={currentIndex === 0 || currentIndex === 1}
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover transition-transform duration-[10000ms] ease-linear pointer-events-none select-none"
                style={{
                  transform: isHovered ? "scale(1.15)" : "scale(1.05)",
                }}
              />
              
              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Small pagination dots */}
        <div className="flex justify-center items-center gap-2 pt-2">
          {MOMENT_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden ${
                index === currentIndex
                  ? "bg-cyan w-6 shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                  : "bg-muted/30 w-1.5 hover:bg-muted/60 hover:w-3"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
