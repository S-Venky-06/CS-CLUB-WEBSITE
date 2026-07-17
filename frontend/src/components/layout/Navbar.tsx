"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, Clock, LogOut, Shield, User } from "lucide-react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
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
            {visibleLinks.map((link) => (
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
                            onClick={handleMarkAllRead}
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

            {loading ? (
              <div className="hidden md:block w-24 h-9 bg-surface/50 animate-pulse rounded-lg border border-glass-border" />
            ) : !user ? (
              <div className="hidden md:block scale-95 origin-right">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      await login(credentialResponse.credential);
                    }
                  }}
                  onError={() => console.error("Google Login Failed")}
                  theme="filled_blue"
                  shape="rectangular"
                  text="signin"
                />
              </div>
            ) : (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-glass-border hover:border-primary/50 bg-[#13131A] transition-all cursor-pointer overflow-hidden"
                  aria-label="View user profile"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
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
                        className="absolute right-0 mt-3.5 w-64 rounded-2xl bg-[#13131A]/95 backdrop-blur-xl border border-glass-border z-50 p-4 shadow-2xl shadow-primary/10 overflow-hidden"
                      >
                        <div className="flex items-center gap-3 pb-3 border-b border-glass-border">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/20">
                            <Image
                              src={user.picture}
                              alt={user.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-heading font-bold text-xs text-foreground truncate">
                              {user.name}
                            </h4>
                            <p className="text-[10px] text-muted truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary-light">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="capitalize">Role: {user.role}</span>
                          </div>

                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
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
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeLink === link.label
                      ? "bg-primary/15 text-foreground border border-primary/20"
                      : "text-muted hover:text-foreground hover:bg-surface"
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
              {loading ? (
                <div className="w-full h-10 bg-surface/50 animate-pulse rounded-lg border border-glass-border" />
              ) : !user ? (
                <div className="flex justify-center mt-3 scale-95">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      if (credentialResponse.credential) {
                        await login(credentialResponse.credential);
                        setIsMobileOpen(false);
                      }
                    }}
                    onError={() => console.error("Google Login Failed")}
                    theme="filled_blue"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-glass-border space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-primary/20">
                      <Image
                        src={user.picture}
                        alt={user.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-heading font-bold text-xs text-foreground truncate">
                        {user.name}
                      </h4>
                      <p className="text-[10px] text-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mx-2 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary-light">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="capitalize">Role: {user.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
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
