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
        className="w-full relative bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 border-b border-glass-border/30 backdrop-blur-md z-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
            {/* Megaphone icon */}
            <Megaphone className="w-4 h-4 text-primary flex-shrink-0 animate-bounce" />
            
            {/* Sliding text */}
            <div className="relative overflow-hidden h-5 w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentAnnouncement.announcementId}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-semibold text-foreground/90 text-center truncate px-2"
                >
                  {currentAnnouncement.message}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
