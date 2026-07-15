"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.215, 0.610, 0.355, 1.000] }} // EaseOutCubic
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}
