"use client";

import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ArrowRight, Check, AlertCircle, Loader2, X, Sparkles, UploadCloud } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { load } from "@cashfreepayments/cashfree-js";

export default function FeaturedEvent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Parallax state
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  
  const layer1X = useTransform(springX, [0, 1], [-15, 15]);
  const layer1Y = useTransform(springY, [0, 1], [-15, 15]);
  const layer2X = useTransform(springX, [0, 1], [15, -15]);
  const layer2Y = useTransform(springY, [0, 1], [15, -15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  
  // Modal flow state: "idle" -> "form"
  const [modalStep, setModalStep] = useState<"idle" | "form">("idle");
  const [pendingRegistrationId, setPendingRegistrationId] = useState("");
  
  // Form fields
  const [userName, setUserName] = useState("");
  const [motivationText, setMotivationText] = useState("");
  const [phone, setPhone] = useState("");
  const [year, setYear] = useState("2nd Year");
  const [section, setSection] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [domain, setDomain] = useState("Logistics");
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
    eventId: "loading",
    title: "Loading Event...",
    description: "Fetching the latest event details...",
    dateLabel: "...",
    location: "...",
    warningNote: "",
    status: "inactive",
    price: 0,
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
            const registered = json.data.some((reg: any) => 
              reg.eventId === eventDetails.eventId && 
              (reg.paymentStatus === "CONFIRMED" || reg.paymentStatus === "FREE" || reg.paymentStatus === "SUCCESS")
            );
            setIsRegistered(registered);
          }
        }
      } catch (err) {
        console.error("Error checking registration:", err);
      }
    };

    checkRegistration();
  }, [user, eventDetails.eventId]);

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
            eventId: event.eventId,
            title: event.title,
            description: cleanDesc,
            dateLabel: formattedDate,
            location: event.location || "Online Registration",
            warningNote: note,
            status: event.status || "active",
            price: event.price || 0,
          });
        } else {
          setEventDetails({
            eventId: "none",
            title: "Stay Tuned for Upcoming Events!",
            description: "We are currently planning our next exciting event. Keep an eye on this space and our social media channels for announcements soon!",
            dateLabel: "TBA",
            location: "To Be Announced",
            warningNote: "",
            status: "inactive",
            price: 0,
          });
        }
      } catch (err) {
        console.warn("Failed to load featured event details, using fallbacks:", err);
        setEventDetails({
          eventId: "none",
          title: "Stay Tuned for Upcoming Events!",
          description: "We are currently planning our next exciting event. Keep an eye on this space and our social media channels for announcements soon!",
          dateLabel: "TBA",
          location: "To Be Announced",
          warningNote: "",
          status: "inactive",
          price: 0,
        });
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
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const formPayload = {
        eventId: eventDetails.eventId,
        name: userName,
        motivation: motivationText,
        phone,
        year,
        section,
        branch,
        domain,
        rollNumber,
        projects,
        linkedin,
        tryhackme,
        hackthebox,
        otherComments,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify(formPayload),
      });

      clearTimeout(timeoutId);
      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.message || "Registration failed. Please try again.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      if (json.data?.paymentStatus === "FREE") {
        // Free event registration success
        setIsRegistered(true);
        setSuccessMessage("You are successfully registered for the event!");
        resetForm();
      } else if (json.data?.paymentSessionId) {
        // Paid event - Invoke Cashfree
        const cashfree = await load({
          mode: "sandbox", // Use "sandbox" for testing. Use "production" for live
        });

        if (!cashfree) {
          throw new Error("Failed to load Cashfree SDK");
        }

        const result = await cashfree.checkout({
          paymentSessionId: json.data.paymentSessionId,
          redirectTarget: "_modal",
        });

        if (result.error) {
          setErrorMessage("Payment was not completed.");
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }

        if (result.redirect) {
          return; // Redirecting, stop here
        }

        if (result.paymentDetails) {
          // Verify with backend
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              orderId: json.data.orderId,
              registrationId: json.data.registrationId
            }),
          });
          const verifyJson = await verifyRes.json();
          if (verifyJson.data?.orderStatus === "PAID") {
            setIsRegistered(true);
            setSuccessMessage("Payment successful! Your registration is confirmed.");
            resetForm();
          } else {
            setErrorMessage(`Payment status is ${verifyJson.data?.orderStatus}. Please contact support if money was deducted.`);
            setTimeout(() => setErrorMessage(""), 7000);
          }
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setErrorMessage("Registration request timed out. Please check your internet connection.");
      } else {
        setErrorMessage("Could not connect to the server. Please try again later.");
      }
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsRegistering(false);
    }
  };

  const resetForm = () => {
    setMotivationText("");
    setPhone("");
    setSection("");
    setDomain("Logistics");
    setRollNumber("");
    setProjects("");
    setLinkedin("");
    setTryhackme("");
    setHackthebox("");
    setOtherComments("");
    setModalStep("idle");
    setPendingRegistrationId("");
  };

  const MagneticButtonWrapper = ({ children }: { children: React.ReactNode }) => {
    const btnRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mSpringX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const mSpringY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleBtnMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = btnRef.current!.getBoundingClientRect();
      x.set((clientX - (left + width / 2)) * 0.3);
      y.set((clientY - (top + height / 2)) * 0.3);
    };

    const handleBtnLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={btnRef}
        onMouseMove={handleBtnMove}
        onMouseLeave={handleBtnLeave}
        style={{ x: mSpringX, y: mSpringY }}
        className="w-full sm:w-auto inline-block z-10"
      >
        {children}
      </motion.div>
    );
  };

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
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F47820]/15 border border-[#F47820]/30 text-xs font-bold tracking-widest uppercase text-[#F47820] mb-6 relative overflow-hidden group">
            <span className="relative z-10">Upcoming Event</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F47820]/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
          <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-[#7A1D5C] via-[#B23A87] to-[#F47820] opacity-40 group-hover:opacity-80 transition-opacity duration-500 blur-[2px]" />
          
          <div 
            className="relative glass-prominent overflow-hidden rounded-2xl flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            
            {/* Left/Top side: Visual Banner */}
            <div className="relative md:w-2/5 h-56 md:h-auto overflow-hidden perspective-[1000px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#54276A]/80 via-[#2E1740] to-[#F47820]/30 z-10 mix-blend-multiply pointer-events-none" />
              <div className="absolute inset-0 bg-grid opacity-50 z-10" />
              
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-accent text-white text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(244,120,32,0.4)] flex items-center gap-1.5 animate-pulse-soft">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Event
                </span>
              </div>
              
              <motion.svg
                style={{ x: layer1X, y: layer1Y }}
                className="absolute right-0 bottom-0 w-40 h-40 opacity-30 z-20 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
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
              </motion.svg>

              <motion.div 
                style={{ x: layer2X, y: layer2Y }}
                className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center pointer-events-none"
              >
                <Sparkles className="w-8 h-8 text-cyan mb-3 opacity-80" />
                <p className="font-heading text-2xl sm:text-3xl font-bold text-white text-glow leading-tight">
                  Junior<br/>Registrations
                </p>
              </motion.div>
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
                    {eventDetails.status === "inactive" ? "Check Back Later" : "Registration Closed"}
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
                  <MagneticButtonWrapper>
                    <div className="relative group/btn w-full sm:w-auto inline-block">
                      <div className="absolute -inset-1 rounded-xl bg-accent blur-md opacity-40 group-hover/btn:opacity-80 transition-opacity duration-300 animate-pulse-soft" />
                      <button
                        onClick={() => {
                          if (!user) {
                            setErrorMessage("Please sign in with Google in the top navigation menu to register.");
                            setTimeout(() => setErrorMessage(""), 5000);
                          } else {
                            setModalStep("form");
                          }
                        }}
                        disabled={isRegistering}
                        className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#F47820] text-white font-extrabold text-sm hover:bg-[#FFA24A] hover:text-white border-2 border-accent shadow-[0_0_25px_rgba(244,120,32,0.7)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 z-10"
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
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
                  </MagneticButtonWrapper>
                )}
              </div>

              {errorMessage && (
                <div className="mt-5 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        </motion.article>
      </div>

      {/* Tip Modal */}
      <AnimatePresence>

        {/* Form Modal */}
        {(modalStep === "form") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => modalStep === "form" && resetForm()}
              className="absolute inset-0 bg-[#0A0710]/90 backdrop-blur-md cursor-default"
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
                <button 
                  onClick={resetForm} 
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalStep === "form" && (
                <>
                  <div className="overflow-y-auto pr-2 pb-4 space-y-5 custom-scrollbar flex-grow">
                    {/* Form Fields... */}
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
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F47820] transition-all"
                      />
                      {!isValidName && userName.length > 0 && (
                        <span className="text-[10px] text-red-400 mt-1 block font-bold">Required</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").substring(0, 10))}
                        placeholder="Enter 10-digit number"
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#F47820] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 23R11A6236"
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#F47820] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                        Section *
                      </label>
                      <input
                        type="text"
                        value={section}
                        onChange={(e) => setSection(e.target.value.toUpperCase())}
                        placeholder="e.g. A, B, C"
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#F47820] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                        Branch *
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F47820] transition-all cursor-pointer"
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
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                        Which domain do you want to choose? *
                      </label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F47820] transition-all cursor-pointer"
                      >
                        <option value="Logistics">Logistics</option>
                        <option value="Operations">Operations</option>
                        <option value="Network & Outreach">Network & Outreach</option>
                        <option value="Designing">Designing</option>
                        <option value="Technical">Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                        LinkedIn URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#F47820] transition-all"
                      />
                    </div>
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
                        placeholder="Describe your interest..."
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0B13] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#F47820] resize-none custom-scrollbar transition-all"
                      />
                    </div>
                  </div>
                  
                  {errorMessage && (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 border-t border-white/10 pt-5 mt-4">
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || !isValidMotivation || !isValidName || !isValidPhone || !isValidRoll || !isValidSection}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#F47820] text-white hover:bg-[#FFA24A] border-2 border-accent shadow-[0_0_20px_rgba(244,120,32,0.6)]"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          {eventDetails.price > 0 ? `Confirm and Pay ₹${eventDetails.price}` : "Confirm & Register"}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        {successMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessMessage("")}
              className="absolute inset-0 bg-[#0A0710]/90 backdrop-blur-md cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md flex flex-col gap-3 p-6 sm:p-8 rounded-2xl bg-[#091F15] border-2 border-emerald-500/40 text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.25)] z-10 glass-prominent backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />
              
              <button
                onClick={() => setSuccessMessage("")}
                className="absolute top-4 right-4 text-emerald-400/60 hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Close message"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-lg sm:text-xl font-bold text-white pr-6">{successMessage}</h4>
              </div>
              <div className="mt-4 pt-5 border-t border-emerald-500/20 text-sm text-emerald-200/90 font-medium space-y-2">
                <p className="flex items-start gap-2.5 font-bold text-emerald-300">
                  <span className="text-xl leading-none">🎉</span>
                  <span className="leading-relaxed">You're in! Check your email for event updates. See you there!</span>
                </p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                   onClick={() => setSuccessMessage("")}
                   className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Awesome, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
