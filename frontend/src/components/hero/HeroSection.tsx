"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import HeroIllustration from "./HeroIllustration";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-muted mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Defending the Digital Frontier</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-4"
            >
              <span className="text-foreground">CYBERSECURITY</span>
              <br />
              <span className="gradient-text-primary">CLUB OF GCET</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="font-heading text-lg sm:text-xl text-secondary font-medium tracking-widest uppercase mb-4"
            >
              Learn &bull; Secure &bull; Innovate
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-muted text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              A student-driven community at GCET dedicated to fostering
              cybersecurity excellence through hands-on workshops, CTF
              competitions, and collaborative research in digital defense.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/events"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:brightness-110 transition-all duration-300"
              >
                Explore Events
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl glass-card text-foreground font-semibold text-sm hover:border-secondary/40 transition-all duration-300"
              >
                Learn More
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-8 mt-12 justify-center lg:justify-start"
            >
              {[
                { value: "12", label: "Members", href: "/members" },
                { value: "3", label: "Major Events", href: "/events" },
              ].map((stat, i) => (
                <a
                  key={i}
                  href={stat.href}
                  className="text-center group/stat hover:opacity-80 transition-opacity"
                >
                  <p className="font-heading text-2xl font-bold text-foreground group-hover/stat:text-accent transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right — Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
