"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    title: "Cyber Congress 25",
    description: "The Cyber Congress focuses on building awareness and skills in cybersecurity. The program introduces core threat vectors, digital hygiene practices, and industry career pathways, progressing into advanced security concepts like machine learning, threat intelligence, and defensive architectures, concluding with practical hands-on laboratories using Wireshark and Burp Suite.",
    gradient: "from-primary via-secondary to-primary/60",
    pattern: "M20,30 L60,10 L90,40 L70,80 L30,70 Z",
  },
  {
    id: 2,
    title: "Shastra 25",
    description: "A fun, one-day event showcasing cybersecurity topics through interactive games.",
    gradient: "from-secondary via-primary to-accent/30",
    pattern: "M40,20 L80,20 L80,60 L60,80 L20,60 Z",
  },
  {
    id: 3,
    title: "Chrakuvyh 24",
    description: "A signature capture-the-flag (CTF) competition designed to challenge participants across multiple disciplines of information security. Challenges span cryptography, reverse engineering, web exploitation, network forensics, and binary analysis.",
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

        {/* Gallery Grid - Sleek Button style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {galleryItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              onClick={() => setLightbox(item.id)}
              className="group relative flex items-center justify-between p-4 rounded-xl glass-card border border-glass-border hover:border-accent/40 bg-surface/30 hover:bg-surface/60 transition-all duration-300 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-secondary overflow-hidden"
              aria-label={`View details for ${item.title}`}
            >
              {/* Highlight background glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
              
              <div className="flex items-center gap-3.5 relative z-10">
                {/* Visual indicator tag */}
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${item.gradient} flex-shrink-0`} />
                <span className="font-heading text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  {item.title}
                </span>
              </div>

              {/* Arrow indicator */}
              <svg
                className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-300 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-[#13131A] border border-glass-border rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const item = galleryItems.find((g) => g.id === lightbox);
              if (!item) return null;
              return (
                <>
                  {/* Left Column - Mini visual badge */}
                  <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-square rounded-xl overflow-hidden relative border border-glass-border/30 flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-70`} />
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    <svg
                      className="absolute inset-0 w-full h-full opacity-10"
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
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <p className="font-heading text-lg font-bold text-foreground text-center text-glow">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Text Details */}
                  <div className="flex-1 flex flex-col justify-center space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                        Event Detail
                      </span>
                      <h3 className="font-heading text-xl font-bold text-foreground mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                    <div className="h-px bg-glass-border/60" />
                    <p className="text-xs text-muted leading-relaxed">
                      {item.description}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setLightbox(null)}
                        className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-glass-border text-xs text-foreground font-semibold transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
