"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type AnimationVariant = "fade-up" | "fade-blur" | "slide-left" | "slide-right" | "scale-in";

interface SectionRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
  once?: boolean;
}

export default function SectionReveal({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
  once = true,
}: SectionRevealProps) {
  const variants: Record<string, Variants> = {
    "fade-up": {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
    },
    "fade-blur": {
      hidden: { opacity: 0, filter: "blur(12px)", y: 20 },
      visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
    },
    "slide-left": {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
    },
    "slide-right": {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
    },
    "scale-in": {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-100px" }}
      variants={variants[variant]}
      className={className}
    >
      {children}
    </motion.div>
  );
}
