"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowUpDown,
  Edit2,
  Check,
  X,
  Plus,
  PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

interface Member {
  email: string;
  name: string;
  role: "member" | "admin" | "super_admin";
  visible: boolean;
  displayOrder: number;
}

export default function MembersManagement() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Role Confirmation State
  const [targetMember, setTargetMember] = useState<Member | null>(null);
  const [targetRole, setTargetRole] = useState<"member" | "admin" | "super_admin" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Name state
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addRole, setAddRole] = useState<"member" | "admin" | "super_admin">("admin");
  const [addVisible, setAddVisible] = useState(true);
  const [addDisplayOrder, setAddDisplayOrder] = useState("0");

  // Loading indicator map for specific row updates (to prevent multiple clicks)
  const [updatingEmails, setUpdatingEmails] = useState<Record<string, boolean>>({});

  const fetchMembers = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/members`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMembers(json.data);
        }
      } else {
        setErrorMessage("Failed to load club roster members.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter list
  const filteredMembers = members.filter((m) => {
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate statistics
  const totalCount = members.length;
  const adminCount = members.filter(m => m.role === "admin").length;
  const superCount = members.filter(m => m.role === "super_admin").length;
  const visibleCount = members.filter(m => m.visible).length;

  // Confirm role update
  const confirmRoleChange = (member: Member, role: "member" | "admin" | "super_admin") => {
    setTargetMember(member);
    setTargetRole(role);
  };

  // Submit role update to backend
  const handleRoleChange = async () => {
    if (!targetMember || !targetRole) return;
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/members/${targetMember.email}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: targetRole }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMessage(`Successfully updated ${targetMember.email} to ${targetRole}.`);
        setMembers((prev) =>
          prev.map((m) =>
            m.email === targetMember.email ? { ...m, role: targetRole as any } : m
          )
        );
        setTargetMember(null);
        setTargetRole("");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Failed to update role.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Visibility handler
  const handleToggleVisibility = async (email: string, currentVisible: boolean) => {
    setUpdatingEmails((prev) => ({ ...prev, [email]: true }));
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/members/${email}/display`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ visible: !currentVisible }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.email === email ? { ...m, visible: !currentVisible } : m
          )
        );
      } else {
        setErrorMessage(json.message || "Failed to update visibility.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setUpdatingEmails((prev) => ({ ...prev, [email]: false }));
    }
  };

  // Update Display Order handler
  const handleDisplayOrderChange = async (email: string, order: number) => {
    setUpdatingEmails((prev) => ({ ...prev, [email]: true }));
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/members/${email}/display`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ displayOrder: order }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.email === email ? { ...m, displayOrder: order } : m
          )
        );
      } else {
        setErrorMessage(json.message || "Failed to update display order.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setUpdatingEmails((prev) => ({ ...prev, [email]: false }));
    }
  };

  // Edit Name submit handler
  const openAddModal = () => {
    setAddEmail("");
    setAddName("");
    setAddRole("admin");
    setAddVisible(true);
    setAddDisplayOrder("0");
    setErrorMessage("");
    setIsAddModalOpen(true);
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      email: addEmail,
      name: addName,
      role: addRole,
      visible: addVisible,
      displayOrder: parseInt(addDisplayOrder, 10) || 0,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMessage(`Member ${addEmail} added successfully!`);
        setIsAddModalOpen(false);
        fetchMembers();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(json.message || "Failed to add member. Make sure the 'Members' sheet tab exists.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameSave = async (email: string) => {
    if (!editingName.trim()) return;
    setUpdatingEmails((prev) => ({ ...prev, [email]: true }));
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/members/${email}/display`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: editingName }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.email === email ? { ...m, name: editingName } : m
          )
        );
        setEditingEmail(null);
      } else {
        setErrorMessage(json.message || "Failed to save display name.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred.");
    } finally {
      setUpdatingEmails((prev) => ({ ...prev, [email]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Member Role Manager
          </h2>
          <p className="text-sm text-muted mt-1">
            Promote or demote administrative operators, configure visibilities, and sort front-facing leaders.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Member
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

      {/* ─── Metrics Cards Grid ────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Members</span>
          <span className="text-2xl font-bold text-foreground font-heading mt-2">{totalCount}</span>
        </div>

        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Administrators</span>
          <span className="text-2xl font-bold text-primary font-heading mt-2">{adminCount}</span>
        </div>

        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Super Admins</span>
          <span className="text-2xl font-bold text-purple-400 font-heading mt-2">{superCount}</span>
        </div>

        <div className="rounded-2xl border border-glass-border bg-[#13131A] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Visible Leaders</span>
          <span className="text-2xl font-bold text-emerald-400 font-heading mt-2">{visibleCount}</span>
        </div>
      </div>

      {/* ─── Filter Control Bar ───────────────────────── */}
      <div className="max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search member name or email..."
          className="w-full pl-10 pr-4.5 py-2.5 rounded-xl bg-[#13131A] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* ─── Data Roster Table ────────────────────────── */}
      <div className="rounded-2xl bg-[#13131A] border border-glass-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching roster database...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-24 text-center text-muted">
            <Users className="w-12 h-12 mx-auto text-muted/30 mb-3" />
            <p className="text-sm font-medium">No members found matching filter query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-[#181824]/50">
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Member Details</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Role</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Display Order</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted">Visibility</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider font-semibold text-muted text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/30">
                {filteredMembers.map((member) => {
                  const isUpdating = updatingEmails[member.email];
                  const isEditingThis = editingEmail === member.email;
                  const isSelf = member.email.toLowerCase() === currentUser?.email.toLowerCase();

                  return (
                    <tr key={member.email} className="hover:bg-surface/10 transition-colors">
                      {/* Name / Email details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface/50 border border-glass-border flex items-center justify-center text-xs font-bold text-primary uppercase">
                            {member.name ? member.name.charAt(0) : member.email.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="px-2 py-1 rounded bg-[#181824] border border-glass-border text-foreground text-xs focus:outline-none"
                                />
                                <button
                                  onClick={() => handleNameSave(member.email)}
                                  className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:brightness-110"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingEmail(null)}
                                  className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:brightness-110"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-foreground">{member.name}</span>
                                <button
                                  onClick={() => {
                                    setEditingEmail(member.email);
                                    setEditingName(member.name);
                                  }}
                                  className="text-muted hover:text-foreground p-0.5"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="text-xs text-muted font-mono truncate">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role selection dropdown */}
                      <td className="p-4">
                        <select
                          disabled={isUpdating || isSelf}
                          value={member.role}
                          onChange={(e) => confirmRoleChange(member, e.target.value as any)}
                          className="px-3 py-1.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>

                      {/* Display Order input */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 max-w-[80px]">
                          <ArrowUpDown className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                          <input
                            type="number"
                            min={0}
                            disabled={isUpdating}
                            defaultValue={member.displayOrder}
                            onBlur={(e) => handleDisplayOrderChange(member.email, parseInt(e.target.value || "0", 10))}
                            className="w-full text-center px-1.5 py-1 rounded bg-[#181824] border border-glass-border text-foreground text-xs focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Visibility toggle switch */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleVisibility(member.email, member.visible)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50 ${
                            member.visible
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : "bg-surface text-muted border-glass-border hover:text-foreground"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : member.visible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Self/Actions Indicators */}
                      <td className="p-4 text-right">
                        {isSelf ? (
                          <span className="text-[10px] font-mono uppercase bg-primary/10 border border-primary/20 text-primary-light px-2.5 py-1 rounded-full font-bold">
                            My Account
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted font-medium">Editable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Role Confirmation Modal Overlay ─────────── */}
      <AnimatePresence>
        {targetMember && targetRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setTargetMember(null);
                setTargetRole("");
              }}
              className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-default"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 shadow-2xl overflow-hidden z-10 text-center"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
              <div className="mx-auto w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>

              <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                Confirm Role Change
              </h4>
              <p className="text-sm text-muted mb-6 leading-relaxed">
                Are you sure you want to change <span className="text-foreground font-semibold">{targetMember.name}</span>'s 
                role from <span className="text-foreground font-mono font-bold capitalize">{targetMember.role}</span> to{" "}
                <span className="text-primary font-mono font-bold capitalize">{targetRole}</span>?
              </p>

              {/* Actions */}
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTargetMember(null);
                    setTargetRole("");
                  }}
                  className="px-5 py-2.5 rounded-xl border border-glass-border text-muted hover:text-foreground hover:bg-surface/50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Confirm Promotion"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Add Member Modal Overlay ────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-default"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-glass-border mb-5">
                <h4 className="font-heading text-lg font-bold text-foreground">
                  Add Club Operator
                </h4>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg border border-glass-border text-muted hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="E.g., Venkat Raman"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                      Initial Role
                    </label>
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as any)}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                      Display Sort Rank
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={addDisplayOrder}
                      onChange={(e) => setAddDisplayOrder(e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-[#181824] border border-glass-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Visibility */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="addVisible"
                    checked={addVisible}
                    onChange={(e) => setAddVisible(e.target.checked)}
                    className="w-4.5 h-4.5 rounded bg-[#181824] border border-glass-border text-primary focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="addVisible" className="text-xs text-muted font-semibold cursor-pointer">
                    Show as Leader on public Club Roster
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t border-glass-border pt-4 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
                        Adding...
                      </>
                    ) : (
                      <>
                        Add Operator
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
