"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, Radio } from "lucide-react";

interface ActiveEventPopupProps {
  eventTitle?: string;
  eventCategory?: string;
  registerTargetId?: string;
}

export default function ActiveEventPopup({
  eventTitle = "New Club Members Registration — For Juniors",
  eventCategory = "Recruitment Drive",
  registerTargetId = "featured-event",
}: ActiveEventPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("active_event_popup_dismissed");
    if (!isDismissed) {
      // Delay entrance slightly for smoother UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("active_event_popup_dismissed", "true");
  };

  const handleRegisterClick = () => {
    handleDismiss();
    if (pathname === "/events") {
      const element = document.getElementById(registerTargetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push("/events");
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="relative glass-prominent rounded-2xl p-4 sm:p-5 border border-[#F47820]/50 shadow-[0_10px_35px_rgba(244,120,32,0.25)] overflow-hidden bg-[#150F1F]/95 backdrop-blur-xl">
            {/* Top Glowing Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820]" />

            {/* Background Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#B23A87]/10 to-[#F47820]/15 blur-xl pointer-events-none -z-10" />

            <div className="flex items-start justify-between gap-3 mb-2">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F47820]/15 border border-[#F47820]/40 text-[11px] font-mono font-bold text-[#F47820]">
                <Radio className="w-3.5 h-3.5 text-[#F47820] animate-pulse" />
                <span className="uppercase tracking-wider">EVENT IS NOW LIVE</span>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Content */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#B23A87] font-bold block">
                {eventCategory}
              </span>
              <h4 className="font-heading text-base sm:text-lg font-bold text-[#EDEAF2] leading-snug">
                {eventTitle}
              </h4>
              <p className="text-xs text-[#8B8496] font-medium leading-relaxed">
                Registrations are officially open! Secure your spot in the Cybersecurity Club before slots fill up.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleRegisterClick}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-[#EDEAF2] font-bold text-xs sm:text-sm shadow-md shadow-[#F47820]/30 hover:shadow-[#F47820]/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FFA24A] animate-pulse" />
                <span>GO REGISTER NOW!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
