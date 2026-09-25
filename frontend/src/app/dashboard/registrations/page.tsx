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
  Calendar,
  IndianRupee,
  ExternalLink
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
  motivation: string;
  phone?: string;
  year?: string;
  section?: string;
  branch?: string;
  domain?: string;
  rollNumber?: string;
  projects?: string;
  linkedin?: string;
  tryhackme?: string;
  hackthebox?: string;
  otherComments?: string;
  paymentStatus?: string;
  transactionId?: string;
  screenshotUrl?: string;
  emailStatus?: string;
  teamSize?: number;
  attendedMembers: string[];
  teamMembers?: Array<{
    name: string;
    email: string;
    phone: string;
    rollNumber: string;
    branch: string;
    section: string;
  }>;
}

interface Event {
  eventId: string;
  title: string;
  price: number;
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
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "success">("all");
  const [selectedBranch, setSelectedBranch] = useState("");

  // Modal State
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [attendanceModalReg, setAttendanceModalReg] = useState<Registration | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<"teams" | "individuals">("teams");

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

  const uniqueBranches = Array.from(
    new Set(registrations.map((r) => r.branch).filter((b): b is string => Boolean(b)))
  ).sort();

  const filteredRegistrations = registrations.filter((reg) => {
    return reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           reg.registrationId.toLowerCase().includes(searchQuery.toLowerCase());
  });



  interface FlattenedIndividual {
    registrationId: string;
    eventId: string;
    email: string;
    name: string;
    phone: string;
    rollNumber: string;
    branch: string;
    section: string;
    paymentStatus: string;
    isLeader: boolean;
    individualAttended: boolean;
  }

