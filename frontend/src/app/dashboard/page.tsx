"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  Activity, 
  Shield, 
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const { user } = useAuth();

  const metrics = [
    {
      title: "Total Events",
      value: "1",
      detail: "1 active, 0 archived",
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Event Registrations",
      value: "1",
      detail: "Registered for evt-01",
      icon: ClipboardList,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Operators",
      value: "3",
      detail: "Super Admins & Admins",
      icon: Shield,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Database Node",
      value: "Stable",
      detail: "Google Sheets API Connected",
      icon: Cpu,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Greeting Section ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            System Overview
          </h2>
          <p className="text-sm text-muted mt-1">
            Welcome back, <span className="text-foreground font-semibold">{user?.name}</span>. 
            Here is your live status report.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/50 border border-glass-border text-xs text-muted font-medium self-start sm:self-auto">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          Live Server Connection Active
        </div>
      </div>

      {/* ─── Metric Cards Grid ────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`rounded-2xl border p-5 bg-[#13131A] border-glass-border shadow-lg flex flex-col justify-between relative overflow-hidden group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold tracking-wide text-muted">
                    {metric.title}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-1 font-heading">
                    {metric.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl border ${metric.bgColor} ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted font-medium border-t border-glass-border pt-3">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{metric.detail}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Info Workspace ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
        <h4 className="font-heading text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Administrator Workspace Guide
        </h4>
        <div className="space-y-4 text-sm text-muted leading-relaxed">
          <p>
            This admin panel provides a secure pipeline into your club operations. Since Google Sheets functions as the primary datastore:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Immediate Updates</strong>: Any modifications to events, metadata, or registrations written here are pushed in real-time to Google Sheets.
            </li>
            <li>
              <strong className="text-foreground">Activity Logging</strong>: All administrative adjustments (e.g. creating events, changing user privileges) are logged immutably under the Activity Log section to maintain accountability.
            </li>
            <li>
              <strong className="text-foreground">Access Guards</strong>: Roster promotions and roles are restricted strictly to Super Administrators.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
