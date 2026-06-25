"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import ToolCatalog from "@/components/ToolCatalog";
import { useRentalStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

function MyRentals() {
  const { rentals, returnTool, cancelRental, raiseDispute } = useRentalStore();
  const { user } = useAuth();
  const [disputeText, setDisputeText] = useState<Record<string, string>>({});

  const mine = rentals.filter((r) => r.userEmail === user?.email || r.userName === user?.name);
  const active = mine.filter((r) => r.status === "active");
  const past = mine.filter((r) => r.status !== "active");

  const STATUS_COLOR: Record<string, string> = {
    active: "#22c55e", completed: "#0ea5e9", cancelled: "#ef4444", in_transit: "#eab308",
  };
  const DELIVERY_LABEL: Record<string, string> = {
    pending_pickup: "⏳ Awaiting Pickup", picked_up: "📦 Picked Up",
    delivered: "✅ Delivered", return_pickup: "↩️ Return Pickup", returned: "🏁 Returned",
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white">Active Rentals ({active.length})</h3>
      {active.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-500">
          <div className="text-4xl mb-2">📋</div>
          <p>No active rentals. Browse tools to get started!</p>
        </div>
      )}
      {active.map((r) => (
        <div key={r.id} id={`my-rental-${r.id}`} className="glass-card p-5">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">{r.toolIcon}</span>
            <div className="flex-1">
              <h4 className="font-bold text-white">{r.toolName}</h4>
              <p className="text-slate-400 text-xs">{r.startDate} → {r.endDate} · {r.totalDays} days</p>
            </div>
            <div className="text-orange-400 font-black text-lg">${r.totalCost}</div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{ background: `${STATUS_COLOR[r.status]}15`, border: `1px solid ${STATUS_COLOR[r.status]}30`, color: STATUS_COLOR[r.status] }}>
              {r.status}
            </span>
          </div>
          {r.deliveryStatus && (
            <div className="p-3 rounded-xl mb-3"
              style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)" }}>
              <p className="text-sky-400 text-xs font-semibold">
                🚚 Delivery: {DELIVERY_LABEL[r.deliveryStatus] ?? r.deliveryStatus}
              </p>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <button id={`return-${r.id}`} onClick={() => returnTool(r.id)} className="btn-secondary text-xs" style={{ padding: "7px 14px" }}>
              ↩ Return Tool
            </button>
            <button id={`cancel-${r.id}`} onClick={() => cancelRental(r.id)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              Cancel
            </button>
          </div>
          {/* Dispute */}
          <div className="mt-3 flex gap-2">
            <input className="input-field flex-1 text-xs" placeholder="Raise a dispute..."
              value={disputeText[r.id] ?? ""}
              onChange={(e) => setDisputeText((p) => ({ ...p, [r.id]: e.target.value }))} />
            <button onClick={() => { if (disputeText[r.id] && user) raiseDispute(r.id, user.name, user.email, disputeText[r.id]); setDisputeText((p) => ({ ...p, [r.id]: "" })); }}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "rgba(234,179,8,0.1)", color: "#facc15", border: "1px solid rgba(234,179,8,0.25)" }}>
              ⚖️ Dispute
            </button>
          </div>
        </div>
      ))}

      {past.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-slate-400 mt-6">Past Rentals ({past.length})</h3>
          {past.map((r) => (
            <div key={r.id} className="glass-card p-4 flex items-center gap-4" style={{ opacity: 0.7 }}>
              <span className="text-2xl">{r.toolIcon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{r.toolName}</p>
                <p className="text-slate-400 text-xs">{r.startDate} → {r.endDate}</p>
              </div>
              <div className="text-orange-400 font-bold">${r.totalCost}</div>
              <span className="text-xs font-bold" style={{ color: STATUS_COLOR[r.status] }}>{r.status}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const TABS = ["browse", "my-rentals"] as const;

export default function BorrowerPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("browse");

  return (
    <DashboardShell title="Borrower Dashboard" subtitle="Browse available tools, book rentals, and track your orders." requiredRole="borrower">
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t} id={`borrower-tab-${t}`} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t ? "linear-gradient(135deg,#0ea5e9,#0369a1)" : "rgba(14,165,233,0.07)",
              color: tab === t ? "white" : "#94a3b8",
              border: `1px solid ${tab === t ? "transparent" : "rgba(14,165,233,0.15)"}`,
            }}>
            {t === "browse" ? "🔍 Browse Tools" : "📋 My Rentals"}
          </button>
        ))}
      </div>
      {tab === "browse" && <ToolCatalog />}
      {tab === "my-rentals" && <MyRentals />}
    </DashboardShell>
  );
}
