"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, Clock } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Events", href: "/events" },
  { label: "Members", href: "/members" },
  { label: "About", href: "#about" },
];

const initialNotifications: {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}[] = [];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const pathname = usePathname();

  const getHref = (href: string) => {
    if (href === "/events" || href === "/members") return href;
    if (pathname === "/events" || pathname === "/members") {
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileOpen
          ? "bg-[#13131A]/95 backdrop-blur-xl border-b border-glass-border shadow-lg shadow-primary/5"
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
              className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center hover:border-secondary/40 transition-all duration-200"
              aria-label="College Website"
            >
              <Image
                src="/college-logo.png"
                alt="GCET College Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </a>
            <div className="hidden sm:block w-px h-6 bg-glass-border" />
            {/* Club Logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center border border-glass-border"
                aria-label="Cybersecurity Club Logo"
              >
                <Image
                  src="/club-logo.png"
                  alt="Cybersecurity Club Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain p-0.5"
                  priority
                />
              </div>
              <span className="hidden lg:block text-sm font-heading font-semibold text-foreground">
                Cybersecurity Club
              </span>
            </div>
          </div>

          {/* Center — Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={getHref(link.href)}
                onClick={() => setActiveLink(link.label)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeLink === link.label
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {activeLink === link.label && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-primary/15 border border-primary/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
                className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-glass-border transition-all duration-200 cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
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
                      className="absolute right-0 mt-3.5 w-80 sm:w-96 rounded-2xl bg-[#13131A]/95 backdrop-blur-xl border border-glass-border z-50 p-4 shadow-2xl shadow-primary/10 overflow-hidden"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                        <span className="font-heading font-bold text-sm text-foreground">
                          Latest Updates
                        </span>
                        {notifications.some(n => n.unread) && (
                          <button
                            onClick={() => {
                              setNotifications(notifications.map(n => ({ ...n, unread: false })));
                            }}
                            className="text-xs text-accent hover:underline font-semibold cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-3 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-sm text-muted">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 rounded-xl border transition-all duration-200 ${
                                notif.unread
                                  ? "bg-primary/10 border-primary/20 hover:bg-primary/15"
                                  : "bg-surface/30 border-transparent hover:bg-surface/50"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="font-heading text-xs font-semibold text-foreground">
                                  {notif.title}
                                </h4>
                                {notif.unread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-muted leading-relaxed mb-2">
                                {notif.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-[9px] text-muted/60">
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

            <a
              href="#"
              className="hidden md:inline-flex items-center px-5 py-2 text-sm font-semibold rounded-lg bg-accent text-white hover:brightness-110 transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40"
            >
              Login
            </a>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[#13131A] border-t border-glass-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
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
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeLink === link.label
                      ? "bg-primary/15 text-foreground border border-primary/20"
                      : "text-muted hover:text-foreground hover:bg-surface"
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href="#"
                onClick={() => setIsMobileOpen(false)}
                className="block mt-3 px-4 py-3 text-center text-sm font-semibold rounded-lg bg-accent text-white hover:brightness-110 transition-all"
              >
                Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
