"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  X,
  PlusCircle,
  Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  eventId: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  deadline: string;
  status: "active" | "cancelled" | "completed";
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form Fields
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"active" | "cancelled" | "completed">("active");

  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/events`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      } else {
        setErrorMessage("Failed to fetch events from server.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventId("");
    setTitle("");
    setDescription("");
    setDate("");
    setCapacity("");
    setDeadline("");
    setStatus("active");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventId(event.eventId);
    setTitle(event.title);
    setDescription(event.description);
    // Format ISO string to datetime-local format (YYYY-MM-DDThh:mm)
    setDate(new Date(event.date).toISOString().substring(0, 16));
    setCapacity(String(event.capacity));
    setDeadline(new Date(event.deadline).toISOString().substring(0, 16));
    setStatus(event.status);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      eventId,
      title,
      description,
      date: new Date(date).toISOString(),
      capacity: parseInt(capacity, 10),
      deadline: new Date(deadline).toISOString(),
      status,
    };

    try {
      const url = editingEvent 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/events/${editingEvent.eventId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/events`;
      
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMessage(editingEvent ? "Event updated successfully!" : "Event created successfully!");
        setIsModalOpen(false);
        fetchEvents();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Failed to save event. Please check inputs.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to cancel/archive this event?")) return;
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setSuccessMessage("Event archived successfully!");
        fetchEvents();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        const json = await res.json();
        setErrorMessage(json.message || "Failed to archive event.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Event Management
          </h2>
          <p className="text-sm text-muted mt-1">
            Create, update, and manage club workshops or competitions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
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

      {/* Data Table */}
      <div className="rounded-2xl bg-[#13131A] border border-glass-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching events roster...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-24 text-center text-muted">
            <Calendar className="w-12 h-12 mx-auto text-muted/30 mb-3" />
            <p className="text-sm font-medium">No events found in spreadsheet database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-[#181824]/50">
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">ID</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Event Details</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Schedule</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Deadline</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Capacity</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Status</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/30">
                {events.map((event) => (
                  <tr key={event.eventId} className="hover:bg-surface/10 transition-colors">
                    <td className="p-4 text-xs font-mono font-bold text-primary">{event.eventId}</td>
                    <td className="p-4">
                      <div className="font-semibold text-sm text-foreground">{event.title}</div>
                      <div className="text-xs text-muted truncate max-w-xs">{event.description}</div>
                    </td>
                    <td className="p-4 text-xs text-muted">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 text-xs text-muted">
                      {new Date(event.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {event.capacity} seats
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[10px] capitalize ${
                        event.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : event.status === "cancelled"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        {event.status === "active" && <CheckCircle className="w-3 h-3" />}
                        {event.status === "cancelled" && <XCircle className="w-3 h-3" />}
                        {event.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1.5 rounded-lg border border-glass-border text-muted hover:text-foreground hover:bg-surface/50 transition-all cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {event.status === "active" && (
                          <button
                            onClick={() => handleArchive(event.eventId)}
                            className="p-1.5 rounded-lg border border-glass-border text-muted hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Cancel Event"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create/Edit Modal Overlay ───────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-default"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-glass-border mb-5">
                <h4 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                  {editingEvent ? "Edit Club Event" : "Create Club Event"}
                </h4>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg border border-glass-border text-muted hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Event ID */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                      Event ID (e.g. evt-02)
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingEvent}
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      placeholder="evt-02"
                      className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground disabled:opacity-50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Intro to Ethical Hacking"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn..."
                    className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Event Date */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                      Event Schedule Date
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Reg Deadline */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                      Registration Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Student Capacity Seats
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="E.g., 50"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t border-glass-border pt-4 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-glass-border text-muted hover:text-foreground hover:bg-surface/50 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingEvent ? "Save Changes" : "Create Event"}
                        <PlusCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
