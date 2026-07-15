"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    title: "Cyber Congress 25",
    gradient: "from-primary via-secondary to-primary/60",
    pattern: "M20,30 L60,10 L90,40 L70,80 L30,70 Z",
  },
  {
    id: 2,
    title: "Shastra 25",
    gradient: "from-secondary via-primary to-accent/30",
    pattern: "M40,20 L80,20 L80,60 L60,80 L20,60 Z",
  },
  {
    id: 3,
    title: "Chrakuvyh 24",
    gradient: "from-accent/40 via-primary to-secondary",
    pattern: "M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z",
  },
];

export default function GalleryPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  return (
    <section id="gallery" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Memories
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Previous Events
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            A glimpse into our events, workshops, and the vibrant community
            that makes it all happen.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {galleryItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              onClick={() => setLightbox(item.id)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden glass-card cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label={`View ${item.title}`}
            >
              {/* Gradient placeholder image */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
              />
              <div className="absolute inset-0 bg-grid opacity-20" />

              {/* Decorative SVG */}
              <svg
                className="absolute inset-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={item.pattern}
                  stroke="rgba(248,250,252,0.3)"
                  strokeWidth="0.5"
                  fill="none"
                />
              </svg>

              {/* Hover zoom overlay */}
              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <span className="text-foreground font-heading font-semibold text-sm sm:text-base translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </span>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/80 to-transparent">
                <p className="text-xs text-muted/80 font-medium">
                  {item.title}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Gallery lightbox"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 p-2 rounded-lg glass text-muted hover:text-foreground transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const item = galleryItems.find((g) => g.id === lightbox);
              if (!item) return null;
              return (
                <div className="relative w-full h-full">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-70`}
                  />
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="font-heading text-2xl font-bold text-foreground text-glow">
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
