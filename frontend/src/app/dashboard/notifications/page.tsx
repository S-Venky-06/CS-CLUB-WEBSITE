"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  announcementId: string;
  message: string;
  active: boolean;
  createdAt: string;
}

export default function NotificationsManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messageInput, setMessageInput] = useState("");
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
        setErrorMessage("Failed to load broadcast announcements.");
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
        body: JSON.stringify({ message: messageInput.trim() }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMessage("Announcement published successfully!");
        setMessageInput("");
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
        setErrorMessage(json.message || "Failed to toggle banner status.");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Broadcast Notifications
        </h2>
        <p className="text-sm text-muted mt-1">
          Publish global banners at the top of the public website for announcements, closing deadlines, and alerts.
        </p>
      </div>

      {/* Alerts */}
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
        {/* Left Side (Create Form) */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-xl space-y-4 sticky top-6">
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 border-b border-glass-border pb-3.5">
              <Bell className="w-4 h-4 text-primary" />
              Create Announcement
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                  Banner Announcement Message
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={150}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="E.g., Registration for CS Cyber Hackathon closes tonight at 08:00 PM!"
                  className="w-full px-4.5 py-3 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-muted/50"
                />
                <div className="flex justify-end text-[10px] text-muted mt-1 font-semibold">
                  {messageInput.length} / 150 characters
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !messageInput.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Banner
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side (List Grid) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-[#13131A] border border-glass-border shadow-xl p-6">
            <h3 className="font-heading text-sm font-bold text-foreground border-b border-glass-border pb-3.5 mb-5">
              Published Banners History
            </h3>

            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading published banners...</span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-24 text-center text-muted">
                <Bell className="w-12 h-12 mx-auto text-muted/30 mb-3" />
                <p className="text-sm font-medium">No announcement banners published yet.</p>
              </div>
            ) : (
              <div className="space-y-4.5">
                <AnimatePresence initial={false}>
                  {announcements.map((ann) => (
                    <motion.div
                      key={ann.announcementId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4.5 rounded-xl bg-[#181824]/40 border border-glass-border/60 hover:border-glass-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <p className="text-sm text-foreground font-semibold leading-relaxed break-words">
                          {ann.message}
                        </p>
                        <span className="text-[10px] text-muted block font-semibold">
                          Created: {new Date(ann.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 flex-shrink-0 self-end sm:self-auto">
                        {/* Active status toggle button */}
                        <button
                          onClick={() => handleToggleActive(ann.announcementId, ann.active)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            ann.active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
