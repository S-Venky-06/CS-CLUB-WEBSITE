"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ArrowRight, Check, AlertCircle, Loader2, X, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function FeaturedEvent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [motivationText, setMotivationText] = useState("");
  const [phone, setPhone] = useState("");
  const [year, setYear] = useState("2nd Year");
  const [section, setSection] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [rollNumber, setRollNumber] = useState("");
  const [projects, setProjects] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [tryhackme, setTryhackme] = useState("");
  const [hackthebox, setHackthebox] = useState("");
  const [otherComments, setOtherComments] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isValidPhone = /^[0-9]{10}$/.test(phone);
  const isValidRoll = rollNumber.trim().length > 0;
  const isValidSection = section.trim().length > 0;

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          eventId: "evt-01",
          name: userName,
          motivation: motivationText,
          phone,
          year,
          section,
          branch,
          rollNumber,
          projects,
          linkedin,
          tryhackme,
          hackthebox,
          otherComments,
        }),
      });

      clearTimeout(timeoutId);
      const json = await res.json();

      if (res.status === 201 || res.status === 409) {
        setIsRegistered(true);
        setSuccessMessage("You are successfully registered for the Junior Registration!");
        setMotivationText("");
        setPhone("");
        setSection("");
        setRollNumber("");
        setProjects("");
        setLinkedin("");
        setTryhackme("");
        setHackthebox("");
        setOtherComments("");
        setIsModalOpen(false);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Registration failed. Please try again.");
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setErrorMessage("Registration request timed out. Please check your internet connection or try again.");
      } else {
        setErrorMessage("Could not connect to the server. Please try again later.");
      }
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsRegistering(false);
    }
  };

  const FloatingInput = ({ id, type = "text", value, onChange, label, placeholder = " ", maxLength, error }: any) => (
    <div className="relative mb-2">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`peer w-full px-4 pt-6 pb-2 rounded-xl bg-[#0D0D15] border transition-all duration-300 text-white font-medium text-sm focus:outline-none focus:bg-[#12121D] ${
          error ? "border-red-500 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "border-white/20 focus:border-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        }`}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-[10px] uppercase tracking-wider font-semibold text-cyan transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-cyan pointer-events-none"
      >
        {label}
      </label>
      {error && <span className="absolute -bottom-5 left-2 text-[10px] text-red-400 font-bold">{error}</span>}
    </div>
  );

  return (
    <section id="events" className="relative py-28 sm:py-36 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-xs font-semibold tracking-widest uppercase text-cyan mb-6 relative overflow-hidden group">
            <span className="relative z-10">Upcoming Event</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Featured <span className="gradient-text">Event</span>
          </h2>
          <p className="text-muted text-lg sm:text-xl max-w-2xl mx-auto font-medium">
            Don&apos;t miss our next flagship event — an opportunity to learn,
            compete, and connect with fellow cybersecurity enthusiasts.
          </p>
        </motion.div>

        {/* Event Card */}
        <motion.article
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto relative group"
        >
          {/* Animated gradient border for card */}
          <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-primary via-cyan to-accent opacity-30 group-hover:opacity-70 transition-opacity duration-500 blur-[2px]" />
          
          <div className="relative glass-prominent overflow-hidden rounded-2xl flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Left/Top side: Visual Banner */}
            <div className="relative md:w-2/5 h-56 md:h-auto overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-[#1a0f30] to-accent/20 z-10 mix-blend-multiply" />
              <div className="absolute inset-0 bg-grid opacity-50 z-10" />
              
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-accent text-white text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,85,0,0.4)] flex items-center gap-1.5 animate-pulse-soft">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Event
                </span>
              </div>
              
              {/* Decorative geometric */}
              <svg
                className="absolute right-0 bottom-0 w-40 h-40 opacity-30 z-20 group-hover:scale-110 transition-transform duration-700"
                viewBox="0 0 120 120"
                fill="none"
              >
                <polygon
                  points="60,10 110,40 110,90 60,120 10,90 10,40"
                  stroke="rgba(0, 240, 255, 0.5)"
                  strokeWidth="0.5"
                />
                <polygon
                  points="60,30 90,50 90,80 60,100 30,80 30,50"
                  stroke="rgba(255, 85, 0, 0.5)"
                  strokeWidth="1"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
                <Sparkles className="w-8 h-8 text-cyan mb-3 opacity-80" />
                <p className="font-heading text-2xl sm:text-3xl font-bold text-white text-glow leading-tight">
                  Junior<br/>Registrations
                </p>
              </div>
            </div>

            {/* Right/Bottom side: Details & Action */}
            <div className="md:w-3/5 p-8 sm:p-10 flex flex-col relative z-20">
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {eventDetails.title}
              </h3>

              <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
                <div className="flex items-center gap-2 text-sm text-cyan font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{eventDetails.dateLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cyan font-medium">
                  <Clock className="w-4 h-4" />
                  <span>All Day</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cyan font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>{eventDetails.location}</span>
                </div>
              </div>

              <p className="text-muted text-base leading-relaxed mb-8 flex-grow">
                {eventDetails.description}
                {eventDetails.warningNote && (
                  <span className="block mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm">
                    {eventDetails.warningNote}
                  </span>
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {eventDetails.status !== "active" ? (
                  <button
                    disabled
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-surface/50 border border-glass-border text-muted font-semibold text-sm cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                ) : isRegistered ? (
                  <button
                    disabled
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  >
                    <Check className="w-4 h-4" />
                    You're Registered!
                  </button>
                ) : (
                  <div className="relative group/btn w-full sm:w-auto inline-block">
                    {/* Glowing pulse ring behind button */}
                    <div className="absolute -inset-1 rounded-xl bg-cyan blur-md opacity-40 group-hover/btn:opacity-80 transition-opacity duration-300 animate-pulse-soft" />
                    <button
                      onClick={() => {
                        if (!user) {
                          setErrorMessage("Please sign in with Google in the top navigation menu to register.");
                          setTimeout(() => setErrorMessage(""), 5000);
                        } else {
                          setIsTipModalOpen(true);
                        }
                      }}
                      disabled={isRegistering}
                      className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#00F0FF] text-black font-extrabold text-sm hover:bg-white hover:text-black border-2 border-cyan shadow-[0_0_25px_rgba(0,240,255,0.7)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 z-10"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          Registering...
                        </>
                      ) : (
                        <>
                          Register Now
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="mt-5 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mt-5 flex flex-col gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">{successMessage}</span>
                  </div>
                  <p className="text-emerald-400/70 text-[10px] mt-1 border-t border-emerald-500/20 pt-2">
                    📧 Please check your registered Google email inbox (and spam folder) for the confirmation details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.article>
      </div>

      {/* Tip Modal */}
      <AnimatePresence>
        {isTipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTipModalOpen(false)}
              className="absolute inset-0 bg-[#050507]/90 backdrop-blur-md cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-2xl glass-prominent border border-glass-border-hover p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan to-accent" />

              <div className="flex items-center gap-4 border-b border-white/10 pb-5 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 border-2 border-primary/40 shadow-[0_0_15px_rgba(108,63,255,0.3)]">
                    <img 
                      src="/members/president.png" 
                      alt="Dhanush Reddy" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#13131A] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-foreground text-base">
                    Dhanush Reddy
                  </h4>
                  <p className="text-[10px] text-cyan font-bold tracking-[0.15em] uppercase mt-0.5">
                    Club President • Incoming Message
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-sm leading-relaxed text-muted">
                <div className="rounded-xl bg-surface/50 border border-glass-border p-5 relative shadow-inner">
                  <div className="absolute top-5 -left-1.5 w-3 h-3 bg-surface border-l border-b border-glass-border rotate-45" />
                  
                  <p className="font-bold text-cyan mb-3 flex items-center gap-1.5 text-xs tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pro Tip
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    Want to stand out? Make sure to provide your <strong className="text-cyan font-semibold">LinkedIn, Hack The Box, and TryHackMe profile links</strong> on the form!
                  </p>
                  <p className="text-sm text-foreground/90 mt-3 leading-relaxed">
                    If you don't have HTB or TryHackMe links yet, don't worry! You can describe any <strong className="text-cyan font-semibold">cybersecurity project</strong> you have done in the comments. Good luck!
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsTipModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsTipModalOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00F0FF] text-black font-extrabold text-xs sm:text-sm hover:bg-white border-2 border-cyan shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all cursor-pointer"
                >
                  Continue to Form
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Registration Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#050507]/90 backdrop-blur-md cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl rounded-2xl glass-prominent border border-glass-border-hover p-6 sm:p-8 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h4 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                  Confirm Event Registration
                </h4>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 pb-4 space-y-5 custom-scrollbar flex-grow">
                {/* 1. Email */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Email Address (Google Account)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={user?.email || ""}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-gray-300 text-sm cursor-not-allowed"
                  />
                </div>

                {/* 2. Display Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan transition-all"
                  />
                  {!isValidName && userName.length > 0 && (
                    <span className="text-[10px] text-red-400 mt-1 block font-bold">Required</span>
                  )}
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").substring(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan transition-all"
                  />
                  {!isValidPhone && phone.length > 0 && (
                    <span className="text-[10px] text-red-400 mt-1 block font-bold">Must be 10 digits</span>
                  )}
                </div>

                {/* 4. Roll Number */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 23R11A6236"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan transition-all"
                  />
                </div>

                {/* 5. Section */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Section *
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    placeholder="e.g. A, B, C"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan transition-all"
                  />
                </div>

                {/* 6. Academic Year */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="2nd Year"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-gray-300 text-sm cursor-not-allowed"
                  />
                </div>

                {/* 7. Branch */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Branch *
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan transition-all cursor-pointer"
                  >
                    <option value="CSE">CSE</option>
                    <option value="CSE (AIML)">CSE (AIML)</option>
                    <option value="CSE (DS)">CSE (DS)</option>
                    <option value="CSE (CS)">CSE (CS)</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* 8. LinkedIn */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    LinkedIn URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan transition-all"
                  />
                </div>

                {/* 9. TryHackMe */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    TryHackMe URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={tryhackme}
                    onChange={(e) => setTryhackme(e.target.value)}
                    placeholder="https://tryhackme.com/p/..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan transition-all"
                  />
                </div>

                {/* 10. Hack The Box */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Hack The Box URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={hackthebox}
                    onChange={(e) => setHackthebox(e.target.value)}
                    placeholder="https://app.hackthebox.com/profile/..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan transition-all"
                  />
                </div>

                {/* 11. Motivation */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Why do you want to join this club? *</span>
                    <span className={`text-[10px] font-bold ${wordCount < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {wordCount < 10 ? `Need ${10 - wordCount} more words` : `${wordCount}/2000`}
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={motivationText}
                    onChange={(e) => setMotivationText(e.target.value)}
                    placeholder="Describe your interest in cybersecurity..."
                    className={`w-full px-4 py-3 rounded-xl bg-[#0B0B13] border text-white text-sm placeholder:text-gray-600 focus:outline-none resize-none custom-scrollbar transition-all ${
                      wordCount > 0 && wordCount < 10 ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan"
                    }`}
                  />
                </div>

                {/* 12. Projects */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Projects (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    placeholder="Mention any cybersecurity or programming projects you have worked on..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan resize-none custom-scrollbar transition-all"
                  />
                </div>

                {/* 13. Other Comments */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                    Other Comments (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={otherComments}
                    onChange={(e) => setOtherComments(e.target.value)}
                    placeholder="Any questions or extra info..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan resize-none custom-scrollbar transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-5 mt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || !isValidMotivation || !isValidName || !isValidPhone || !isValidRoll || !isValidSection}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all cursor-pointer disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 disabled:shadow-none disabled:cursor-not-allowed bg-[#00F0FF] text-black hover:bg-white border-2 border-cyan shadow-[0_0_20px_rgba(0,240,255,0.6)]"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Confirm & Register
                      <Check className="w-5 h-5 text-black" />
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
