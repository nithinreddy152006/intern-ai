"use client";
import { useState } from "react";
import { useRentalStore } from "@/lib/store";
import { PendingTool } from "@/lib/data";

function PendingCard({ tool, onApprove, onReject }: {
  tool: PendingTool;
  onApprove: (id: string, d: number, w: number, note: string) => void;
  onReject: (id: string, note: string) => void;
}) {
  const [daily, setDaily] = useState(tool.suggestedDailyRate ?? 20);
  const [weekly, setWeekly] = useState(Math.round((tool.suggestedDailyRate ?? 20) * 5));
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div id={`admin-pending-${tool.id}`}
      className="glass-card overflow-hidden"
      style={{ borderColor: tool.status === "pending" ? "rgba(249,115,22,0.25)" : tool.status === "approved" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)" }}
    >
      {/* Tool image / icon */}
      <div className="h-28 flex items-center justify-center relative"
        style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.07),rgba(14,165,233,0.05))" }}>
        {tool.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
          : <span className="text-5xl">🔧</span>}
        <div className="absolute top-2 right-2">
          {tool.status === "pending" && <span className="status-reserved">Pending Review</span>}
          {tool.status === "approved" && <span className="status-available">Approved</span>}
          {tool.status === "rejected" && <span className="status-rented">Rejected</span>}
        </div>
        <div className="absolute top-2 left-2 pill" style={{ fontSize: "10px", padding: "2px 8px" }}>{tool.category}</div>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-white mb-0.5">{tool.name}</h4>
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{tool.description}</p>

        {/* Lender info */}
        <div className="flex flex-wrap gap-2 text-xs mb-3">
          <span className="text-slate-400">👤 {tool.lenderName}</span>
          <span className="text-slate-500">{tool.lenderEmail}</span>
          <span className="text-slate-500">📞 {tool.lenderPhone}</span>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          <span className="pill text-xs" style={{ fontSize: "10px", padding: "2px 10px" }}>{tool.condition} condition</span>
          {tool.suggestedDailyRate && (
            <span className="text-slate-400 text-xs">Suggested: ${tool.suggestedDailyRate}/day</span>
          )}
        </div>

        {/* Specs */}
        {Object.keys(tool.specs).length > 0 && (
          <div className="grid grid-cols-2 gap-1 mb-4">
            {Object.entries(tool.specs).slice(0, 4).map(([k, v]) => (
              <div key={k} className="rounded-lg px-2 py-1"
                style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.1)" }}>
                <div className="text-slate-500" style={{ fontSize: "9px", textTransform: "uppercase" }}>{k}</div>
                <div className="text-slate-200 text-xs font-semibold">{v}</div>
              </div>
            ))}
          </div>
        )}

        {tool.status === "pending" && (
          <>
            <button onClick={() => setOpen(!open)}
              className="w-full text-sm font-semibold py-2 rounded-xl mb-3 transition-all"
              style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#fb923c" }}>
              {open ? "▲ Hide Pricing" : "▼ Set Price & Decide"}
            </button>

            {open && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Rate ($) *</label>
                    <input id={`admin-daily-${tool.id}`} className="input-field" type="number" min={1}
                      value={daily} onChange={(e) => { setDaily(+e.target.value); setWeekly(Math.round(+e.target.value * 5)); }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Rate ($) *</label>
                    <input id={`admin-weekly-${tool.id}`} className="input-field" type="number" min={1}
                      value={weekly} onChange={(e) => setWeekly(+e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Note</label>
                  <input className="input-field" placeholder="Optional note to lender..."
                    value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button id={`admin-approve-${tool.id}`}
                    onClick={() => onApprove(tool.id, daily, weekly, note)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }}>
                    ✅ Approve & Set Price
                  </button>
                  <button id={`admin-reject-${tool.id}`}
                    onClick={() => onReject(tool.id, note)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {tool.status !== "pending" && tool.adminNote && (
          <div className="mt-2 p-2 rounded-lg text-xs"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
            📝 {tool.adminNote}
          </div>
        )}
        {tool.status === "approved" && (
          <div className="mt-2 text-xs text-slate-400">${tool.dailyRate}/day · ${tool.weeklyRate}/week</div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { pendingTools, approveTool, rejectPendingTool, tools, rentals, disputes, resolveDispute } = useRentalStore();
  const [activeTab, setActiveTab] = useState<"listings" | "users" | "disputes">("listings");
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({});

  const pending = pendingTools.filter((p) => p.status === "pending");
  const decided = pendingTools.filter((p) => p.status !== "pending");
  const openDisputes = disputes.filter((d) => d.status !== "resolved" && d.status !== "closed");

  const tabs = [
    { id: "listings", label: "Tool Listings", icon: "🔧", badge: pending.length },
    { id: "users", label: "Platform Stats", icon: "📊", badge: 0 },
    { id: "disputes", label: "Disputes", icon: "⚖️", badge: openDisputes.length },
  ] as const;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} id={`admin-tab-${t.id}`} onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === t.id ? "linear-gradient(135deg,#f97316,#c2410c)" : "rgba(249,115,22,0.07)",
              color: activeTab === t.id ? "white" : "#94a3b8",
              border: `1px solid ${activeTab === t.id ? "transparent" : "rgba(249,115,22,0.15)"}`,
            }}>
            {t.icon} {t.label}
            {t.badge > 0 && (
              <span className="w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.8)", color: "white" }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tool Listings ── */}
      {activeTab === "listings" && (
        <div>
          {pending.length > 0 && (
            <>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full" style={{ animation: "pulseGlow 1.5s infinite" }} />
                Pending Review ({pending.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {pending.map((p) => (
                  <PendingCard key={p.id} tool={p} onApprove={approveTool} onReject={rejectPendingTool} />
                ))}
              </div>
            </>
          )}

          {pending.length === 0 && (
            <div className="glass-card p-10 text-center text-slate-500 mb-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold">All tool submissions have been reviewed!</p>
            </div>
          )}

          {decided.length > 0 && (
            <>
              <h4 className="text-slate-400 font-bold mb-4">Past Decisions ({decided.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {decided.map((p) => (
                  <PendingCard key={p.id} tool={p} onApprove={approveTool} onReject={rejectPendingTool} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Platform Stats ── */}
      {activeTab === "users" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Tools", value: tools.length, icon: "🔧", color: "#f97316" },
              { label: "Active Rentals", value: rentals.filter((r) => r.status === "active").length, icon: "🔑", color: "#22c55e" },
              { label: "Pending Listings", value: pending.length, icon: "⏳", color: "#eab308" },
              { label: "Open Disputes", value: openDisputes.length, icon: "⚖️", color: "#ef4444" },
            ].map((s, i) => (
              <div key={i} className="glass-card p-5 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h4 className="font-bold text-white mb-4">All Live Tools</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {tools.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(8,20,35,0.5)", border: "1px solid rgba(249,115,22,0.08)" }}>
                  <span className="text-xl">{t.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.category} · ${t.dailyRate}/day</div>
                  </div>
                  <span className={`status-${t.status}`} style={{ fontSize: "10px" }}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h4 className="font-bold text-white mb-4">Recent Rentals</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rentals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(8,20,35,0.5)", border: "1px solid rgba(249,115,22,0.08)" }}>
                  <span className="text-xl">{r.toolIcon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{r.toolName}</div>
                    <div className="text-xs text-slate-400">{r.userName} · {r.startDate} → {r.endDate}</div>
                  </div>
                  <div className="text-orange-400 font-bold text-sm">${r.totalCost}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Disputes ── */}
      {activeTab === "disputes" && (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="glass-card p-10 text-center text-slate-500">
              <div className="text-3xl mb-2">⚖️</div>
              <p>No disputes raised yet.</p>
            </div>
          ) : disputes.map((d) => (
            <div key={d.disputeId} id={`dispute-${d.disputeId}`} className="glass-card p-5"
              style={{ borderColor: d.status === "resolved" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dispute #{d.disputeId}
                  </span>
                  <p className="text-white font-semibold mt-0.5">Rental: {d.rentalId}</p>
                  <p className="text-slate-400 text-xs">Raised by: {d.raisedBy} · {d.raisedByEmail}</p>
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{
                    background: d.status === "resolved" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${d.status === "resolved" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                    color: d.status === "resolved" ? "#4ade80" : "#f87171",
                  }}>
                  {d.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{d.description}</p>
              {d.resolution && (
                <div className="p-3 rounded-xl mb-3"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <span className="text-xs text-green-400 font-bold">Resolution: </span>
                  <span className="text-slate-300 text-xs">{d.resolution}</span>
                </div>
              )}
              {d.status !== "resolved" && (
                <div className="flex gap-2">
                  <input className="input-field flex-1 text-sm" placeholder="Enter resolution..."
                    value={resolveNote[d.disputeId] ?? ""}
                    onChange={(e) => setResolveNote((prev) => ({ ...prev, [d.disputeId]: e.target.value }))} />
                  <button id={`resolve-${d.disputeId}`}
                    onClick={() => resolveDispute(d.disputeId, resolveNote[d.disputeId] ?? "Resolved by admin.")}
                    className="btn-primary text-sm flex-shrink-0" style={{ padding: "10px 18px" }}>
                    Resolve ✓
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
