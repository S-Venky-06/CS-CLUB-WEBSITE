"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Check, ShieldAlert, Mail } from "lucide-react";

export default function GoogleAuthNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has acknowledged the notice during this session
    const isAcknowledged = sessionStorage.getItem("google_auth_notice_acknowledged");
    if (!isAcknowledged) {
      // Pop up shortly after page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcknowledge = () => {
    setIsOpen(false);
    sessionStorage.setItem("google_auth_notice_acknowledged", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleAcknowledge}
            className="fixed inset-0 bg-[#0A0710]/90 backdrop-blur-md cursor-pointer"
          />

          {/* Notice Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl glass-prominent border-2 border-[#F47820]/60 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,120,32,0.25)] overflow-hidden bg-[#150F1F] text-foreground z-10"
          >
            {/* Top Glowing Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820]" />

            {/* Background Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F47820]/15 blur-3xl rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleAcknowledge}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close notice"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon + Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F47820]/15 border border-[#F47820]/40 flex items-center justify-center text-[#F47820] shadow-[0_0_20px_rgba(244,120,32,0.3)] flex-shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#F47820]/15 border border-[#F47820]/30 text-[10px] font-mono font-bold text-[#F47820] tracking-widest uppercase">
                  IMPORTANT NOTICE
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-black text-white mt-1 leading-snug">
                  Sign In With Google
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4 my-5">
              <div className="p-4 rounded-2xl bg-[#0A0710]/80 border border-[#F47820]/30 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F47820]">
                  <Mail className="w-4 h-4 text-[#F47820]" />
                  <span>Use Personal Email (`@gmail.com`)</span>
                </div>
                <p className="text-xs text-[#EDEAF2] leading-relaxed font-medium">
                  When clicking <strong className="text-[#F47820]">"Sign in with Google"</strong>, please select your <strong>Personal Gmail Account</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>College/Institutional Email IDs (`@gcet.edu.in`) are NOT working</strong> due to organizational Google OAuth access restrictions.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2">
              <button
                onClick={handleAcknowledge}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-white font-extrabold text-sm shadow-lg shadow-[#F47820]/30 hover:shadow-[#F47820]/60 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#FFA24A]" />
                <span>I Understand — Proceed</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
