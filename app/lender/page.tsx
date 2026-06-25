"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import LenderPortal from "@/components/LenderPortal";
import { useRentalStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

function LenderRequestsPanel() {
  const { toolRequests, approveRequest, rejectRequest } = useRentalStore();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const STATUS_COLOR: Record<string, string> = {
    approved: "#22c55e", rejected: "#ef4444", pending: "#eab308", cancelled: "#94a3b8",
  };

  return (
    <div className="space-y-4">
      {toolRequests.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-500">
          <div className="text-4xl mb-3">📋</div>
          <p>No borrower requests yet.</p>
        </div>
      )}
      {toolRequests.map((req) => (
        <div key={req.requestId} id={`req-${req.requestId}`} className="glass-card p-5"
          style={{ borderColor: req.status === "pending" ? "rgba(234,179,8,0.25)" : "rgba(255,255,255,0.05)" }}>
          <div className="flex items-start gap-4 mb-3">
            <span className="text-3xl">{req.toolIcon}</span>
            <div className="flex-1">
              <h4 className="font-bold text-white">{req.toolName}</h4>
              <p className="text-slate-400 text-xs">{req.borrowerName} · {req.borrowerEmail} · {req.borrowerPhone}</p>
              <p className="text-slate-500 text-xs mt-0.5">📅 {req.startDate} → {req.endDate}</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                background: `${STATUS_COLOR[req.status]}15`,
                border: `1px solid ${STATUS_COLOR[req.status]}35`,
                color: STATUS_COLOR[req.status],
              }}>{req.status}</span>
          </div>
          {req.status === "pending" && (
            <div className="flex gap-2">
              <input className="input-field flex-1 text-sm" placeholder="Note to borrower..."
                value={notes[req.requestId] ?? ""}
                onChange={(e) => setNotes((p) => ({ ...p, [req.requestId]: e.target.value }))} />
              <button id={`approve-${req.requestId}`} onClick={() => approveRequest(req.requestId, notes[req.requestId] ?? "")}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }}>
                ✅ Approve
              </button>
              <button id={`reject-${req.requestId}`} onClick={() => rejectRequest(req.requestId, notes[req.requestId] ?? "")}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                ❌ Reject
              </button>
            </div>
          )}
          {req.lenderNote && <p className="text-xs text-slate-400 mt-2 italic">Note: {req.lenderNote}</p>}
        </div>
      ))}
    </div>
  );
}

function MyTools() {
  const { tools } = useRentalStore();
  const { user } = useAuth();
  // Show tools listed by this lender
  const mine = tools.filter((t) => t.lenderEmail === user?.email || t.lenderName === user?.name);
  const all = mine.length > 0 ? mine : tools.slice(0, 3); // fallback for demo

  return (
    <div className="space-y-3">
      {all.map((t) => (
        <div key={t.id} className="glass-card p-4 flex items-center gap-4">
          <span className="text-3xl">{t.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-white">{t.name}</p>
            <p className="text-slate-400 text-xs">{t.category} · ${t.dailyRate}/day · ${t.weeklyRate}/week</p>
          </div>
          <span className={`status-${t.status}`} style={{ fontSize: "11px" }}>{t.status}</span>
        </div>
      ))}
      {all.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-500">
          <p>No tools listed yet. Use "List a Tool" to get started.</p>
        </div>
      )}
    </div>
  );
}

const TABS = ["list-tool", "my-tools", "requests"] as const;
const TAB_LABELS = { "list-tool": "📦 List a Tool", "my-tools": "🔧 My Tools", "requests": "📋 Requests" };

export default function LenderPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("list-tool");

  return (
    <DashboardShell title="Lender Dashboard" subtitle="List your tools, manage requests, track your listings." requiredRole="lender">
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t} id={`lender-tab-${t}`} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t ? "linear-gradient(135deg,#f97316,#c2410c)" : "rgba(249,115,22,0.07)",
              color: tab === t ? "white" : "#94a3b8",
              border: `1px solid ${tab === t ? "transparent" : "rgba(249,115,22,0.15)"}`,
            }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
      {tab === "list-tool" && <div className="glass-card-flat p-6"><LenderPortal /></div>}
      {tab === "my-tools" && <MyTools />}
      {tab === "requests" && <LenderRequestsPanel />}
    </DashboardShell>
  );
}
