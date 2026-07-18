"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Users, 
  FileText,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Registration {
  registrationId: string;
  eventId: string;
  email: string;
  name: string;
  registeredAt: string;
  attended: boolean;
  motivation: string;
  phone?: string;
  year?: string;
  section?: string;
  branch?: string;
  rollNumber?: string;
  projects?: string;
  linkedin?: string;
  tryhackme?: string;
  hackthebox?: string;
  otherComments?: string;
}

interface Event {
  eventId: string;
  title: string;
}

export default function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "present" | "absent">("all");

  // Modal State
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [regRes, eventRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/registrations`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/events`, { credentials: "include" }),
      ]);

      if (regRes.ok && eventRes.ok) {
        const regJson = await regRes.json();
        const eventJson = await eventRes.json();

        if (regJson.success && Array.isArray(regJson.data)) {
          setRegistrations(regJson.data);
        }
        if (eventJson.success && Array.isArray(eventJson.data)) {
          setEvents(eventJson.data);
        }
      } else {
        setErrorMessage("Failed to load records from the database.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.registrationId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvent = selectedEventId === "" || reg.eventId === selectedEventId;
    const matchesAttendance = 
      attendanceFilter === "all" ||
      (attendanceFilter === "present" && reg.attended) ||
      (attendanceFilter === "absent" && !reg.attended);
    return matchesSearch && matchesEvent && matchesAttendance;
  });

  // Stats calculation (based on selected event, independent of search and attendance status filters)
  const eventSubset = registrations.filter((reg) => selectedEventId === "" || reg.eventId === selectedEventId);
  const totalCount = eventSubset.length;
  const attendedCount = eventSubset.filter((r) => r.attended).length;
  const checkInRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  // Toggle Attendance handler
  const handleToggleAttendance = async (registrationId: string, currentAttended: boolean) => {
    setUpdatingId(registrationId);
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/registrations/${registrationId}/attendance`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ attended: !currentAttended }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        // Update local state optimistically
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.registrationId === registrationId
              ? { ...reg, attended: !currentAttended }
              : reg
          )
        );
      } else {
        setErrorMessage(json.message || "Failed to update attendance status.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) return;

    // Map rows
    const headers = [
      "Registration ID",
      "Event ID",
      "Name",
      "Email",
      "Mobile Number",
      "Roll Number",
      "Year",
      "Branch",
      "Section",
      "LinkedIn URL",
      "TryHackMe URL",
      "HackTheBox URL",
      "Projects",
      "Motivation",
      "Other Comments",
      "Registered At",
      "Attended Status",
    ];
    const rows = filteredRegistrations.map((reg) => [
      reg.registrationId,
      reg.eventId,
      reg.name,
      reg.email,
      reg.phone || "",
      reg.rollNumber || "",
      reg.year || "",
      reg.branch || "",
      reg.section || "",
      reg.linkedin || "",
      reg.tryhackme || "",
      reg.hackthebox || "",
      reg.projects || "",
      reg.motivation || "",
      reg.otherComments || "",
      new Date(reg.registeredAt).toISOString(),
      reg.attended ? "TRUE" : "FALSE",
    ]);

    // CSV compile
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map((e) => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = `registrations_${selectedEventId || "all"}_export.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("CSV exported successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // PDF Exporter
  const handleExportPDF = () => {
    if (filteredRegistrations.length === 0) return;

    const doc = new jsPDF();
    const currentEvent = events.find(e => e.eventId === selectedEventId);
    const eventTitle = currentEvent ? currentEvent.title : "All Events";
    const timestamp = new Date().toLocaleString();

    // Set title and subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 30);
    doc.text("Cybersecurity Club — Registrations Report", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(`Event Filter: ${eventTitle}`, 14, 27);
    doc.text(`Generated At: ${timestamp}`, 14, 33);
    doc.text(`Total Count: ${totalCount} | Checked In: ${attendedCount} | Attendance Rate: ${checkInRate}%`, 14, 39);

    // Map table content
    const tableColumns = ["Reg ID", "Student Name", "Roll Number", "Mobile Number", "Year/Branch/Sec", "Attendance Status"];
    const tableRows = filteredRegistrations.map((reg) => {
      const classLabel = `${reg.year || ""} (${reg.branch || ""} - ${reg.section || ""})`;
      return [
        reg.registrationId,
        reg.name,
        reg.rollNumber || "",
        reg.phone || "",
        classLabel,
        reg.attended ? "Attended" : "Absent",
      ];
    });

    // Render grid table with club primary color accent
    autoTable(doc, {
      startY: 45,
      head: [tableColumns],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [108, 99, 255], // Theme Primary Purple Accent
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        font: "helvetica",
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [247, 248, 253],
      },
    });

    const filename = `registrations_${selectedEventId || "all"}_export.pdf`;
    doc.save(filename);

    setSuccessMessage("PDF report exported successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Registrations
          </h2>
          <p className="text-sm text-muted mt-1">
            Oversee event registration rosters, verify motivations, and check in attendees.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredRegistrations.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-glass-border text-foreground font-semibold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={filteredRegistrations.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
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

      {/* ─── Metrics Cards Grid ────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Registrations</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground font-heading">{totalCount}</span>
            <span className="text-xs text-muted">total</span>
          </div>
        </div>

        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Checked In</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-emerald-400 font-heading">{attendedCount}</span>
            <span className="text-xs text-muted">students</span>
          </div>
        </div>

        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Attendance Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-primary font-heading">{checkInRate}%</span>
            <span className="text-xs text-muted">ratio</span>
          </div>
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
            placeholder="Search name, email, or registration ID..."
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Event Filter */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Events (Filter)</option>
            {events.map((evt) => (
              <option key={evt.eventId} value={evt.eventId}>
                {evt.title} ({evt.eventId})
              </option>
            ))}
          </select>
        </div>

        {/* Attendance Status Filter */}
        <div className="relative">
          <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as any)}
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present (Attended)</option>
            <option value="absent">Absent (Not Attended)</option>
          </select>
        </div>
      </div>

      {/* ─── Data Roster Table ────────────────────────── */}
      <div className="rounded-2xl bg-[#13131A] border border-glass-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching database registrations...</span>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="py-24 text-center text-muted">
            <ClipboardList className="w-12 h-12 mx-auto text-muted/30 mb-3" />
            <p className="text-sm font-medium">No registrations match active filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-[#181824]/50">
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Reg ID</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Student Details</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Target Event</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Timestamp</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Attendance</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/30">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.registrationId} className="hover:bg-surface/10 transition-colors">
                    <td className="p-4 text-xs font-mono font-bold text-primary">{reg.registrationId}</td>
                     <td className="p-4">
                      <div className="font-semibold text-sm text-foreground">{reg.name}</div>
                      <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] bg-glass-border/30 px-1.5 py-0.5 rounded text-secondary font-bold">
                          {reg.rollNumber || "N/A"}
                        </span>
                        <span className="truncate max-w-[150px]">{reg.email}</span>
                      </div>
                      {reg.phone && (
                        <div className="text-[10px] text-accent font-semibold font-mono mt-0.5">
                          📞 {reg.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold text-foreground">
                      {events.find(e => e.eventId === reg.eventId)?.title || reg.eventId}
                    </td>
                    <td className="p-4 text-xs text-muted">
                      {new Date(reg.registeredAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAttendance(reg.registrationId, reg.attended)}
                        disabled={updatingId === reg.registrationId}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50 ${
                          reg.attended
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5 shadow-inner"
                            : "bg-surface text-muted border-glass-border hover:text-foreground"
                        }`}
                      >
                        {updatingId === reg.registrationId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : reg.attended ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {reg.attended ? "Attended" : "Mark Present"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-glass-border hover:border-primary/30 text-muted hover:text-foreground hover:bg-surface/50 text-xs font-medium transition-all cursor-pointer animate-hover"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Student Profile Details Modal Overlay ────── */}
      <AnimatePresence>
        {selectedReg !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReg(null)}
              className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-default"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-glass-border mb-5">
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground">
                    Student Registration Profile
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    Registration ID: <span className="font-mono text-primary font-bold">{selectedReg.registrationId}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-1.5 rounded-lg border border-glass-border text-muted hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable details panel */}
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 text-sm text-muted">
                {/* Academic & Contact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Personal info */}
                  <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Academic History</span>
                    <div>
                      <span className="text-[11px] text-muted block">Student Name</span>
                      <span className="text-sm font-semibold text-foreground">{selectedReg.name}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted block">Roll Number</span>
                      <span className="text-sm font-semibold font-mono text-foreground">{selectedReg.rollNumber || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <span className="text-[11px] text-muted block">Year</span>
                        <span className="text-xs font-semibold text-foreground">{selectedReg.year || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted block">Branch</span>
                        <span className="text-xs font-semibold text-foreground">{selectedReg.branch || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted block">Section</span>
                        <span className="text-xs font-semibold text-foreground">{selectedReg.section || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Profiles info */}
                  <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Contact & Cybersecurity Profiles</span>
                    <div>
                      <span className="text-[11px] text-muted block">Email Address</span>
                      <span className="text-xs font-semibold text-foreground break-all">{selectedReg.email}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted block">Mobile Number</span>
                      <span className="text-xs font-semibold text-foreground font-mono">{selectedReg.phone || "N/A"}</span>
                    </div>
                    <div className="flex gap-2.5 pt-1.5">
                      {selectedReg.linkedin && selectedReg.linkedin !== "#" ? (
                        <a
                          href={selectedReg.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#0A66C2]/15 text-[#0A66C2] border border-[#0A66C2]/20 text-[10px] font-bold hover:brightness-110"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        <span className="px-2 py-1 rounded bg-surface border border-glass-border text-muted text-[10px]">No LinkedIn</span>
                      )}

                      {selectedReg.tryhackme ? (
                        <a
                          href={selectedReg.tryhackme}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold hover:brightness-110"
                        >
                          TryHackMe
                        </a>
                      ) : (
                        <span className="px-2 py-1 rounded bg-surface border border-glass-border text-muted text-[10px]">No THM</span>
                      )}

                      {selectedReg.hackthebox ? (
                        <a
                          href={selectedReg.hackthebox}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#9FEF00]/10 text-[#9FEF00] border border-[#9FEF00]/20 text-[10px] font-bold hover:brightness-110"
                        >
                          HTB
                        </a>
                      ) : (
                        <span className="px-2 py-1 rounded bg-surface border border-glass-border text-muted text-[10px]">No HTB</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Motivation statement */}
                <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-2">Statement of Motivation</span>
                  <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedReg.motivation || "No statement was provided."}
                  </div>
                </div>

                {/* Projects statement */}
                <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-2">Cybersecurity / Programming Projects</span>
                  <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedReg.projects || "No projects were described."}
                  </div>
                </div>

                {/* Other comments */}
                <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-2">Other Comments / Certifications</span>
                  <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedReg.otherComments || "No additional comments."}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-5 border-t border-glass-border">
                <button
                  onClick={() => setSelectedReg(null)}
                  className="px-5 py-2.5 rounded-xl bg-surface border border-glass-border text-foreground hover:bg-surface/80 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
