"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function FeaturedEvent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [motivationText, setMotivationText] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isValidPhone = /^[0-9]{10}$/.test(phone);

  const [eventDetails, setEventDetails] = useState({
    title: "New Club Members Registration — For Juniors",
    description: "Calling all juniors! Join the Cybersecurity Club of GCET to learn more about CTF, Cybersecurity and many more. No prior experience is required just curiosity and a passion for technology. Sign up!!!!",
    dateLabel: "Open Now",
    location: "Online Registration",
    warningNote: "Note : Only 2nd Years Can Register.",
    status: "active",
  });

  const getWordCount = (text: string) => {
    const normalized = text.replace(/[\s\r\n\t\u00a0\u2000-\u200b\u2028\u2029]+/g, " ");
    return normalized.trim().split(" ").filter(Boolean).length;
  };
  const wordCount = getWordCount(motivationText);
  const isValidMotivation = wordCount >= 10 && wordCount <= 2000;
  const isValidName = userName.trim().length > 0;

  useEffect(() => {
    if (!user) {
      setIsRegistered(false);
      setUserName("");
      return;
    }
    setUserName(user.name);

    const checkRegistration = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrations/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const registered = json.data.some((reg: any) => reg.eventId === "evt-01");
            setIsRegistered(registered);
          }
        }
      } catch (err) {
        console.error("Error checking registration:", err);
      }
    };

    checkRegistration();
  }, [user]);

  // Fetch featured event dynamic details
  useEffect(() => {
    const fetchFeaturedEvent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/featured`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const event = json.data;
          
          const formattedDate = new Date(event.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          let cleanDesc = event.description || "";
          let note = "";
          const noteIndex = cleanDesc.toLowerCase().indexOf("note :");
          if (noteIndex !== -1) {
            note = cleanDesc.substring(noteIndex);
            cleanDesc = cleanDesc.substring(0, noteIndex).trim();
          }

          setEventDetails({
            title: event.title,
            description: cleanDesc,
            dateLabel: formattedDate,
            location: event.location || "Online Registration",
            warningNote: note,
            status: event.status || "active",
          });
        }
      } catch (err) {
        console.warn("Failed to load featured event details, using fallbacks:", err);
      }
    };

    fetchFeaturedEvent();
  }, []);

  const handleRegister = async () => {
    if (!user) {
      setErrorMessage("Please sign in with Google in the top navigation menu to register.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setIsRegistering(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          eventId: "evt-01",
          name: userName,
          motivation: motivationText,
          phone,
        }),
      });

      const json = await res.json();

      if (res.status === 201 || res.status === 409) {
        setIsRegistered(true);
        setSuccessMessage("You are successfully registered for the Junior Registration!");
        setMotivationText("");
        setPhone("");
        setIsModalOpen(false);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Registration failed. Please try again.");
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (err) {
      setErrorMessage("Could not connect to the server. Please try again later.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <section id="events" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Upcoming
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Featured Event
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            Don&apos;t miss our next flagship event — an opportunity to learn,
            compete, and connect with fellow cybersecurity enthusiasts.
          </p>
        </motion.div>

        {/* Event Card */}
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto glass-card overflow-hidden group"
        >
          {/* Banner */}
          <div className="relative h-48 sm:h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/20 to-accent/10" />
            <div className="absolute inset-0 bg-grid opacity-30" />
            {/* Decorative elements */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-accent/90 text-white text-xs font-semibold">
                LIVE EVENT
              </span>
            </div>
            {/* Decorative geometric */}
            <svg
              className="absolute right-8 bottom-8 w-32 h-32 opacity-20"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden="true"
            >
              <polygon
                points="60,10 110,40 110,90 60,120 10,90 10,40"
                stroke="rgba(122,62,177,0.5)"
                strokeWidth="1"
                fill="none"
              />
              <polygon
                points="60,30 90,50 90,80 60,100 30,80 30,50"
                stroke="rgba(255,122,26,0.3)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
            {/* Center text on banner */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground text-center text-glow">
                Junior Registrations
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {eventDetails.title}
            </h3>

            <div className="flex flex-wrap gap-4 sm:gap-6 mb-5">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>{eventDetails.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Clock className="w-4 h-4 text-secondary" />
                <span>All Day</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{eventDetails.location}</span>
              </div>
            </div>

            <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
              {eventDetails.description}
              {eventDetails.warningNote && (
                <span className="block mt-2 text-red-500 font-semibold">
                  {eventDetails.warningNote}
                </span>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {eventDetails.status !== "active" ? (
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-glass-border/15 border border-glass-border/30 text-muted font-semibold text-sm transition-all duration-300 opacity-60 cursor-not-allowed"
                >
                  Registration Closed
                </button>
              ) : isRegistered ? (
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm transition-all duration-300"
                >
                  <Check className="w-4 h-4" />
                  Registered
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!user) {
                      setErrorMessage("Please sign in with Google in the top navigation menu to register.");
                      setTimeout(() => setErrorMessage(""), 5000);
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
                  disabled={isRegistering}
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Register Now
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </motion.article>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              <h4 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-6">
                Confirm Event Registration
              </h4>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Email Address (Google Account)
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl bg-surface/30 border border-glass-border text-muted text-sm select-none">
                    {user?.email}
                  </div>
                  <span className="text-[10px] text-muted/60 mt-1 block">
                    * This email is locked to your secure session.
                  </span>
                </div>

                <div>
                  <label htmlFor="modal-name" className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Display Name
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-[#181824] border border-glass-border text-foreground placeholder:text-muted/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="modal-phone" className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    id="modal-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").substring(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 rounded-xl bg-[#181824] border border-glass-border text-foreground placeholder:text-muted/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  {!isValidPhone && phone.length > 0 && (
                    <span className="text-[10px] text-red-400 mt-1 block">
                      Mobile number must be exactly 10 digits.
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="modal-motivation" className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Why do you want to join this club?
                  </label>
                  <textarea
                    id="modal-motivation"
                    rows={4}
                    value={motivationText}
                    onChange={(e) => setMotivationText(e.target.value)}
                    placeholder="Write a few sentences describing your motivation to join..."
                    className="w-full px-4 py-3 rounded-xl bg-[#181824] border border-glass-border text-foreground placeholder:text-muted/40 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-[10px] font-semibold ${wordCount < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {wordCount < 10
                        ? `At least 10 words required (Current: ${wordCount})`
                        : `${wordCount} words`
                      }
                    </span>
                    <span className="text-[10px] text-muted/60">
                      Max 2000 words
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-glass-border pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-glass-border text-muted hover:text-foreground hover:bg-surface/50 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || !isValidMotivation || !isValidName || !isValidPhone}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Confirm & Register
                      <Check className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
