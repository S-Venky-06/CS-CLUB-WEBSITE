"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Shuffle,
  UserCheck,
  Star,
  Trophy,
  CheckCircle,
  FileText,
  Loader2,
  AlertCircle,
  Shield,
  Search,
  MessageSquare,
  Award,
  Sparkles,
  Download,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/components/providers/AuthProvider";

interface GDResult {
  registrationId: string;
  name: string;
  rollNumber: string;
  branch: string;
  domain: string;
  gdTeam: string;
  assignedSupervisors: string;
  commScore: number;
  knowledgeScore: number;
  confidenceScore: number;
  realtimeScore: number;
  attackScore: number;
  totalScore: number;
  supervisorComments: string;
  stageStatus: string;
}

interface Member {
  email: string;
  name: string;
  role: string;
}

function StarRatingSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const activeVal = hoverVal !== null ? hoverVal : value;
        const isFilled = starIndex <= activeVal;

        return (
          <button
            key={starIndex}
            type="button"
            onClick={() => onChange(starIndex)}
            onMouseEnter={() => setHoverVal(starIndex)}
            onMouseLeave={() => setHoverVal(null)}
            className="p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-all ${
                isFilled
                  ? "text-[#F47820] fill-[#F47820] drop-shadow-[0_0_10px_rgba(244,120,32,0.7)] scale-110"
                  : "text-white/20 fill-transparent hover:text-white/40"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function GDManagementPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [activeTab, setActiveTab] = useState<"teams" | "evaluation" | "leaderboard">("teams");
  const [gdResults, setGdResults] = useState<GDResult[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Evaluation Form State
  const [selectedTeam, setSelectedTeam] = useState("");
  const [evalCandidateId, setEvalCandidateId] = useState("");
  const [commScore, setCommScore] = useState(3);
  const [knowledgeScore, setKnowledgeScore] = useState(3);
  const [confidenceScore, setConfidenceScore] = useState(3);
  const [realtimeScore, setRealtimeScore] = useState(3);
  const [attackScore, setAttackScore] = useState(3);
  const [comments, setComments] = useState("");
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  // Leaderboard Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [shortlistFilter, setShortlistFilter] = useState<"all" | "shortlisted">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Supervisor Assignment State
  const [selectedTeamForSupervisor, setSelectedTeamForSupervisor] = useState("");
  const [supervisorInputs, setSupervisorInputs] = useState<string[]>([]);
  const [isAssigningSupervisors, setIsAssigningSupervisors] = useState(false);

  // Supervisor Selection Modal State
  const [assignModalTeam, setAssignModalTeam] = useState<string | null>(null);
  const [selectedSupervisorEmails, setSelectedSupervisorEmails] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Candidate Details Modal State
  const [detailsCandidate, setDetailsCandidate] = useState<GDResult | null>(null);

  // Dynamic Randomize Team Size Modal State
  const [isRandomizeModalOpen, setIsRandomizeModalOpen] = useState(false);
  const [selectedTargetSize, setSelectedTargetSize] = useState(4);

  const openAssignModal = (teamName: string, currentSupervisorsStr: string) => {
    setAssignModalTeam(teamName);
    const existingList = currentSupervisorsStr
      ? currentSupervisorsStr
          .split(",")
          .map((s) => s.trim())
          .filter((s) => Boolean(s) && s.toLowerCase() !== "unassigned" && s.toLowerCase() !== "none assigned")
      : [];
    setSelectedSupervisorEmails(existingList);
    setMemberSearchQuery("");
  };

  const toggleSupervisorSelection = (identifier: string) => {
    if (selectedSupervisorEmails.includes(identifier)) {
      setSelectedSupervisorEmails(selectedSupervisorEmails.filter((i) => i !== identifier));
    } else {
      setSelectedSupervisorEmails([...selectedSupervisorEmails, identifier]);
    }
  };

  const handleSaveModalSupervisors = async () => {
    if (!assignModalTeam) return;
    await handleAssignSupervisors(assignModalTeam, selectedSupervisorEmails);
    setAssignModalTeam(null);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [gdRes, memberRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/gd/results`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/members`, { credentials: "include" }),
      ]);

      if (gdRes.ok) {
        const gdJson = await gdRes.json();
        if (gdJson.success && Array.isArray(gdJson.data)) {
          setGdResults(gdJson.data);
        }
      }
      if (memberRes.ok) {
        const memJson = await memberRes.json();
        if (memJson.success && Array.isArray(memJson.data)) {
          setMembers(memJson.data);
        }
      }
    } catch (err) {
      setErrorMessage("Could not connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss toast notifications after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Helper to format assigned supervisors: removes "Unassigned" and maps emails/IDs to member Names
  const formatSupervisorDisplay = (rawStr: string | undefined): string => {
    if (!rawStr) return "Unassigned";

    const cleaned = rawStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => Boolean(s) && s.toLowerCase() !== "unassigned" && s.toLowerCase() !== "none assigned");

    if (cleaned.length === 0) return "Unassigned";

    const mappedNames = cleaned.map((identifier) => {
      const match = members.find(
        (m) =>
          (m.email && m.email.toLowerCase() === identifier.toLowerCase()) ||
          (m.name && m.name.toLowerCase() === identifier.toLowerCase())
      );
      return match ? match.name : identifier;
    });

    return mappedNames.join(", ");
  };

  // Unique Teams List
  const teamsMap = gdResults.reduce((acc, curr) => {
    if (!acc[curr.gdTeam]) acc[curr.gdTeam] = [];
    acc[curr.gdTeam].push(curr);
    return acc;
  }, {} as Record<string, GDResult[]>);

  const teamNames = Object.keys(teamsMap).sort();

  // Filter teams for live evaluation view based on role & supervisor assignment
  const evaluableTeamNames = teamNames.filter((tName) => {
    if (isSuperAdmin) return true; // Super Admin can see/evaluate all teams

    const assigned = teamsMap[tName]?.[0]?.assignedSupervisors || "";
    if (!assigned) return false;

    const userEmail = user?.email?.toLowerCase() || "";
    const userName = user?.name?.toLowerCase() || "";
    const supLower = assigned.toLowerCase();

    return (userEmail && supLower.includes(userEmail)) || (userName && supLower.includes(userName));
  });

  // Handle Randomize Teams (Super Admin Only)
  const handleRandomizeTeams = async (targetSize: number = 4) => {
    if (!isSuperAdmin) {
      setErrorMessage("Only Super Admins can randomize GD teams.");
      return;
    }

    setIsRandomizing(true);
    setErrorMessage("");
    setSuccessMessage("");
    setIsRandomizeModalOpen(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/gd/randomize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetTeamSize: targetSize }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage(json.message || "GD Teams randomized successfully!");
        setGdResults(json.data || []);
      } else {
        setErrorMessage(json.message || "Failed to randomize GD teams.");
      }
    } catch (err) {
      setErrorMessage("Error communicating with backend.");
    } finally {
      setIsRandomizing(false);
    }
  };

  // Handle Clear Teams (Super Admin Only)
  const handleClearTeams = async () => {
    if (!isSuperAdmin) {
      setErrorMessage("Only Super Admins can clear GD teams.");
      return;
    }

    if (!confirm("⚠️ Are you sure you want to CLEAR all generated GD teams? This will reset all evaluations in the Group Discussion Results sheet tab!")) {
      return;
    }

    setIsClearing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/gd/clear`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage(json.message || "All GD teams cleared successfully!");
        setGdResults([]);
      } else {
        setErrorMessage(json.message || "Failed to clear GD teams.");
      }
    } catch (err) {
      setErrorMessage("Error communicating with backend.");
    } finally {
      setIsClearing(false);
    }
  };

  // Handle Assign Supervisors
  const handleAssignSupervisors = async (teamName: string, selectedSupervisors: string[]) => {
    setIsAssigningSupervisors(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/gd/assign-supervisors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          gdTeam: teamName,
          supervisors: selectedSupervisors,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage(`Supervisors assigned to ${teamName}!`);
        await fetchData();
      } else {
        setErrorMessage(json.message || "Failed to assign supervisors.");
      }
    } catch (err) {
      setErrorMessage("Failed to submit supervisor assignment.");
    } finally {
      setIsAssigningSupervisors(false);
    }
  };

  // Handle Evaluation Submission
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalCandidateId) {
      setErrorMessage("Please select a candidate to evaluate.");
      return;
    }

    setIsSubmittingEval(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/gd/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          registrationId: evalCandidateId,
          scores: {
            comm: commScore,
            knowledge: knowledgeScore,
            confidence: confidenceScore,
            realtime: realtimeScore,
            attack: attackScore,
          },
          comments,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage("Evaluation score saved successfully!");
        setComments("");
        await fetchData();
      } else {
        setErrorMessage(json.message || "Failed to save evaluation.");
      }
    } catch (err) {
      setErrorMessage("Error submitting score.");
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Handle Shortlist for Round 2
  const handleShortlist = async (regId: string) => {
    setActionLoadingId(regId);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/gd/shortlist-round2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ registrationId: regId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage("Candidate shortlisted for Round 2!");
        await fetchData();
      } else {
        setErrorMessage(json.message || "Failed to shortlist candidate.");
      }
    } catch (err) {
      setErrorMessage("Network error shortlisting candidate.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Unshortlist / Remove from Round 2
  const handleUnshortlist = async (regId: string) => {
    setActionLoadingId(regId);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/gd/unshortlist-round2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ registrationId: regId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage("Candidate removed from Round 2 shortlist.");
        await fetchData();
      } else {
        setErrorMessage(json.message || "Failed to remove candidate from shortlist.");
      }
    } catch (err) {
      setErrorMessage("Network error updating shortlist status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // PDF Export for Shortlisted Candidates
  const exportPDF = () => {
    const doc = new jsPDF();
    const shortlisted = gdResults.filter((r) => r.stageStatus === "Shortlisted for Round 2");

    doc.setFontSize(15);
    doc.text("Group Discussion Round 2 Shortlist — GCET Cybersecurity Club", 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Total Shortlisted: ${shortlisted.length}`, 14, 22);

    const tableData = shortlisted.map((r, i) => [
      i + 1,
      r.registrationId,
      r.name,
      r.rollNumber,
      r.branch,
    ]);

    autoTable(doc, {
      startY: 28,
      head: [["#", "Registration ID", "Student Name", "Roll Number", "Branch"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [244, 120, 32] },
    });

    doc.save("GD_Round2_Shortlist.pdf");
  };

  // PDF Export for GD Teams Division Roster
  const exportTeamsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("GCET Cybersecurity Club — GD Teams Division Roster", 14, 15);
    doc.setFontSize(9);
    doc.text(
      `Generated on: ${new Date().toLocaleString()} | Total Teams: ${teamNames.length} | Total Candidates: ${gdResults.length}`,
      14,
      22
    );

    let startY = 28;

    teamNames.forEach((teamName) => {
      const teamMembers = teamsMap[teamName] || [];
      const supervisorStr = formatSupervisorDisplay(teamMembers[0]?.assignedSupervisors);

      // If page height is exceeded, add a new page
      if (startY > 240) {
        doc.addPage();
        startY = 15;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${teamName} (${teamMembers.length} Members) — Supervisors: ${supervisorStr}`,
        14,
        startY
      );

      const tableData = teamMembers.map((m, i) => [
        i + 1,
        m.name,
        m.rollNumber,
        m.branch,
        m.registrationId,
      ]);

      autoTable(doc, {
        startY: startY + 4,
        head: [["#", "Student Name", "Roll Number", "Branch", "Registration ID"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [244, 120, 32] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      // @ts-ignore
      startY = doc.lastAutoTable.finalY + 12;
    });

    doc.save("GD_Teams_Division_Roster.pdf");
  };

  // Filtered leaderboard
  const filteredLeaderboard = gdResults
    .filter((r) => {
      // Role-based filtering for regular admins: only show candidates in assigned GD teams
      if (!isSuperAdmin) {
        const assignedStr = (r.assignedSupervisors || "").toLowerCase();
        const userEmail = user?.email?.toLowerCase() || "";
        const userName = user?.name?.toLowerCase() || "";
        const isAssigned =
          (userEmail && assignedStr.includes(userEmail)) ||
          (userName && assignedStr.includes(userName));

        if (!isAssigned) return false;
      }

      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.registrationId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesShortlist =
        shortlistFilter === "all" ? true : r.stageStatus === "Shortlisted for Round 2";
      return matchesSearch && matchesShortlist;
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-[#0A0710] text-[#EDEAF2] p-4 sm:p-8 pt-24 font-body space-y-8">
      {/* Header Banner */}
      <div className="relative glass-prominent rounded-3xl p-6 sm:p-8 border border-[#F47820]/40 overflow-hidden shadow-[0_0_40px_rgba(244,120,32,0.15)]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F47820]/15 border border-[#F47820]/30 text-xs font-mono font-bold text-[#F47820] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ROUND 1: GROUP DISCUSSION MANAGEMENT</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Group Discussion <span className="gradient-text">Evaluation Panel</span>
            </h1>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Dynamic Team Size Randomizer (Teams of 3–9) • Live 5-Criteria Supervisor Scoring • Round 2 Shortlisting.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setIsRandomizeModalOpen(true)}
                  disabled={isRandomizing || isClearing}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-white font-extrabold text-sm shadow-lg shadow-[#F47820]/30 hover:shadow-[#F47820]/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isRandomizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
                  <span>🎲 Randomize Teams</span>
                </button>

                <button
                  onClick={handleClearTeams}
                  disabled={isClearing || isRandomizing}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/60 text-red-400 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
                  <span>Clear All Teams</span>
                </button>
              </>
            )}

            {activeTab === "teams" && teamNames.length > 0 && (
              <button
                onClick={exportTeamsPDF}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl glass-card border border-white/10 hover:border-white/30 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 text-[#F47820]" />
                <span>Export Teams PDF</span>
              </button>
            )}

            {activeTab === "leaderboard" && (
              <button
                onClick={exportPDF}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl glass-card border border-white/10 hover:border-white/30 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 text-[#F47820]" />
                <span>Export Shortlist PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification Popups (Fixed to Screen for Mobile & Desktop) */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-4 sm:right-8 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-[#0B1D14]/95 border border-emerald-500/50 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] backdrop-blur-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  Status Confirmed ✓
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">{successMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="p-1 text-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-4 sm:right-8 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-[#210D12]/95 border border-red-500/50 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] backdrop-blur-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                  Action Error ✖
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="p-1 text-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("teams")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "teams"
              ? "bg-[#F47820] text-black shadow-lg shadow-[#F47820]/30"
              : "bg-surface/30 border border-white/10 text-muted hover:text-white"
          }`}
        >
          🎲 Teams & Supervisors ({teamNames.length})
        </button>

        <button
          onClick={() => setActiveTab("evaluation")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "evaluation"
              ? "bg-[#F47820] text-black shadow-lg shadow-[#F47820]/30"
              : "bg-surface/30 border border-white/10 text-muted hover:text-white"
          }`}
        >
          ⭐ Live Evaluation View
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "leaderboard"
              ? "bg-[#F47820] text-black shadow-lg shadow-[#F47820]/30"
              : "bg-surface/30 border border-white/10 text-muted hover:text-white"
          }`}
        >
          🏆 Leaderboard & Shortlist
        </button>
      </div>

      {/* TAB 1: TEAMS & SUPERVISORS */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          {teamNames.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-2xl border border-white/10 space-y-3">
              <Shuffle className="w-10 h-10 text-muted mx-auto" />
              <h4 className="font-heading text-lg font-bold text-white">No GD Teams Generated Yet</h4>
              <p className="text-xs text-muted max-w-md mx-auto">
                Super Admins can click <strong>"🎲 Randomize Teams"</strong> above to shuffle all registered candidates into teams of 3–5 members.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamNames.map((teamName) => {
                const teamMembers = teamsMap[teamName];
                const supervisorsStr = teamMembers[0]?.assignedSupervisors || "Unassigned";

                return (
                  <div
                    key={teamName}
                    className="glass-card rounded-2xl p-6 border border-white/10 space-y-4 hover:border-[#F47820]/50 transition-all shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[#F47820] uppercase tracking-wider">
                            {teamMembers.length} Members
                          </span>
                          <h4 className="font-heading text-xl font-bold text-white">{teamName}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#F47820]/15 border border-[#F47820]/30 text-[11px] font-bold text-[#F47820]">
                          Active
                        </span>
                      </div>

                      {/* Members List */}
                      <div className="space-y-2 mb-4">
                        {teamMembers.map((m) => (
                          <div
                            key={m.registrationId}
                            className="p-3 rounded-xl bg-[#0A0710]/60 border border-white/5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-white block">{m.name}</span>
                              <span className="text-[10px] text-muted font-mono">
                                {m.rollNumber} • {m.branch} ({m.domain})
                              </span>
                            </div>
                            <span className="font-mono font-bold text-[#F47820] text-xs">
                              {m.totalScore}/25
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                      {/* Supervisor Info / Assignment */}
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                          Assigned Supervisors:
                        </span>
                        <p className="text-xs font-semibold text-white bg-surface/50 p-2.5 rounded-lg border border-white/5">
                          {formatSupervisorDisplay(supervisorsStr)}
                        </p>

                      {isSuperAdmin && (
                        <div className="pt-2">
                          <button
                            onClick={() => openAssignModal(teamName, supervisorsStr)}
                            className="w-full py-2 rounded-lg bg-[#F47820]/15 hover:bg-[#F47820]/30 border border-[#F47820]/40 text-[#F47820] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Select / Edit Supervisors</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE EVALUATION VIEW */}
      {activeTab === "evaluation" && (
        <div className="max-w-4xl mx-auto glass-prominent rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-heading text-xl font-bold text-white">Live GD Candidate Evaluator</h3>
            <p className="text-xs text-muted mt-1">
              Select a GD Team and candidate to rate their performance on 5 criteria parameters during the discussion.
            </p>
          </div>

          <form onSubmit={handleScoreSubmit} className="space-y-6">
            {/* Step 1: Select Team & Candidate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Select GD Team *
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => {
                    setSelectedTeam(e.target.value);
                    setEvalCandidateId("");
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0710] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F47820] cursor-pointer"
                >
                  <option value="">
                    {evaluableTeamNames.length === 0 ? "No Assigned Teams Available" : "Select Team..."}
                  </option>
                  {evaluableTeamNames.map((t) => (
                    <option key={t} value={t}>
                      {t} {isSuperAdmin ? "" : "(Your Assigned Team)"}
                    </option>
                  ))}
                </select>
                {!isSuperAdmin && evaluableTeamNames.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 inline flex-shrink-0" />
                    <span>You are not assigned as a supervisor for any GD teams yet. Contact a Super Admin.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Select Candidate *
                </label>
                <select
                  value={evalCandidateId}
                  onChange={(e) => setEvalCandidateId(e.target.value)}
                  disabled={!selectedTeam}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0710] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F47820] cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Candidate...</option>
                  {(teamsMap[selectedTeam] || []).map((c) => (
                    <option key={c.registrationId} value={c.registrationId}>
                      {c.name} ({c.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5 Rating Criteria Star Selectors */}
            <div className="p-6 rounded-2xl bg-[#0A0710]/80 border border-white/10 space-y-4">
              <h4 className="font-heading text-sm font-bold text-[#F47820] uppercase tracking-wider border-b border-white/10 pb-2">
                Evaluation Criteria (1–5 Stars)
              </h4>

              {/* 1. Communication & Articulation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div>
                  <span className="text-xs font-bold text-white block">1. Communication & Articulation</span>
                  <span className="text-[10px] text-muted">Clarity, tone, and vocal expression</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRatingSelector value={commScore} onChange={setCommScore} />
                  <span className="text-xs font-mono font-bold text-[#F47820] w-16 text-right">
                    {commScore} / 5
                  </span>
                </div>
              </div>

              {/* 2. Topic Knowledge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div>
                  <span className="text-xs font-bold text-white block">2. Topic Knowledge</span>
                  <span className="text-[10px] text-muted">Factual accuracy and domain depth</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRatingSelector value={knowledgeScore} onChange={setKnowledgeScore} />
                  <span className="text-xs font-mono font-bold text-[#F47820] w-16 text-right">
                    {knowledgeScore} / 5
                  </span>
                </div>
              </div>

              {/* 3. Confidence & Team Dynamics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div>
                  <span className="text-xs font-bold text-white block">3. Confidence & Team Dynamics</span>
                  <span className="text-[10px] text-muted">Body language and active listening</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRatingSelector value={confidenceScore} onChange={setConfidenceScore} />
                  <span className="text-xs font-mono font-bold text-[#F47820] w-16 text-right">
                    {confidenceScore} / 5
                  </span>
                </div>
              </div>

              {/* 4. Real-Time Thinking */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div>
                  <span className="text-xs font-bold text-white block">4. Real-Time Thinking</span>
                  <span className="text-[10px] text-muted">Spontaneous reasoning & adaptiveness</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRatingSelector value={realtimeScore} onChange={setRealtimeScore} />
                  <span className="text-xs font-mono font-bold text-[#F47820] w-16 text-right">
                    {realtimeScore} / 5
                  </span>
                </div>
              </div>

              {/* 5. Attacking / Counterattacking Points Given */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div>
                  <span className="text-xs font-bold text-white block">5. Attacking / Counterattacking Points Given</span>
                  <span className="text-[10px] text-muted">Rebuttals, counterarguments & constructive debate</span>
                </div>
                <div className="flex items-center gap-3">
                  <StarRatingSelector value={attackScore} onChange={setAttackScore} />
                  <span className="text-xs font-mono font-bold text-[#F47820] w-16 text-right">
                    {attackScore} / 5
                  </span>
                </div>
              </div>

              {/* Total Live Calculation */}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-extrabold text-[#F47820]">
                <span>Total Score Calculated:</span>
                <span className="text-lg px-3 py-1 rounded-lg bg-[#F47820]/20 border border-[#F47820]/40">
                  {commScore + knowledgeScore + confidenceScore + realtimeScore + attackScore} / 25
                </span>
              </div>
            </div>

            {/* Supervisor Remarks & Comments */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Supervisor Remarks & Comments
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Type observations, key arguments made, or recommendations..."
                className="w-full p-4 rounded-xl bg-[#0A0710] border border-white/10 text-white text-sm focus:outline-none focus:border-[#F47820]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingEval || !evalCandidateId}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-white font-extrabold text-sm shadow-lg shadow-[#F47820]/30 hover:shadow-[#F47820]/60 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingEval ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Save Candidate Evaluation</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LEADERBOARD & SHORTLIST */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/10">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search candidate name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0710] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F47820]"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShortlistFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  shortlistFilter === "all"
                    ? "bg-[#F47820] text-black"
                    : "bg-surface border border-white/10 text-muted"
                }`}
              >
                All Candidates ({gdResults.length})
              </button>
              <button
                onClick={() => setShortlistFilter("shortlisted")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  shortlistFilter === "shortlisted"
                    ? "bg-[#F47820] text-black"
                    : "bg-surface border border-white/10 text-muted"
                }`}
              >
                Round 2 Shortlisted ({gdResults.filter((r) => r.stageStatus === "Shortlisted for Round 2").length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-muted">
                <thead className="bg-[#150F1F] text-[#EDEAF2] uppercase font-mono tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Roll No & Branch</th>
                    <th className="p-4">GD Team</th>
                    <th className="p-4">Total GD Score</th>
                    <th className="p-4">Stage Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted">
                        No candidates found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaderboard.map((item, idx) => (
                      <tr key={item.registrationId} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">#{idx + 1}</td>
                        <td className="p-4">
                          <span className="font-semibold text-white block">{item.name}</span>
                          <span className="text-[10px] text-muted">{item.domain}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-white block">{item.rollNumber}</span>
                          <span className="text-[10px] text-muted">{item.branch}</span>
                        </td>
                        <td className="p-4 font-mono text-[#F47820] font-bold">{item.gdTeam}</td>
                        <td className="p-4 font-mono text-sm font-extrabold text-[#F47820]">
                          {item.totalScore} / 25
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              item.stageStatus === "Shortlisted for Round 2"
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-surface border-white/10 text-muted"
                            }`}
                          >
                            {item.stageStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setDetailsCandidate(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-surface border border-white/10 hover:border-white/30 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              title="View candidate scores breakdown & supervisor comments"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#F47820]" />
                              <span>Details</span>
                            </button>

                            {item.stageStatus !== "Shortlisted for Round 2" ? (
                              <button
                                onClick={() => handleShortlist(item.registrationId)}
                                disabled={actionLoadingId === item.registrationId}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                              >
                                {actionLoadingId === item.registrationId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  "Shortlist for Round 2 ✓"
                                )}
                              </button>
                            ) : (
                              <>
                                <span className="text-xs font-bold text-emerald-400">Shortlisted ✓</span>
                                <button
                                  onClick={() => handleUnshortlist(item.registrationId)}
                                  disabled={actionLoadingId === item.registrationId}
                                  className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/35 border border-red-500/30 text-red-400 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                                  title="Remove candidate from Round 2 Shortlist"
                                >
                                  {actionLoadingId === item.registrationId ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    "Remove ✖"
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Selection Modal Overlay */}
      <AnimatePresence>
        {assignModalTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-prominent rounded-3xl p-6 sm:p-8 border border-[#F47820]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820]" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#F47820] uppercase tracking-wider">
                    Supervisor Assignment
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white">
                    Select Supervisors for {assignModalTeam}
                  </h3>
                </div>
                <button
                  onClick={() => setAssignModalTeam(null)}
                  className="p-2 rounded-xl bg-surface border border-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Member Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search club members by name or email..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0A0710] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F47820]"
                />
              </div>

              {/* Members Checklist */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {members.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">No members found in Members tab.</p>
                ) : (
                  members
                    .filter(
                      (m) =>
                        m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                        m.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
                    )
                    .map((m) => {
                      const identifier = m.email || m.name;
                      const isSelected =
                        selectedSupervisorEmails.includes(m.email) ||
                        selectedSupervisorEmails.includes(m.name);

                      return (
                        <div
                          key={m.email}
                          onClick={() => toggleSupervisorSelection(identifier)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-[#F47820]/15 border-[#F47820]/50 shadow-[0_0_10px_rgba(244,120,32,0.15)]"
                              : "bg-[#0A0710]/60 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-[#F47820] border-[#F47820] text-black"
                                  : "border-white/20 bg-black/40"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 font-extrabold stroke-[3]" />}
                            </div>
                            <div>
                              <span className="font-semibold text-xs text-white block">{m.name}</span>
                              <span className="text-[10px] text-muted font-mono">{m.email}</span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-surface border border-white/10 text-muted">
                            {m.role}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Selected Count & Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-[#F47820] font-bold">
                  {selectedSupervisorEmails.length} Selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAssignModalTeam(null)}
                    className="px-4 py-2 rounded-xl glass-card border border-white/10 text-xs font-bold text-muted hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveModalSupervisors}
                    disabled={isAssigningSupervisors}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-white font-extrabold text-xs shadow-lg shadow-[#F47820]/30 hover:shadow-[#F47820]/60 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isAssigningSupervisors ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Supervisors</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Evaluation Details Modal Overlay */}
      <AnimatePresence>
        {detailsCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-prominent rounded-3xl p-6 sm:p-8 border border-[#F47820]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820]" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#F47820] uppercase tracking-wider">
                    Candidate Evaluation Details
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white">
                    {detailsCandidate.name}
                  </h3>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    {detailsCandidate.rollNumber} • {detailsCandidate.branch} ({detailsCandidate.domain})
                  </p>
                </div>
                <button
                  onClick={() => setDetailsCandidate(null)}
                  className="p-2 rounded-xl bg-surface border border-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Team & Supervisors Info */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-muted block text-[10px] uppercase">GD Team:</span>
                  <span className="text-[#F47820] font-bold">{detailsCandidate.gdTeam}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted block text-[10px] uppercase">Assigned Supervisors:</span>
                  <span className="text-white font-bold">{formatSupervisorDisplay(detailsCandidate.assignedSupervisors)}</span>
                </div>
              </div>

              {/* 5 Criteria Score Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#F47820] uppercase tracking-wider">
                  5 Criteria Scores Breakdown
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0710] border border-white/5">
                    <span className="text-white">1. Communication & Articulation</span>
                    <span className="font-mono font-bold text-[#F47820]">{detailsCandidate.commScore} / 5 Stars</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0710] border border-white/5">
                    <span className="text-white">2. Topic Knowledge</span>
                    <span className="font-mono font-bold text-[#F47820]">{detailsCandidate.knowledgeScore} / 5 Stars</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0710] border border-white/5">
                    <span className="text-white">3. Confidence & Team Dynamics</span>
                    <span className="font-mono font-bold text-[#F47820]">{detailsCandidate.confidenceScore} / 5 Stars</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0710] border border-white/5">
                    <span className="text-white">4. Real-Time Thinking</span>
                    <span className="font-mono font-bold text-[#F47820]">{detailsCandidate.realtimeScore} / 5 Stars</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0710] border border-white/5">
                    <span className="text-white">5. Attacking / Counterattacking Points</span>
                    <span className="font-mono font-bold text-[#F47820]">{detailsCandidate.attackScore} / 5 Stars</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-[#F47820]/15 border border-[#F47820]/40 font-bold text-sm">
                    <span className="text-white">Total Score Calculated:</span>
                    <span className="font-mono text-[#F47820]">{detailsCandidate.totalScore} / 25</span>
                  </div>
                </div>
              </div>

              {/* Supervisor Remarks & Comments */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#F47820] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Supervisor Remarks & Comments</span>
                </h4>
                <div className="p-4 rounded-xl bg-[#0A0710] border border-white/10 text-xs text-white leading-relaxed min-h-[70px]">
                  {detailsCandidate.supervisorComments ? (
                    <p className="whitespace-pre-wrap">{detailsCandidate.supervisorComments}</p>
                  ) : (
                    <p className="text-muted italic">No supervisor remarks recorded for this candidate yet.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setDetailsCandidate(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#F47820] text-black font-extrabold text-xs shadow-lg shadow-[#F47820]/30 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Team Size Selection Modal Overlay */}
      <AnimatePresence>
        {isRandomizeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-prominent rounded-3xl p-6 sm:p-8 border border-[#F47820]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820]" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#F47820] uppercase tracking-wider">
                    Dynamic Team Randomizer
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white">
                    Select Target Team Size (Min 3 – Max 9)
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Choose how many candidates to aim for per GD team.
                  </p>
                </div>
                <button
                  onClick={() => setIsRandomizeModalOpen(false)}
                  className="p-2 rounded-xl bg-surface border border-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Size Selector Grid */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Target Members Per Team:
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[3, 4, 5, 6, 7, 8, 9].map((size) => {
                    const isSelected = selectedTargetSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedTargetSize(size)}
                        className={`py-3 rounded-xl font-mono font-extrabold text-sm border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-[#F47820] border-[#F47820] text-black shadow-lg shadow-[#F47820]/40 scale-105"
                            : "bg-[#0A0710]/60 border-white/10 text-white hover:border-white/30 hover:bg-white/5"
                        }`}
                      >
                        <span>{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Partitioning Live Calculation Preview */}
              {(() => {
                const totalRegs = gdResults.length > 0 ? gdResults.length : 74;
                const estTeams = Math.round(totalRegs / selectedTargetSize);
                const minSize = Math.max(3, Math.floor(totalRegs / Math.max(1, estTeams)));
                const maxSize = Math.min(9, Math.ceil(totalRegs / Math.max(1, estTeams)));

                return (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted">Total Candidates Registered:</span>
                      <span className="text-white font-bold">{totalRegs}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted">Target Size Selected:</span>
                      <span className="text-[#F47820] font-bold">{selectedTargetSize} Members / Team</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
                      <span className="text-muted">Estimated Teams Created:</span>
                      <span className="text-emerald-400 font-bold">~{estTeams} Teams ({minSize}–{maxSize} per team)</span>
                    </div>
                  </div>
                );
              })()}

              {/* Modal Actions */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsRandomizeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl glass-card border border-white/10 text-xs font-bold text-muted hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRandomizeTeams(selectedTargetSize)}
                  disabled={isRandomizing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-white font-extrabold text-xs shadow-lg shadow-[#F47820]/30 hover:shadow-[#F47820]/60 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isRandomizing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shuffle className="w-4 h-4" />
                  )}
                  <span>Generate GD Teams</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
