"use client";
import { useState } from "react";
import { useRentalStore } from "@/lib/store";
import LenderPortal from "./LenderPortal";
import AdminPanel from "./AdminPanel";
import InspectorPanel from "./InspectorPanel";
import GigWorkerPanel from "./GigWorkerPanel";

// Lender request management sub-panel
function LenderRequestsPanel() {
  const { toolRequests, approveRequest, rejectRequest } = useRentalStore();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const pending = toolRequests.filter((r) => r.status === "pending");
  const others = toolRequests.filter((r) => r.status !== "pending");

  const STATUS_COLOR: Record<string, string> = {
    approved: "#22c55e", rejected: "#ef4444", pending: "#eab308", cancelled: "#94a3b8",
  };

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-white mb-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-yellow-400 rounded-full" />
        Pending Requests ({pending.length})
      </h4>
      {pending.length === 0 && (
        <div className="glass-card p-8 text-center text-slate-500">
          <div className="text-3xl mb-2">📋</div>
          <p>No pending requests from borrowers.</p>
        </div>
      )}
      {pending.map((req) => (
        <div key={req.requestId} id={`req-${req.requestId}`} className="glass-card p-5"
          style={{ borderColor: "rgba(234,179,8,0.2)" }}>
          <div className="flex items-start gap-4 mb-3">
            <span className="text-3xl">{req.toolIcon}</span>
            <div className="flex-1">
              <h5 className="font-bold text-white">{req.toolName}</h5>
              <p className="text-slate-400 text-xs">
                {req.borrowerName} · {req.borrowerEmail} · {req.borrowerPhone}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                📅 {req.startDate} → {req.endDate} &nbsp;·&nbsp; Requested {req.requestDate}
              </p>
            </div>
            <span className="status-reserved text-xs">Awaiting</span>
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1 text-sm" placeholder="Note to borrower (optional)..."
              value={notes[req.requestId] ?? ""}
              onChange={(e) => setNotes((p) => ({ ...p, [req.requestId]: e.target.value }))} />
            <button id={`approve-req-${req.requestId}`}
              onClick={() => approveRequest(req.requestId, notes[req.requestId] ?? "")}
              className="py-2 px-4 rounded-xl text-sm font-bold transition-all flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }}>
              ✅ Approve
            </button>
            <button id={`reject-req-${req.requestId}`}
              onClick={() => rejectRequest(req.requestId, notes[req.requestId] ?? "")}
              className="py-2 px-4 rounded-xl text-sm font-bold transition-all flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              ❌ Reject
            </button>
          </div>
        </div>
      ))}

      {others.length > 0 && (
        <>
          <h4 className="font-bold text-slate-400 mt-4 mb-3">Past Requests</h4>
          <div className="space-y-3">
            {others.map((req) => (
              <div key={req.requestId} className="glass-card p-4 flex items-center gap-4">
                <span className="text-2xl">{req.toolIcon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{req.toolName}</p>
                  <p className="text-slate-400 text-xs">{req.borrowerName} · {req.startDate} → {req.endDate}</p>
                  {req.lenderNote && <p className="text-slate-500 text-xs mt-0.5 italic">{req.lenderNote}</p>}
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{
                    background: `${STATUS_COLOR[req.status]}15`,
                    border: `1px solid ${STATUS_COLOR[req.status]}35`,
                    color: STATUS_COLOR[req.status],
                  }}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Role definitions ─────────────────────────────────────────
const ROLES = [
  {
    id: "lender",
    label: "Lender",
    icon: "🏪",
    color: "#f97316",
    desc: "List your tools & manage requests",
    tabs: [
      { id: "list", label: "List a Tool" },
      { id: "requests", label: "Tool Requests" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: "🛡️",
    color: "#a855f7",
    desc: "Approve listings, manage disputes",
    tabs: [],
  },
  {
    id: "inspector",
    label: "Inspector",
    icon: "🔍",
    color: "#0ea5e9",
    desc: "Inspect tools after return",
    tabs: [],
  },
  {
    id: "gigworker",
    label: "Gig Worker",
    icon: "🛵",
    color: "#22c55e",
    desc: "Handle tool pickups & deliveries",
    tabs: [],
  },
] as const;

type RoleId = typeof ROLES[number]["id"];

export default function RolePortal() {
  const [activeRole, setActiveRole] = useState<RoleId>("lender");
  const [lenderTab, setLenderTab] = useState<"list" | "requests">("list");

  const role = ROLES.find((r) => r.id === activeRole)!;

  return (
    <section id="portals" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="pill inline-flex mb-4">👥 Role Portals</div>
          <h2 className="text-4xl font-black text-white mb-3">
            Select Your <span className="glow-text">Role</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Each role has its own panel. Switch between Lender, Admin, Inspector, and Gig Worker to manage the system.
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {ROLES.map((r) => (
            <button key={r.id} id={`role-btn-${r.id}`} onClick={() => setActiveRole(r.id)}
              className="p-4 rounded-2xl text-center transition-all duration-200"
              style={{
                background: activeRole === r.id ? `${r.color}18` : "rgba(8,20,35,0.6)",
                border: `2px solid ${activeRole === r.id ? r.color : "rgba(255,255,255,0.07)"}`,
                boxShadow: activeRole === r.id ? `0 4px 24px ${r.color}20` : "none",
              }}>
              <div className="text-3xl mb-2">{r.icon}</div>
              <div className="font-bold text-sm" style={{ color: activeRole === r.id ? r.color : "#e2e8f0" }}>
                {r.label}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 leading-tight">{r.desc}</div>
            </button>
          ))}
        </div>

        {/* Panel container */}
        <div className="glass-card-flat p-6 md:p-8">
          {/* Panel header */}
          <div className="flex items-center gap-4 mb-6 pb-5"
            style={{ borderBottom: `1px solid ${role.color}20` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${role.color}15`, border: `1px solid ${role.color}30` }}>
              {role.icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{role.label} Portal</h3>
              <p className="text-slate-400 text-sm">{role.desc}</p>
            </div>
          </div>

          {/* Lender sub-tabs */}
          {activeRole === "lender" && (
            <>
              <div className="flex gap-2 mb-6">
                {(["list", "requests"] as const).map((t) => (
                  <button key={t} id={`lender-subtab-${t}`} onClick={() => setLenderTab(t)}
                    className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: lenderTab === t ? "linear-gradient(135deg,#f97316,#c2410c)" : "rgba(249,115,22,0.07)",
                      color: lenderTab === t ? "white" : "#94a3b8",
                      border: `1px solid ${lenderTab === t ? "transparent" : "rgba(249,115,22,0.15)"}`,
                    }}>
                    {t === "list" ? "📦 List a Tool" : "📋 Borrower Requests"}
                  </button>
                ))}
              </div>
              {lenderTab === "list" && <LenderPortal />}
              {lenderTab === "requests" && <LenderRequestsPanel />}
            </>
          )}

          {activeRole === "admin" && <AdminPanel />}
          {activeRole === "inspector" && <InspectorPanel />}
          {activeRole === "gigworker" && <GigWorkerPanel />}
        </div>
      </div>
    </section>
  );
}
