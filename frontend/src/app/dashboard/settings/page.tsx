"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Globe, 
  Link2, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  Activity, 
  ExternalLink,
  Save,
  Check,
  X
} from "lucide-react";
import { motion } from "framer-motion";

interface SystemInfo {
  spreadsheetId: string;
  adminEmails: string[];
  superAdminEmails: string[];
  connectionStatus: "healthy" | "unreachable";
}

interface ClubSettings {
  clubName: string;
  clubDiscord: string;
  clubGithub: string;
  clubLinkedIn: string;
  registrationOpen: boolean;
}

export default function SettingsPortal() {
  const [settings, setSettings] = useState<ClubSettings>({
    clubName: "",
    clubDiscord: "",
    clubGithub: "",
    clubLinkedIn: "",
    registrationOpen: true,
  });

  const [system, setSystem] = useState<SystemInfo>({
    spreadsheetId: "",
    adminEmails: [],
    superAdminEmails: [],
    connectionStatus: "healthy",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/settings`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSettings(json.data.settings);
        setSystem(json.data.system);
      } else {
        setErrorMessage("Failed to load club settings.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage("Settings saved successfully!");
        setSettings(json.data);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Failed to save settings.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Fetching settings console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Club Settings
        </h2>
        <p className="text-sm text-muted mt-1">
          Configure branding profiles, social directories, and monitor spreadsheet connection health.
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Inputs) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Branding Profile Card */}
          <div className="rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 border-b border-glass-border pb-3.5">
              <Globe className="w-4 h-4 text-primary" />
              General Profile
            </h3>

            {/* Club Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                Official Club Name
              </label>
              <input
                type="text"
                required
                value={settings.clubName}
                onChange={(e) => setSettings({ ...settings, clubName: e.target.value })}
                className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Registration State Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#181824] border border-glass-border/40 mt-6">
              <div>
                <span className="text-xs font-semibold text-foreground block">Event Registrations Toggle</span>
                <span className="text-[10px] text-muted">
                  Control if visitors can register for club events on the website.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, registrationOpen: !settings.registrationOpen })}
                className={`inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  settings.registrationOpen
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {settings.registrationOpen ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Open
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    Closed
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Accents Card */}
          <div className="rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 border-b border-glass-border pb-3.5">
              <Link2 className="w-4 h-4 text-purple-400" />
              Community & Social Links
            </h3>

            {/* Discord */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                Discord Invite Link
              </label>
              <input
                type="url"
                value={settings.clubDiscord}
                onChange={(e) => setSettings({ ...settings, clubDiscord: e.target.value })}
                placeholder="https://discord.gg/invite"
                className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                GitHub Organization Page
              </label>
              <input
                type="url"
                value={settings.clubGithub}
                onChange={(e) => setSettings({ ...settings, clubGithub: e.target.value })}
                placeholder="https://github.com/org"
                className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                LinkedIn Page URL
              </label>
              <input
                type="url"
                value={settings.clubLinkedIn}
                onChange={(e) => setSettings({ ...settings, clubLinkedIn: e.target.value })}
                placeholder="https://linkedin.com/company/page"
                className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Action Trigger Row */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Configuration
                  <Save className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Columns (Stats Cards & Monitors) */}
        <div className="space-y-6">
          {/* Integration Connection Card */}
          <div className="rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 border-b border-glass-border pb-3.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              API Connection
            </h3>

            {/* Status Ping */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Sheets Connectivity</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  system.connectionStatus === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                }`} />
                <span className={`text-xs font-bold uppercase ${
                  system.connectionStatus === "healthy" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {system.connectionStatus === "healthy" ? "Active" : "Offline"}
                </span>
              </div>
            </div>

            {/* Spreadsheet Link */}
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                Target Spreadsheet ID
              </span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${system.spreadsheetId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#181824] border border-glass-border hover:border-primary/40 text-muted hover:text-foreground text-xs transition-colors"
              >
                <span className="font-mono truncate max-w-[180px]">{system.spreadsheetId}</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-2" />
              </a>
            </div>
          </div>

          {/* Environmental Root Credentials Card */}
          <div className="rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 border-b border-glass-border pb-3.5">
              <Settings className="w-4 h-4 text-orange-400" />
              System Operators
            </h3>
            <p className="text-[10px] text-muted leading-relaxed">
              These administrators are declared statically inside the environment seed configurations (`.env`) and cannot be demoted via dashboard UI:
            </p>

            {/* Super Admins */}
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-purple-400 mb-1.5">
                Root Super Admins
              </span>
              <div className="space-y-1.5">
                {system.superAdminEmails.length === 0 ? (
                  <span className="text-xs text-muted italic">None defined</span>
                ) : (
                  system.superAdminEmails.map((email) => (
                    <div key={email} className="px-2.5 py-1.5 rounded-lg bg-[#181824] border border-glass-border/40 font-mono text-[10px] text-foreground truncate">
                      {email}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Normal Admins */}
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-primary mb-1.5">
                Root Admins
              </span>
              <div className="space-y-1.5">
                {system.adminEmails.length === 0 ? (
                  <span className="text-xs text-muted italic">None defined</span>
                ) : (
                  system.adminEmails.map((email) => (
                    <div key={email} className="px-2.5 py-1.5 rounded-lg bg-[#181824] border border-glass-border/40 font-mono text-[10px] text-foreground truncate">
                      {email}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
