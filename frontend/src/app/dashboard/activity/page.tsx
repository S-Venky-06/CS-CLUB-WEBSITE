"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Search, 
  Loader2, 
  UserCheck, 
  Activity, 
  Calendar, 
  ShieldAlert, 
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityLogEntry {
  timestamp: string;
  email: string;
  action: string;
  details: string;
}

export default function ActivityLogPortal() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchLogs = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/activities`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.data);
      } else {
        setErrorMessage("Failed to load administrative activity logs.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter Matching logic
  const filteredLogs = logs.filter((log) => {
    const matchesOperator = log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (categoryFilter === "events") {
      matchesCategory = ["CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT"].includes(log.action);
    } else if (categoryFilter === "registrations") {
      matchesCategory = log.action === "TOGGLE_ATTENDANCE";
    } else if (categoryFilter === "members") {
      matchesCategory = ["ADD_MEMBER", "UPDATE_ROLE", "UPDATE_MEMBER_DISPLAY"].includes(log.action);
    } else if (categoryFilter === "settings") {
      matchesCategory = log.action === "UPDATE_SETTINGS";
    }

    return matchesOperator && matchesCategory;
  });

  // Stats calculation
  const totalLogs = logs.length;
  const uniqueOperators = new Set(logs.map((l) => l.email)).size;
  const settingsEdits = logs.filter((l) => l.action === "UPDATE_SETTINGS").length;

  // Render Action tags
  const getActionStyles = (action: string) => {
    switch (action) {
      case "CREATE_EVENT":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "UPDATE_EVENT":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DELETE_EVENT":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "TOGGLE_ATTENDANCE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ADD_MEMBER":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "UPDATE_ROLE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "UPDATE_MEMBER_DISPLAY":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "UPDATE_SETTINGS":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-surface text-muted border-glass-border";
    }
  };

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, " ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Activity Log
        </h2>
        <p className="text-sm text-muted mt-1">
          Monitor system actions and verify chronological changes made by administrative operators.
        </p>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── Metrics Cards Grid ────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Actions</span>
          <span className="text-2xl font-bold text-foreground font-heading mt-2">{totalLogs}</span>
        </div>

        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Active Operators</span>
          <span className="text-2xl font-bold text-primary font-heading mt-2">{uniqueOperators}</span>
        </div>

        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Settings Updates</span>
          <span className="text-2xl font-bold text-amber-400 font-heading mt-2">{settingsEdits}</span>
        </div>
      </div>

      {/* ─── Filter Control Bar ───────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search details or operators..."
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Activities (Filter)</option>
            <option value="events">Event Operations (CRUD)</option>
            <option value="registrations">Registrations & Attendance</option>
            <option value="members">Members & Permissions</option>
            <option value="settings">Settings Configurations</option>
          </select>
        </div>
      </div>

      {/* ─── Timeline Feed List ────────────────────────── */}
      <div className="rounded-2xl bg-[#13131A] border border-glass-border shadow-xl p-6 relative overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching activity logs feed...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-24 text-center text-muted">
            <ClipboardList className="w-12 h-12 mx-auto text-muted/30 mb-3" />
            <p className="text-sm font-medium">No activity log entries match active filter query.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline center line indicator */}
            <div className="absolute left-4.5 top-2 bottom-2 w-0.5 bg-glass-border/30" />

            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {filteredLogs.map((log, idx) => {
                  const operatorInitial = log.email ? log.email.charAt(0).toUpperCase() : "?";
                  
                  return (
                    <motion.div
                      key={log.timestamp + idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 relative group"
                    >
                      {/* Operator Avatar Indicator Dot */}
                      <div className="w-9.5 h-9.5 rounded-full bg-surface border border-glass-border flex items-center justify-center text-xs font-bold text-foreground font-mono flex-shrink-0 z-10 select-none">
                        {operatorInitial}
                      </div>

                      {/* Log Card Box */}
                      <div className="flex-1 rounded-xl bg-surface/30 border border-glass-border/40 hover:border-glass-border p-4.5 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          {/* Operator Email */}
                          <span className="text-xs font-semibold text-foreground font-mono">{log.email}</span>
                          
                          {/* Time detail */}
                          <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {new Date(log.timestamp).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Action Description */}
                        <p className="text-sm text-muted font-medium leading-relaxed mb-3">
                          {log.details}
                        </p>

                        {/* Action Badge */}
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getActionStyles(log.action)}`}>
                          {getActionLabel(log.action)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
