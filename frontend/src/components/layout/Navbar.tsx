"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Events", href: "/events" },
  { label: "Members", href: "/members" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
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
