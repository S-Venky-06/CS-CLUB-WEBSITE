"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, ArrowUpRight } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    title: "Cyber Congress",
    description: "The Cyber Congress focuses on building awareness and skills in cybersecurity. The program introduces core threat vectors, digital hygiene practices, and industry career pathways, progressing into advanced security concepts like machine learning, threat intelligence, and defensive architectures, concluding with practical hands-on laboratories using Wireshark and Burp Suite.",
    gradient: "from-primary via-cyan to-accent",
    glowColor: "rgba(108,63,255,0.3)",
  },
  {
    id: 2,
    title: "Shastra",
    description: "A fun, one-day event showcasing cybersecurity topics through interactive games.",
    gradient: "from-cyan via-primary to-accent",
    glowColor: "rgba(0,240,255,0.3)",
  },
  {
    id: 3,
    title: "Chrakuvyh",
    description: "A signature capture-the-flag (CTF) competition designed to challenge participants across multiple disciplines of information security. Challenges span cryptography, reverse engineering, web exploitation, network forensics, and binary analysis.",
    gradient: "from-accent via-cyan to-primary",
    glowColor: "rgba(255,85,0,0.3)",
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
    <section id="gallery" className="relative py-28 sm:py-36 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 relative"
        >
          <div className="inline-block relative mb-4">
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-cyan block relative z-10">
              Memories
            </span>
            {/* Animated underline sweep */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
              className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent origin-left"
            />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Previous <span className="gradient-text">Events</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            A glimpse into our events, workshops, and the vibrant community
            that makes it all happen.
          </p>
        </motion.div>

        {/* Gallery Grid - Sleek Button style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto perspective-[1000px]">
          {galleryItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 40, rotateX: 20 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i, type: "spring", stiffness: 100 }}
              onClick={() => setLightbox(item.id)}
              className="group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl glass-card border border-glass-border bg-surface/30 hover:bg-surface/60 transition-all duration-500 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-cyan overflow-hidden transform-gpu hover:-translate-y-2 hover:scale-[1.03] shadow-lg hover:shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
              aria-label={`View details for ${item.title}`}
            >
              {/* Highlight background glow on hover */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500`} 
              />
              <div 
                className="absolute -inset-4 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10"
                style={{ background: item.glowColor }}
              />

              <div className="flex items-center gap-4 relative z-10">
                {/* Visual indicator tag */}
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${item.gradient} flex-shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover:animate-pulse`} />
                <span className="font-heading text-lg font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan transition-all duration-300">
                  {item.title}
                </span>
              </div>

              {/* Arrow indicator */}
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan group-hover:border-cyan transition-all duration-300 relative z-10 overflow-hidden">
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-[#050507] transition-all duration-300 group-hover:scale-110" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2" />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#050507]/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-label="Gallery lightbox"
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 sm:top-8 sm:right-8 p-3 rounded-full glass-card hover:bg-white/10 text-muted hover:text-white transition-all hover:rotate-90 z-50 shadow-lg"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl glass-prominent border border-glass-border-hover rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const item = galleryItems.find((g) => g.id === lightbox);
                if (!item) return null;
                return (
                  <>
                    {/* Left Column - Mini visual badge */}
                    <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden relative border border-white/10 flex-shrink-0 shadow-inner group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-700`} />
                      <div className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
                      
                      {/* Animated Mesh Gradient background instead of SVG pattern */}
                      <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0%, transparent 50%)` }} />
                      
                      <div className="absolute inset-0 flex items-center justify-center p-6 backdrop-blur-sm">
                        <p className="font-heading text-3xl font-bold text-white text-center text-glow drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Text Details */}
                    <div className="flex-1 flex flex-col justify-center space-y-5">
                      <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                          <span className="text-xs font-bold text-cyan uppercase tracking-widest">
                            Event Archive
                          </span>
                        </div>
                        <h3 className="font-heading text-3xl font-bold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <div className="h-px bg-gradient-to-r from-glass-border-hover to-transparent" />
                      <p className="text-sm text-muted leading-relaxed font-medium">
                        {item.description}
                      </p>
                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={() => setLightbox(null)}
                          className="px-6 py-3 rounded-xl bg-surface/50 hover:bg-surface border border-glass-border hover:border-cyan text-sm text-foreground font-semibold transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