  const flattenedRegistrations = typeof window !== 'undefined' ? (function() {
    const flat: FlattenedIndividual[] = [];
    filteredRegistrations.forEach(reg => {
      // Leader
      flat.push({
        registrationId: reg.registrationId,
        eventId: reg.eventId,
        email: reg.email,
        name: reg.name,
        phone: reg.phone || "",
        rollNumber: reg.rollNumber || "",
        branch: reg.branch || "",
        section: reg.section || "",
        paymentStatus: reg.paymentStatus || "",
        isLeader: true,
        individualAttended: reg.attendedMembers?.includes(reg.rollNumber || "") || false
      });
      if (reg.teamMembers && reg.teamMembers.length > 0) {
        reg.teamMembers.forEach(member => {
          flat.push({
            registrationId: reg.registrationId,
            eventId: reg.eventId,
            email: member.email,
            name: member.name,
            phone: member.phone,
            rollNumber: member.rollNumber,
            branch: member.branch,
            section: member.section,
            paymentStatus: reg.paymentStatus || "",
            isLeader: false,
            individualAttended: reg.attendedMembers?.includes(member.rollNumber) || false
          });
        });
      }
    });

    return flat.filter(ind => {
      const matchesEvent = selectedEventId === "" || ind.eventId === selectedEventId;
      const matchesAttendance = 
        attendanceFilter === "all" ||
        (attendanceFilter === "present" && ind.individualAttended) ||
        (attendanceFilter === "absent" && !ind.individualAttended);
      const matchesBranch = selectedBranch === "" || ind.branch === selectedBranch;
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "pending" && ind.paymentStatus === "PENDING") ||
        (paymentFilter === "success" && (ind.paymentStatus === "SUCCESS" || ind.paymentStatus === "CONFIRMED" || ind.paymentStatus === "FREE"));

      return matchesEvent && matchesAttendance && matchesBranch && matchesPayment;
    });
  })() : [];

  // Calculate metrics based on the visible dataset
  const currentDataset = viewMode === "individuals" ? flattenedRegistrations : filteredRegistrations;
  const totalCount = currentDataset.length;
  const attendedCount = viewMode === "individuals" 
    ? (currentDataset as FlattenedIndividual[]).filter(r => r.individualAttended).length
    : (currentDataset as any[]).filter(r => r.attendedMembers && r.attendedMembers.length > 0).length;
  const checkInRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;
  const pendingPaymentsCount = currentDataset.filter((r: any) => r.paymentStatus === "PENDING").length;

  const handleSaveAttendance = async (registrationId: string, attendedMembers: string[]) => {
    setUpdatingId(registrationId + "_attendance");
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/registrations/${registrationId}/attendance`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ attendedMembers }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.registrationId === registrationId
              ? { ...reg, attendedMembers }
              : reg
          )
        );
        setAttendanceModalReg(null);
      } else {
        setErrorMessage(json.message || "Failed to update attendance status.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePaymentStatus = async (registrationId: string, status: string) => {
    setUpdatingId(registrationId + "_payment");
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/registrations/${registrationId}/payment-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.registrationId === registrationId
              ? { ...reg, paymentStatus: status }
              : reg
          )
        );
        
        // If updating the currently viewed registration in modal
        if (selectedReg?.registrationId === registrationId) {
          setSelectedReg({ ...selectedReg, paymentStatus: status });
        }
        
        setSuccessMessage(`Payment status updated to ${status}`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(json.message || "Failed to update payment status.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResendEmail = async (registrationId: string) => {
    setUpdatingId(registrationId + "_email");
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/registrations/${registrationId}/resend-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMessage("Confirmation email triggered successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(json.message || "Failed to resend email.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred while resending email.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = viewMode === "individuals" ? flattenedRegistrations : filteredRegistrations;
    if (dataToExport.length === 0) return;

    let headers: string[];
    let rows: any[][];

    if (viewMode === "individuals") {
      headers = [
        "Registration ID",
        "Event ID",
        "Name",
        "Email",
        "Mobile Number",
        "Roll Number",
        "Branch",
        "Section",
        "Role",
        "Attended Status",
        "Payment Status",
      ];
      rows = (dataToExport as FlattenedIndividual[]).map(reg => [
        reg.registrationId,
        reg.eventId,
        reg.name,
        reg.email,
        reg.phone,
        reg.rollNumber,
        reg.branch,
        reg.section,
        reg.isLeader ? "Leader" : "Member",
        reg.individualAttended ? "TRUE" : "FALSE",
        reg.paymentStatus
      ]);
    } else {
      headers = [
        "Registration ID",
        "Event ID",
        "Name",
        "Email",
        "Mobile Number",
        "Roll Number",
        "Year",
        "Branch",
        "Section",
        "Projects",
        "Motivation",
        "Other Comments",
        "Registered At",
        "Attended Members",
        "Payment Status",
      ];
      rows = (dataToExport as Registration[]).map((reg) => [
        reg.registrationId,
        reg.eventId,
        reg.name,
        reg.email,
        reg.phone || "",
        reg.rollNumber || "",
        reg.year || "",
        reg.branch || "",
        reg.section || "",
        reg.projects || "",
        reg.motivation || "",
        reg.otherComments || "",
        new Date(reg.registeredAt).toISOString(),
        reg.attendedMembers?.join(", ") || "",
        reg.paymentStatus || "N/A",
      ]);
    }

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map((e) => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const branchTag = selectedBranch ? selectedBranch.replace(/[^a-zA-Z0-9]/g, "_") : "All_Branches";
    const statusTag = attendanceFilter;
    const filename = `registrations_${selectedEventId || "all"}_${branchTag}_${statusTag}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("CSV exported successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleExportPDF = () => {
    if (filteredRegistrations.length === 0) return;

    const doc = new jsPDF();
    const currentEvent = events.find(e => e.eventId === selectedEventId);
    const eventTitle = currentEvent ? currentEvent.title : "All Events";
    const branchLabel = selectedBranch || "All Branches";
    const statusLabel = 
      attendanceFilter === "present"
        ? "Present (Attended)"
        : attendanceFilter === "absent"
        ? "Absent"
        : "All Statuses";
    const timestamp = new Date().toLocaleString();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 30);
    doc.text("Cybersecurity Club — Attendance & Registrations Report", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(`Event: ${eventTitle} | Branch: ${branchLabel} | Status: ${statusLabel}`, 14, 27);
    doc.text(`Generated At: ${timestamp}`, 14, 33);
    const dataToExport = viewMode === "individuals" ? flattenedRegistrations : filteredRegistrations;
    doc.text(`Total Exported Records: ${dataToExport.length}`, 14, 39);

    let tableColumns: string[];
    let tableRows: any[][];

    if (viewMode === "individuals") {
      tableColumns = ["Reg ID", "Student Name", "Roll Number", "Mobile Number", "Branch/Sec", "Role", "Attendance", "Payment"];
      tableRows = (dataToExport as FlattenedIndividual[]).map((reg) => {
        const classLabel = `${reg.branch || ""} - ${reg.section || ""}`;
        return [
          reg.registrationId,
          reg.name,
          reg.rollNumber || "",
          reg.phone || "",
          classLabel,
          reg.isLeader ? "Leader" : "Member",
          reg.individualAttended ? "Attended" : "Absent",
          reg.paymentStatus || "N/A"
        ];
      });
    } else {
      tableColumns = ["Reg ID", "Team Leader", "Roll Number", "Mobile Number", "Year/Branch/Sec", "Attendance Members", "Payment"];
      tableRows = (dataToExport as Registration[]).map((reg) => {
        const classLabel = `${reg.year || ""} (${reg.branch || ""} - ${reg.section || ""})`;
        return [
          reg.registrationId,
          reg.name,
          reg.rollNumber || "",
          reg.phone || "",
          classLabel,
          reg.attendedMembers?.join(", ") || "",
          reg.paymentStatus || "N/A"
        ];
      });
    }

    autoTable(doc, {
      startY: 45,
      head: [tableColumns],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [108, 99, 255], 
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

    const branchTag = selectedBranch ? selectedBranch.replace(/[^a-zA-Z0-9]/g, "_") : "All_Branches";
    const statusTag = attendanceFilter;
    const filename = `registrations_${selectedEventId || "all"}_${branchTag}_${statusTag}.pdf`;
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
            Oversee event registration rosters, verify payments, and check in attendees.
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

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
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

        <div className="rounded-2xl border border-amber-500/30 bg-[#1A1510] p-4.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider">Pending Verifications</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-amber-500 font-heading">{pendingPaymentsCount}</span>
            <span className="text-xs text-amber-500/60">payments</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`relative ${viewMode === "teams" ? "col-span-2 lg:col-span-5" : "lg:col-span-1"}`}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search details..."
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {viewMode === "individuals" && (
          <>
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

        <div className="relative">
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Branches (Filter)</option>
            {uniqueBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as any)}
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Attendance</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <div className="relative">
          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending Payment</option>
            <option value="success">Success / Free</option>
          </select>
        </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 mb-2">
        <span className="text-xs text-muted font-bold uppercase tracking-wider pl-1">View Mode:</span>
        <button
          onClick={() => setViewMode("teams")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
            viewMode === "teams" ? "bg-primary/20 text-primary border border-primary/30" : "bg-surface text-muted border border-glass-border hover:text-foreground"
          }`}
        >
          Teams
        </button>
        <button
          onClick={() => setViewMode("individuals")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
            viewMode === "individuals" ? "bg-primary/20 text-primary border border-primary/30" : "bg-surface text-muted border border-glass-border hover:text-foreground"
          }`}
        >
          Individuals
        </button>
      </div>

      {/* Table */}
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
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">{viewMode === "individuals" ? "Student" : "Student Details"}</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Target Event</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Payment</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Attendance</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/30">
                {viewMode === "individuals" ? (
                  flattenedRegistrations.map((reg, i) => (
                    <tr key={reg.registrationId + i} className="hover:bg-surface/10 transition-colors">
                      <td className="p-4 text-xs font-mono font-bold text-primary">{reg.registrationId}</td>
                      <td className="p-4">
                        <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                          {reg.name}
                          <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-widest bg-surface text-muted border-glass-border">
                            {reg.isLeader ? "Leader" : "Member"}
                          </span>
                        </div>
                        <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] bg-glass-border/30 px-1.5 py-0.5 rounded text-secondary font-bold">
                            {reg.rollNumber || "N/A"}
                          </span>
                          <span className="truncate max-w-[150px]">{reg.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-foreground">
                        {events.find(e => e.eventId === reg.eventId)?.title || reg.eventId}
                      </td>
                      <td className="p-4">
                        {reg.paymentStatus === "PENDING" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase">
                            <AlertCircle className="w-3 h-3" />
                            Pending
                          </span>
                        ) : reg.paymentStatus === "SUCCESS" || reg.paymentStatus === "CONFIRMED" || reg.paymentStatus === "FREE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                            <CheckCircle className="w-3 h-3" />
                            {reg.paymentStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-glass-border text-muted text-[10px] font-bold uppercase">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                          reg.individualAttended
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : "bg-surface text-muted border-glass-border"
                        }`}>
                          {reg.individualAttended ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {reg.individualAttended ? "Present" : "Absent"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedReg(registrations.find(r => r.registrationId === reg.registrationId) || null)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-glass-border hover:border-primary/30 text-muted hover:text-foreground text-xs font-medium transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredRegistrations.map((reg) => {
                    const totalMembers = 1 + (reg.teamMembers?.length || 0);
                    const attendedCount = reg.attendedMembers?.length || 0;
                    const isFullyAttended = attendedCount === totalMembers;
                    const hasSomeAttendance = attendedCount > 0;
                    
                    return (
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
                    <td className="p-4">
                      {reg.paymentStatus === "PENDING" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase">
                          <AlertCircle className="w-3 h-3" />
                          Pending Verify
                        </span>
                      ) : reg.paymentStatus === "SUCCESS" || reg.paymentStatus === "CONFIRMED" || reg.paymentStatus === "FREE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                          <CheckCircle className="w-3 h-3" />
                          {reg.paymentStatus}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-glass-border text-muted text-[10px] font-bold uppercase">
                          Unknown
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setAttendanceModalReg(reg)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          isFullyAttended
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5 shadow-inner"
                            : hasSomeAttendance
                            ? "bg-primary/10 text-primary border-primary/25"
                            : "bg-surface text-muted border-glass-border hover:text-foreground"
                        }`}
                      >
                        {isFullyAttended ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            All Present
                          </>
                        ) : hasSomeAttendance ? (
                          <>
                            <Users className="w-3.5 h-3.5" />
                            {attendedCount}/{totalMembers} Present
                          </>
                        ) : (
                          <>
                            <ClipboardList className="w-3.5 h-3.5" />
                            Take Attendance
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:text-foreground hover:bg-surface/50 text-xs font-medium transition-all cursor-pointer animate-hover ${
                          reg.paymentStatus !== "SUCCESS" && reg.paymentStatus !== "CONFIRMED" && reg.paymentStatus !== "FREE"
                            ? "border-amber-500/30 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            : "border-glass-border hover:border-primary/30 text-muted"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {reg.paymentStatus !== "SUCCESS" && reg.paymentStatus !== "CONFIRMED" && reg.paymentStatus !== "FREE" ? "Review Payment" : "Details"}
                      </button>
                    </td>
                  </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedReg !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReg(null)}
              className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-glass-border mb-5">
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
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

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 text-sm text-muted custom-scrollbar">                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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


                  <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Contact Information</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-muted block">Email Address</span>
                        <span className="text-xs font-semibold text-foreground break-all">{selectedReg.email}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {selectedReg.emailStatus && (
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            selectedReg.emailStatus === "SENT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            selectedReg.emailStatus === "FAILED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-surface text-muted border-glass-border"
                          }`}>
                            Email: {selectedReg.emailStatus}
                          </span>
                        )}
                        <button 
                          onClick={() => handleResendEmail(selectedReg.registrationId)}
                          disabled={updatingId === selectedReg.registrationId + "_email"}
                          className="text-[10px] bg-[#6366f1]/15 hover:bg-[#6366f1]/25 text-[#818cf8] border border-[#6366f1]/30 hover:border-[#6366f1]/50 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] font-semibold uppercase tracking-wide"
                        >
                          {updatingId === selectedReg.registrationId + "_email" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          Resend Email
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted block">Mobile Number</span>
                      <span className="text-xs font-semibold text-foreground font-mono">{selectedReg.phone || "N/A"}</span>
                    </div>
                  </div>

                  {/* Payment Details Block */}
                  {(selectedReg.paymentStatus && selectedReg.paymentStatus !== "PENDING") && (
                    <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4 space-y-2 col-span-1 sm:col-span-2">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Payment Information</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-[11px] text-muted block mb-1">Status</span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block ${
                            selectedReg.paymentStatus === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            selectedReg.paymentStatus === "FREE" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                            selectedReg.paymentStatus === "FAILED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-surface text-muted border-glass-border"
                          }`}>
                            {selectedReg.paymentStatus || "N/A"}
                          </span>
                        </div>
                        {selectedReg.transactionId && (
                          <div className="col-span-2">
                            <span className="text-[11px] text-muted block mb-1">Transaction ID</span>
                            <span className="text-xs font-semibold text-foreground font-mono">{selectedReg.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedReg.teamMembers && selectedReg.teamMembers.length > 0 && (
                  <div className="bg-[#181824] rounded-xl border border-glass-border/30 p-4 mt-4">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-3">Team Members ({selectedReg.teamMembers.length})</span>
                    <div className="space-y-3">
                      {selectedReg.teamMembers.map((member, i) => (
                        <div key={i} className="p-3 rounded-lg bg-surface border border-glass-border flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">{i + 1}. {member.name}</span>
                            <span className="text-[10px] bg-[#6366f1]/15 text-[#818cf8] px-2 py-0.5 rounded border border-[#6366f1]/30 font-bold uppercase">{member.rollNumber}</span>
                          </div>
                          <div className="text-[11px] text-muted grid grid-cols-2 gap-2 mt-1">
                            <div><strong>Branch:</strong> {member.branch} ({member.section})</div>
                            <div className="text-right"><strong>Phone:</strong> {member.phone}</div>
                          </div>
                          <div className="text-[11px] text-muted truncate">
                            <strong>Email:</strong> {member.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Attendance Modal */}
      <AnimatePresence>
        {attendanceModalReg !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAttendanceModalReg(null)}
              className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-default"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md rounded-2xl bg-[#13131A] border border-glass-border p-6 shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-glass-border mb-5">
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                    Take Attendance
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    Team: <span className="font-bold text-foreground">{attendanceModalReg.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setAttendanceModalReg(null)}
                  className="p-1.5 rounded-lg border border-glass-border text-muted hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted mb-4">
                  Select the team members who are physically present:
                </p>
                <div className="space-y-3">
                  {[ 
                    { name: attendanceModalReg.name, rollNumber: attendanceModalReg.rollNumber, isLeader: true },
                    ...(attendanceModalReg.teamMembers || []).map(m => ({ name: m.name, rollNumber: m.rollNumber, isLeader: false }))
                  ].map((member, idx) => {
                    const isChecked = (attendanceModalReg.attendedMembers || []).includes(member.rollNumber || "");
                    return (
                      <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-glass-border bg-surface cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-glass-border bg-[#181824] text-primary focus:ring-primary/50 focus:ring-offset-0 cursor-pointer"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = [...(attendanceModalReg.attendedMembers || [])];
                            if (e.target.checked) {
                              if (member.rollNumber) current.push(member.rollNumber);
                            } else {
                              const i = current.indexOf(member.rollNumber || "");
                              if (i > -1) current.splice(i, 1);
                            }
                            setAttendanceModalReg({ ...attendanceModalReg, attendedMembers: current });
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                            {member.name}
                            {member.isLeader && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary font-bold">Leader</span>}
                          </span>
                          <span className="text-xs text-muted font-mono">{member.rollNumber || "No Roll Number"}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-glass-border">
                <button
                  onClick={() => setAttendanceModalReg(null)}
                  className="px-4 py-2 rounded-xl bg-surface border border-glass-border text-foreground hover:bg-surface/80 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveAttendance(attendanceModalReg.registrationId, attendanceModalReg.attendedMembers || [])}
                  disabled={updatingId === attendanceModalReg.registrationId + "_attendance"}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
                >
                  {updatingId === attendanceModalReg.registrationId + "_attendance" && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
