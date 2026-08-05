"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MomentsShowcase from "./MomentsShowcase";

// Animated counter component for the stats
function AnimatedCounter({ value, label, href, delay }: { value: number; label: string; href: string; delay: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const incrementTime = duration / end;
    
    let timer: NodeJS.Timeout;
    
    const runTimer = () => {
      timer = setTimeout(() => {
        start += 1;
        setCount(start);
        if (start < end) {
          runTimer();
        }
      }, incrementTime);
    };
    
    // Initial delay before counting
    setTimeout(runTimer, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [value, isInView, delay]);

  return (
    <a
      ref={ref}
      href={href}
      className="text-center group/stat hover:opacity-100 transition-opacity relative"
    >
      <div className="absolute -inset-4 rounded-xl bg-[#54276A]/0 group-hover/stat:bg-[#54276A]/20 transition-colors duration-300 blur-sm -z-10" />
      <p className="font-heading text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EDEAF2] via-[#B23A87] to-[#F47820] group-hover/stat:scale-110 transition-all duration-300">
        {count}
      </p>
      <p className="text-xs text-[#8B8496] mt-1 uppercase tracking-widest font-semibold">{label}</p>
      {/* Animated underline */}
      <div className="h-0.5 w-0 bg-gradient-to-r from-transparent via-[#F47820] to-transparent group-hover/stat:w-full transition-all duration-500 mt-2 mx-auto" />
    </a>
  );
}

// Letter animation variants
const letterContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const letterVariant = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 12, stiffness: 200 },
  },
};

// Typewriter variants
const typewriterVariant = {
  hidden: { opacity: 0, width: "0%" },
  visible: { 
    opacity: 1, 
    width: "100%",
    transition: { delay: 0.8, duration: 1.5, ease: "easeInOut" as const }
  }
};

export default function HeroSection() {
  const title1 = "CYBERSECURITY".split("");
  const title2 = "CLUB OF GCET".split("");

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Left — Text Content */}
          <div className="text-center lg:text-left z-10 relative">
            {/* Glow behind text */}
            <div className="absolute top-1/2 left-1/2 lg:left-0 -translate-x-1/2 lg:-translate-x-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Terminal Style Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#150F1F]/90 border border-[#7A1D5C]/60 text-xs font-mono mb-8 relative overflow-hidden group shadow-[0_0_20px_rgba(244,120,32,0.15)] backdrop-blur-md"
            >
              <div className="flex items-center gap-1.5 text-[#F47820] font-bold select-none">
                <Terminal className="w-3.5 h-3.5" />
                <span>$</span>
              </div>
              <span className="tracking-wide text-[#EDEAF2] font-semibold">Defending the Digital Frontier</span>
              <span className="inline-block w-1.5 h-3.5 bg-[#F47820] animate-pulse rounded-xs" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight mb-6"
            >
              <span className="block text-[#EDEAF2] drop-shadow-[0_0_20px_rgba(178,58,135,0.4)]">
                CYBERSECURITY
              </span>
              <span className="block gradient-text mt-1">
                CLUB OF GCET
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-heading text-base sm:text-lg lg:text-xl text-[#F47820] font-bold tracking-[0.25em] uppercase mb-6 drop-shadow-[0_0_15px_rgba(244,120,32,0.4)]"
            >
              Learn &bull; Secure &bull; Innovate
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#8B8496] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              A student-driven community at GCET dedicated to fostering
              cybersecurity excellence through hands-on workshops, CTF
              competitions, and collaborative research in digital defense.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-row items-center gap-3 sm:gap-5 justify-center lg:justify-start w-full max-w-sm sm:max-w-none mx-auto lg:mx-0"
            >
              <Link
                href="/events"
                className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-[#EDEAF2] font-bold text-xs sm:text-sm shadow-lg shadow-[#F47820]/30 overflow-hidden transition-all duration-300 hover:shadow-[#F47820]/60 hover:-translate-y-1 flex-1 sm:flex-initial text-center uppercase tracking-wider"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 whitespace-nowrap">Explore Events</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              
              <a
                href="#about"
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl glass-card text-[#EDEAF2] font-bold text-xs sm:text-sm transition-all duration-300 hover:border-[#F47820]/60 hover:bg-[#F47820]/10 hover:text-[#F47820] hover:-translate-y-1 flex-1 sm:flex-initial text-center whitespace-nowrap uppercase tracking-wider"
              >
                Learn More
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-6 sm:gap-12 mt-10 sm:mt-16 justify-center lg:justify-start max-w-xs sm:max-w-none mx-auto lg:mx-0"
            >
              <AnimatedCounter value={14} label="Members" href="/members" delay={1.8} />
              <AnimatedCounter value={3} label="Major Events" href="/events" delay={2.0} />
            </motion.div>
          </div>

          {/* Right — Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="block relative z-10"
          >
            <MomentsShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
