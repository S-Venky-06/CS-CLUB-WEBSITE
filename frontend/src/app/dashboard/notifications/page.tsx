"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Send,
  Sparkles,
  AlertTriangle,
  Info,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  announcementId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "urgent";
  active: boolean;
  createdAt: string;
}

export default function NotificationsManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [typeInput, setTypeInput] = useState<"info" | "warning" | "urgent">("info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/announcements`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAnnouncements(json.data);
      } else {
        setErrorMessage("Failed to load announcements roster.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: titleInput.trim() || "Announcement",
          message: messageInput.trim(),
          type: typeInput,
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMessage("Announcement published successfully!");
        setTitleInput("");
        setMessageInput("");
        setTypeInput("info");
        setAnnouncements((prev) => [json.data, ...prev]);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Failed to publish announcement.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setErrorMessage("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/announcements/${id}/active`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ active: !currentActive }),
        }
      );
      const json = await res.json();

      if (res.ok && json.success) {
        setAnnouncements((prev) =>
          prev.map((item) =>
            item.announcementId === id ? { ...item, active: !currentActive } : item
          )
        );
      } else {
        setErrorMessage(json.message || "Failed to toggle announcement status.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setErrorMessage("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/announcements/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const json = await res.json();

      if (res.ok && json.success) {
        setAnnouncements((prev) => prev.filter((item) => item.announcementId !== id));
        setSuccessMessage("Announcement deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Failed to delete announcement.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "warning":
      case "urgent":
        return {
          label: "Urgent Alert",
          badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
          cardClass: "bg-[#1C1217] border-red-500/30",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
        };
      case "urgent":
        return {
          label: "Pro Tip / Note",
          badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          cardClass: "bg-[#171224] border-purple-500/30",
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-300" />,
        };
      default:
        return {
          label: "Announcement",
          badgeClass: "bg-cyan/15 text-cyan border-cyan/30",
          cardClass: "bg-[#121824] border-cyan/30",
          icon: <Info className="w-3.5 h-3.5 text-cyan" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Broadcast & Styled Notifications
        </h2>
        <p className="text-sm text-muted mt-1">
          Publish styled announcements, alerts, and pro tips directly to the website navbar bell dropdown.
        </p>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side (Create Form + Live Navbar Preview) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Form */}
          <div className="rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 border-b border-glass-border pb-3.5">
              <Bell className="w-4 h-4 text-cyan" />
              Create Styled Notification
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              {/* Category / Badge Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-2">
                  Notification Type & Styling
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTypeInput("info")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      typeInput === "info"
                        ? "bg-cyan/20 text-cyan border-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                        : "bg-surface/50 text-muted border-glass-border hover:border-glass-border-hover"
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    <span>Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTypeInput("warning")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      typeInput === "warning"
                        ? "bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        : "bg-surface/50 text-muted border-glass-border hover:border-glass-border-hover"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Urgent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTypeInput("urgent")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      typeInput === "urgent"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                        : "bg-surface/50 text-muted border-glass-border hover:border-glass-border-hover"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Pro Tip</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                  Notification Title
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="E.g., CTF Round 1 Live!"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-cyan transition-colors placeholder:text-muted/50 font-semibold"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                  Announcement Message
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type message here..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-cyan transition-colors resize-none placeholder:text-muted/50 custom-scrollbar"
                />
                <div className="flex justify-end text-[10px] text-muted mt-1 font-semibold">
                  {messageInput.length} / 500 characters
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !messageInput.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:brightness-110 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Notification
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-2xl bg-[#09090E] border border-glass-border-hover p-5 shadow-2xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan to-accent" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan" />
                Live Navbar Dropdown Preview
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
            </div>

            {/* Simulated Navbar Notification Item */}
            {(() => {
              const badge = getTypeBadge(typeInput);
              return (
                <div className={`p-4 rounded-xl border transition-all ${badge.cardClass}`}>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="font-heading text-xs font-bold text-white flex items-center gap-1.5">
                      {badge.icon}
                      <span>{titleInput.trim() || "Announcement"}</span>
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted/90 leading-relaxed whitespace-pre-line font-medium mb-3">
                    {messageInput.trim() || "Your message will appear here in real-time as you type..."}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted font-semibold uppercase tracking-wider border-t border-white/10 pt-2">
                    <Clock className="w-3 h-3" />
                    <span>Just Now</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Side (Published Roster Grid) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-[#13131A] border border-glass-border shadow-xl p-6">
            <h3 className="font-heading text-sm font-bold text-foreground border-b border-glass-border pb-3.5 mb-5 flex items-center justify-between">
              <span>Published Notifications History</span>
              <span className="text-xs font-normal text-muted">Total: {announcements.length}</span>
            </h3>

            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-cyan" />
                <span className="text-sm font-medium">Loading notifications history...</span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-24 text-center text-muted">
                <Bell className="w-12 h-12 mx-auto text-muted/30 mb-3" />
                <p className="text-sm font-medium">No broadcast notifications published yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {announcements.map((ann) => {
                    const badge = getTypeBadge(ann.type || "info");
                    return (
                      <motion.div
                        key={ann.announcementId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
                          ann.active ? badge.cardClass : "bg-[#14141E]/40 border-glass-border/40 opacity-60"
                        }`}
                      >
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badge.badgeClass}`}>
                              {badge.icon}
                              {badge.label}
                            </span>
                            <h4 className="font-heading text-sm font-bold text-white truncate">
                              {ann.title || "Announcement"}
                            </h4>
                          </div>

                          <p className="text-xs text-muted/90 leading-relaxed break-words whitespace-pre-line font-medium">
                            {ann.message}
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] text-muted font-semibold uppercase tracking-wider pt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(ann.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-start pt-1">
                          {/* Active Toggle Button */}
                          <button
                            onClick={() => handleToggleActive(ann.announcementId, ann.active)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              ann.active
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                : "bg-surface text-muted border-glass-border hover:text-foreground"
                            }`}
                          >
                            {ann.active ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                Archived
                              </>
                            )}
                          </button>

                          {/* Trash Button */}
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.announcementId)}
                            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
