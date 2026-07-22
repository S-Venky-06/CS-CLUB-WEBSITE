"use client";

import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  announcementId: string;
  message: string;
  active: boolean;
  createdAt: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDismissed, setIsDismissed] = useState(true); // Default to true, verify on mount

  useEffect(() => {
    const fetchActiveBanners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements`);
        const json = await res.json();
        if (res.ok && json.success && json.data.length > 0) {
          const activeItems: Announcement[] = json.data;
          
          // Check if the newest active announcement is dismissed in localStorage
          const newestId = activeItems[0]?.announcementId;
          const dismissedId = localStorage.getItem("dismissed_announcement_id");
          
          if (dismissedId !== newestId) {
            setAnnouncements(activeItems);
            setIsDismissed(false);
          }
        }
      } catch (err) {
        console.warn("Announcement banner failed to load active broadcasts:", err);
      }
    };

    fetchActiveBanners();
  }, []);

  // Slide interval if multiple banners are active
  useEffect(() => {
    if (announcements.length <= 1 || isDismissed) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [announcements, isDismissed]);

  const handleDismiss = () => {
    if (announcements.length > 0) {
      // Dismiss the newest one
      localStorage.setItem("dismissed_announcement_id", announcements[0].announcementId);
    }
    setIsDismissed(true);
  };

  if (isDismissed || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIdx];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full relative bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-amber-500/20 border-b border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md z-50 overflow-hidden"
      >
        {/* Subtle scanline animation overlay */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
            {/* Glowing Megaphone icon */}
            <Megaphone className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />

            {/* Neon Badge */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase tracking-wider animate-pulse flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              LATEST UPDATE
            </span>
            
            {/* Sliding text */}
            <div className="relative overflow-hidden h-5 w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentAnnouncement.announcementId}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-bold text-amber-200/90 text-center truncate px-1 tracking-wide"
                >
                  {currentAnnouncement.message}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-amber-500/10 text-amber-400/70 hover:text-amber-300 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
