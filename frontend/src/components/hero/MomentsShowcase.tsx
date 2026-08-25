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
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Prevent server/client hydration mismatch by randomizing on mount
  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * MOMENT_IMAGES.length));
    setHasMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    // Max rotation 8 degrees
    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

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
      <div className="relative w-full max-w-[310px] sm:max-w-[360px] mx-auto aspect-square flex items-center justify-center pt-6 sm:pt-8">
        <div className="w-full h-full rounded-2xl glass-card border border-glass-border/30 animate-pulse" />
      </div>
    );
  }

  const currentImage = MOMENT_IMAGES[currentIndex];

  return (
    <div className="relative w-full max-w-[310px] sm:max-w-[360px] mx-auto flex flex-col items-center justify-center pt-6 sm:pt-8">
      
      {/* Floating Badge */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: -16, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="absolute top-0 z-20"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#F47820]/15 border border-[#F47820]/40 backdrop-blur-md shadow-[0_0_15px_rgba(244,120,32,0.3)]">
          <div className="w-2 h-2 rounded-full bg-[#F47820] animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-bold text-[#F47820] tracking-widest uppercase">Live Moments</span>
        </div>
      </motion.div>

      {/* Ambient purple glow behind */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          isHovered ? "opacity-60 scale-110" : "opacity-40 scale-100"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(84,39,106,0.3) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Glassmorphic card frame wrapper with holographic border */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-square rounded-2xl bg-surface/50 backdrop-blur-xl border border-glass-border shadow-2xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(84,39,106,0.35)] group z-10"
      >
        {/* Holographic Border Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-r from-primary via-cyan to-primary pointer-events-none p-[1px] -z-10">
           <div className="w-full h-full bg-surface/90 rounded-2xl" />
        </div>

        {/* Carousel image slide viewport */}
        <div className="relative w-full h-[220px] sm:h-[280px] rounded-xl overflow-hidden bg-[#0A0710]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
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

        {/* Small pagination dots with progress ring */}
        <div className="flex justify-center items-center gap-3 pt-3">
          {MOMENT_IMAGES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="relative flex items-center justify-center w-6 h-6 focus:outline-none group cursor-pointer"
                aria-label={`Go to slide ${index + 1}`}
              >
                {/* Background dot */}
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isActive ? 'bg-[#F47820]' : 'bg-muted/30 group-hover:bg-muted/60'}`} />
                
                {/* SVG Progress Ring */}
                {isActive && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="12" cy="12" r="10" 
                      fill="none" 
                      stroke="#F47820" 
                      strokeWidth="1.5" 
                      strokeDasharray="62.8"
                      strokeDashoffset="62.8"
                      className="animate-[circle-progress_6s_linear_forwards]"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes circle-progress {
          from { stroke-dashoffset: 62.8; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
