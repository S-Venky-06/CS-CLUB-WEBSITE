"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, Clock, LogOut, Shield, User, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { GoogleLogin } from "@react-oauth/google";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Events", href: "/events" },
  { label: "Members", href: "/members" },
  { label: "About", href: "#about" },
];

const initialNotifications: {
  id: string | number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}[] = [];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch active notifications/announcements
  useEffect(() => {
    const fetchActiveAnnouncements = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements`);
        const json = await res.json();
        if (res.ok && json.success) {
          const activeItems = json.data;
          const readIds = JSON.parse(localStorage.getItem("read_announcements") || "[]");
          
          const mapped = activeItems.map((item: any) => ({
            id: item.announcementId,
            title: "Announcement",
            description: item.message,
            time: new Date(item.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            unread: !readIds.includes(item.announcementId),
          }));
          
          setNotifications(mapped);
        }
      } catch (err) {
        console.warn("Failed to fetch active announcements for navbar:", err);
      }
    };

    fetchActiveAnnouncements();
  }, []);

  const handleMarkAllRead = () => {
    const ids = notifications.map(n => n.id);
    localStorage.setItem("read_announcements", JSON.stringify(ids));
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };
  const { user, loading, login, logout } = useAuth();
  const pathname = usePathname();

  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  const visibleLinks = isAdmin
    ? [
        ...navLinks.slice(0, 3),
        { label: "Dashboard", href: "/dashboard" },
        ...navLinks.slice(3),
      ]
    : navLinks;

  const getHref = (href: string) => {
    if (href.startsWith("/")) return href;
    if (pathname === "/events" || pathname === "/members" || pathname.startsWith("/dashboard")) {
      return `/${href}`;
    }
    return href;
  };

  useEffect(() => {
    if (pathname === "/events") {
      setActiveLink("Events");
    } else if (pathname === "/members") {
      setActiveLink("Members");
    } else {
      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash === "#events") setActiveLink("Events");
        else if (hash === "#members") setActiveLink("Members");
        else if (hash === "#about") setActiveLink("About");
        else setActiveLink("Home");
      };
      handleHashChange();
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileOpen
          ? "bg-[#0B0B12]/70 backdrop-blur-xl border-b border-glass-border shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left — College Logo Placeholder */}
          <div className="flex items-center gap-3 md:gap-4">
            <a
              href="https://www.gcet.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center border border-white/20 hover:border-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300 relative group"
              aria-label="College Website"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/college-logo.png"
                alt="GCET College Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain p-0.5 relative z-10"
                priority
              />
            </a>
            <div className="hidden sm:block w-px h-6 bg-glass-border" />
            {/* Club Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <div
                className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center border border-white/20 group-hover:border-accent/50 group-hover:shadow-[0_0_15px_rgba(255,85,0,0.3)] transition-all duration-300"
                aria-label="Cybersecurity Club Logo"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src="/club-logo.png"
                  alt="Cybersecurity Club Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain p-0.5 relative z-10"
                  priority
                />
              </div>
              <span className="hidden lg:block text-sm font-heading font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-accent transition-all duration-300 tracking-wide">
                Cybersecurity Club
              </span>
            </div>
          </div>

          {/* Center — Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface/30 border border-glass-border backdrop-blur-md">
            {visibleLinks.map((link) => (
              <a
                key={link.label}
                href={getHref(link.href)}
                onClick={() => setActiveLink(link.label)}
                className={`relative px-4 py-1.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeLink === link.label
                    ? "text-white"
                    : "text-muted hover:text-white"
                }`}
              >
                {activeLink === link.label && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/80 to-cyan/80 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </div>

          {/* Right — CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-xl transition-all duration-300 cursor-pointer border ${
                  isNotifOpen || notifications.some(n => n.unread)
                    ? "bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    : "bg-surface/30 border-glass-border text-muted hover:text-white hover:bg-surface/60 hover:border-glass-border-hover"
                }`}
                aria-label="View notifications"
              >
                <Bell className={`w-4 h-4 ${notifications.some(n => n.unread) ? "animate-pulse-soft" : ""}`} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    {/* Backdrop to close dropdown on click outside */}
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setIsNotifOpen(false)} 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3.5 w-80 sm:w-96 rounded-2xl bg-[#09090E] border border-glass-border-hover z-50 p-5 shadow-[0_10px_50px_rgba(0,0,0,0.95)] overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan to-accent" />

                      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-2">
                        <span className="font-heading font-bold text-sm text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-cyan" />
                          Latest Updates
                        </span>
                        {notifications.some(n => n.unread) && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-cyan hover:text-white uppercase font-bold tracking-wider transition-colors cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-3 space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted font-medium">
                            No new notifications.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 rounded-xl border transition-all duration-300 ${
                                notif.unread
                                  ? "bg-[#141226] border-primary/40 shadow-inner"
                                  : "bg-[#111118] border-white/10 hover:border-white/20"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <h4 className={`font-heading text-xs font-bold ${notif.unread ? "text-cyan" : "text-white"}`}>
                                  {notif.title}
                                </h4>
                                {notif.unread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_5px_rgba(0,240,255,0.8)] flex-shrink-0 mt-1 animate-pulse" />
                                )}
                              </div>
                              <p className="text-xs text-muted/90 leading-relaxed mb-3 whitespace-pre-line font-medium">
                                {notif.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted font-semibold uppercase tracking-wider">
                                <Clock className="w-3 h-3" />
                                <span>{notif.time}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {loading ? (
              <div className="hidden md:block w-24 h-9 bg-surface/50 animate-pulse rounded-xl border border-glass-border" />
            ) : !user ? (
              <div className="hidden md:inline-flex rounded-full overflow-hidden bg-[#0A0A10] p-0.5 shadow-md [&_iframe]:!bg-transparent [&>div]:!bg-transparent">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      await login(credentialResponse.credential);
                    }
                  }}
                  onError={() => console.error("Google Login Failed")}
                  theme="filled_black"
                  shape="pill"
                  size="medium"
                  text="signin"
                />
              </div>
            ) : (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 p-1 rounded-full border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isProfileOpen 
                      ? "border-accent shadow-[0_0_10px_rgba(255,85,0,0.3)] bg-accent/10" 
                      : "border-glass-border hover:border-accent/50 bg-surface/30 hover:bg-surface/60"
                  }`}
                  aria-label="View user profile"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                    <Image
                      src={user.picture}
                      alt={user.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      {/* Backdrop to close profile on click outside */}
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setIsProfileOpen(false)} 
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3.5 w-64 rounded-2xl bg-[#09090E] border border-glass-border-hover z-50 p-5 shadow-[0_10px_50px_rgba(0,0,0,0.95)] overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-cyan" />

                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-accent/40 shadow-[0_0_10px_rgba(255,85,0,0.2)]">
                            <Image
                              src={user.picture}
                              alt={user.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-heading font-bold text-sm text-white truncate">
                              {user.name}
                            </h4>
                            <p className="text-[10px] text-muted truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-glass-border text-[10px] font-bold text-muted uppercase tracking-wider">
                            <Shield className="w-3.5 h-3.5 text-accent" />
                            <span className="text-white">Role:</span> {user.role}
                          </div>

                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl bg-surface/30 border border-glass-border text-muted hover:text-white transition-colors"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="w-5 h-5 text-accent" />
              ) : (
                <Menu className="w-5 h-5 text-cyan" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[#0B0B12]/95 backdrop-blur-xl border-t border-glass-border overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-6 space-y-2">
              {visibleLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={getHref(link.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setActiveLink(link.label);
                    setIsMobileOpen(false);
                  }}
                  className={`block px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeLink === link.label
                      ? "bg-gradient-to-r from-primary/30 to-cyan/30 text-white border border-cyan/30 shadow-inner"
                      : "text-muted hover:text-white hover:bg-surface/50 border border-transparent"
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
              
              {loading ? (
                <div className="w-full h-12 bg-surface/50 animate-pulse rounded-xl border border-glass-border mt-4" />
              ) : !user ? (
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-center">
                  <div className="inline-flex rounded-full overflow-hidden bg-[#0A0A10] p-0.5 shadow-lg [&_iframe]:!bg-transparent [&>div]:!bg-transparent">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        if (credentialResponse.credential) {
                          await login(credentialResponse.credential);
                          setIsMobileOpen(false);
                        }
                      }}
                      onError={() => console.error("Google Login Failed")}
                      theme="filled_black"
                      shape="pill"
                      size="medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-4 px-2">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/40 shadow-[0_0_10px_rgba(255,85,0,0.2)]">
                      <Image
                        src={user.picture}
                        alt={user.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h4 className="font-heading font-bold text-sm text-white truncate">
                        {user.name}
                      </h4>
                      <p className="text-xs text-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mx-2 px-3 py-2 rounded-xl bg-surface border border-glass-border text-xs font-bold text-muted uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-white">Role:</span> {user.role}
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
