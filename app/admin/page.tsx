"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useRentalStore } from "@/lib/store";
import { PendingTool } from "@/lib/data";

type Tab = "overview" | "approvals" | "rentals" | "users" | "disputes" | "payments";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",      icon: "📊" },
  { id: "approvals", label: "Tool Approvals", icon: "🔧" },
  { id: "rentals",   label: "All Rentals",   icon: "📋" },
  { id: "users",     label: "Users",         icon: "👥" },
  { id: "disputes",  label: "Disputes",      icon: "⚖️" },
  { id: "payments",  label: "Payments",      icon: "💳" },
];

/* ── helpers ─────────────────────────────────────────────── */
function Stat({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <div className="glass-card p-5 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-black mb-0.5" style={{ color }}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

/* ── Approval card ───────────────────────────────────────── */
function ApprovalCard({ tool, onApprove, onReject }: {
  tool: PendingTool;
  onApprove: (id: string, d: number, w: number, note: string) => void;
  onReject: (id: string, note: string) => void;
}) {
  const [daily, setDaily] = useState(tool.suggestedDailyRate ?? 20);
  const [weekly, setWeekly] = useState((tool.suggestedDailyRate ?? 20) * 5);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  const statusColor = tool.status === "pending" ? "#eab308" : tool.status === "approved" ? "#22c55e" : "#ef4444";

  return (
    <div className="glass-card overflow-hidden" style={{ borderColor: `${statusColor}25` }}>
      <div className="h-24 flex items-center justify-center text-5xl relative"
        style={{ background: "rgba(249,115,22,0.06)" }}>
        {tool.imageUrl
          ? <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
          : "🔧"}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold"
          style={{ background: `${statusColor}20`, border: `1px solid ${statusColor}40`, color: statusColor }}>
          {tool.status}
        </span>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-white text-sm mb-0.5">{tool.name}</h4>
        <p className="text-slate-400 text-xs mb-2 line-clamp-2">{tool.description}</p>
        <p className="text-xs text-slate-500 mb-1">👤 {tool.lenderName} · {tool.lenderEmail}</p>
        <p className="text-xs text-slate-500 mb-3">📦 {tool.condition} · Suggested: ${tool.suggestedDailyRate}/day</p>

        {tool.status === "pending" && (
          <>
            <button onClick={() => setOpen(!open)}
              className="w-full text-xs py-2 rounded-xl mb-3 font-semibold transition-all"
              style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#fb923c" }}>
              {open ? "▲ Hide" : "▼ Set Price & Decide"}
            </button>
            {open && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Daily Rate ($)</label>
                    <input className="input-field text-sm" type="number"
                      value={daily} onChange={(e) => { setDaily(+e.target.value); setWeekly(+e.target.value * 5); }} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Weekly Rate ($)</label>
                    <input className="input-field text-sm" type="number"
                      value={weekly} onChange={(e) => setWeekly(+e.target.value)} />
                  </div>
                </div>
                <input className="input-field text-xs" placeholder="Note to lender..."
                  value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => onApprove(tool.id, daily, weekly, note)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold"
                    style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }}>
                    ✅ Approve
                  </button>
                  <button onClick={() => onReject(tool.id, note)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {tool.status !== "pending" && (
          <p className="text-xs text-slate-500 italic mt-1">
            {tool.adminNote || (tool.status === "approved" ? `Approved · $${tool.dailyRate}/day` : "Rejected")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const { user, logout, users } = useAuth();
  const { tools, rentals, pendingTools, approveTool, rejectPendingTool, payments, disputes, resolveDispute } = useRentalStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [resolveText, setResolveText] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/auth/admin"); return; }
    if (user.role !== "admin") { router.replace(`/${user.role}`); }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Redirecting...</div>;
  }

  const pending = pendingTools.filter((p) => p.status === "pending");
  const activeRentals = rentals.filter((r) => r.status === "active");
  const openDisputes = disputes.filter((d) => d.status !== "resolved" && d.status !== "closed");
  const revenue = payments.filter((p) => p.paymentStatus === "completed").reduce((s, p) => s + p.amount, 0);

  const renderContent = () => {
    switch (tab) {
      /* ── Overview ── */
      case "overview": return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Stat icon="🔧" label="Live Tools"       value={tools.length}         color="#f97316" />
            <Stat icon="⏳" label="Pending Listings" value={pending.length}        color="#eab308" />
            <Stat icon="🔑" label="Active Rentals"   value={activeRentals.length} color="#22c55e" />
            <Stat icon="👥" label="Registered Users" value={users.length}          color="#0ea5e9" />
            <Stat icon="⚖️" label="Open Disputes"    value={openDisputes.length}  color="#ef4444" />
            <Stat icon="💰" label="Revenue"           value={`$${revenue}`}        color="#a855f7" />
          </div>

          {/* Pending alert */}
          {pending.length > 0 && (
            <div className="p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
              style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)" }}
              onClick={() => setTab("approvals")}>
              <span className="text-2xl">⏳</span>
              <div className="flex-1">
                <p className="font-bold text-yellow-400">{pending.length} tool{pending.length !== 1 ? "s" : ""} awaiting your approval</p>
                <p className="text-slate-400 text-xs">Lenders have submitted listings — review and set pricing to go live.</p>
              </div>
              <span className="text-yellow-400 text-sm font-bold">Review →</span>
            </div>
          )}

          {openDisputes.length > 0 && (
            <div className="p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}
              onClick={() => setTab("disputes")}>
              <span className="text-2xl">⚖️</span>
              <div className="flex-1">
                <p className="font-bold text-red-400">{openDisputes.length} unresolved dispute{openDisputes.length !== 1 ? "s" : ""}</p>
                <p className="text-slate-400 text-xs">Users have raised disputes requiring admin resolution.</p>
              </div>
              <span className="text-red-400 text-sm font-bold">Review →</span>
            </div>
          )}

          {/* Quick tool list */}
          <div className="glass-card p-5">
            <h3 className="font-bold text-white mb-4">Live Catalog ({tools.length} tools)</h3>
            {tools.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-3xl mb-2">📭</p>
                <p>No tools in catalog yet. Approve lender submissions to add tools.</p>
                <button onClick={() => setTab("approvals")} className="btn-primary mt-4 text-sm" style={{ padding: "8px 20px" }}>
                  Go to Approvals →
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tools.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(8,20,35,0.5)" }}>
                    <span className="text-xl">{t.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.category} · ${t.dailyRate}/day</p>
                    </div>
                    <span className={`status-${t.status}`} style={{ fontSize: "10px" }}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      /* ── Tool Approvals ── */
      case "approvals": return (
        <div>
          {pending.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" style={{ animation: "pulseGlow 1.5s infinite" }} />
                <h3 className="font-bold text-white">Pending Review ({pending.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {pending.map((p) => (
                  <ApprovalCard key={p.id} tool={p} onApprove={approveTool} onReject={rejectPendingTool} />
                ))}
              </div>
            </>
          )}
          {pending.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500 mb-8">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-semibold">All submissions reviewed!</p>
            </div>
          )}
          {pendingTools.filter((p) => p.status !== "pending").length > 0 && (
            <>
              <h3 className="font-bold text-slate-400 mb-4">Past Decisions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTools.filter((p) => p.status !== "pending").map((p) => (
                  <ApprovalCard key={p.id} tool={p} onApprove={approveTool} onReject={rejectPendingTool} />
                ))}
              </div>
            </>
          )}
        </div>
      );

      /* ── All Rentals ── */
      case "rentals": return (
        <div className="space-y-3">
          {rentals.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500">
              <p className="text-4xl mb-2">📋</p><p>No rentals yet.</p>
            </div>
          )}
          {rentals.map((r) => (
            <div key={r.id} className="glass-card p-4 flex items-center gap-4">
              <span className="text-2xl">{r.toolIcon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{r.toolName}</p>
                <p className="text-slate-400 text-xs">{r.userName} · {r.userEmail}</p>
                <p className="text-slate-500 text-xs">{r.startDate} → {r.endDate} · {r.totalDays}d</p>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-black">${r.totalCost}</p>
                <span className="text-xs font-bold" style={{ color: r.status === "active" ? "#22c55e" : r.status === "completed" ? "#0ea5e9" : "#ef4444" }}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      );

      /* ── Users ── */
      case "users": return (
        <div className="space-y-3">
          {users.map((u) => {
            const colors: Record<string, string> = { lender: "#f97316", borrower: "#0ea5e9", delivery: "#22c55e", inspector: "#a855f7", admin: "#eab308" };
            const icons: Record<string, string> = { lender: "🏪", borrower: "👷", delivery: "🛵", inspector: "🔍", admin: "🛡️" };
            const c = colors[u.role] ?? "#94a3b8";
            return (
              <div key={u.userId} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${c}18`, border: `1px solid ${c}35` }}>
                  {icons[u.role] ?? "👤"}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{u.name}</p>
                  <p className="text-slate-400 text-xs">{u.email} · {u.phone}</p>
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-bold capitalize"
                  style={{ background: `${c}15`, border: `1px solid ${c}35`, color: c }}>
                  {u.role}
                </span>
              </div>
            );
          })}
        </div>
      );

      /* ── Disputes ── */
      case "disputes": return (
        <div className="space-y-4">
          {disputes.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500">
              <p className="text-4xl mb-2">⚖️</p><p>No disputes raised.</p>
            </div>
          )}
          {disputes.map((d) => (
            <div key={d.disputeId} className="glass-card p-5"
              style={{ borderColor: d.status === "resolved" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">Rental: {d.rentalId}</p>
                  <p className="text-slate-400 text-xs">{d.raisedBy} · {d.raisedByEmail}</p>
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ background: d.status === "resolved" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)", color: d.status === "resolved" ? "#4ade80" : "#f87171", border: `1px solid ${d.status === "resolved" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  {d.status}
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-4">{d.description}</p>
              {d.resolution && <p className="text-green-400 text-xs mb-3">✅ {d.resolution}</p>}
              {d.status !== "resolved" && (
                <div className="flex gap-2">
                  <input className="input-field flex-1 text-sm" placeholder="Resolution note..."
                    value={resolveText[d.disputeId] ?? ""}
                    onChange={(e) => setResolveText((p) => ({ ...p, [d.disputeId]: e.target.value }))} />
                  <button onClick={() => resolveDispute(d.disputeId, resolveText[d.disputeId] ?? "Resolved by admin.")}
                    className="btn-primary text-sm flex-shrink-0" style={{ padding: "10px 16px" }}>
                    Resolve ✓
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      );

      /* ── Payments ── */
      case "payments": return (
        <div className="space-y-3">
          {payments.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500">
              <p className="text-4xl mb-2">💳</p><p>No payments recorded yet.</p>
            </div>
          )}
          {payments.map((p) => {
            const sc = p.paymentStatus === "completed" ? "#22c55e" : p.paymentStatus === "pending" ? "#eab308" : p.paymentStatus === "refunded" ? "#0ea5e9" : "#ef4444";
            return (
              <div key={p.paymentId} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${sc}12`, border: `1px solid ${sc}30` }}>
                  💳
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">Rental: {p.rentalId}</p>
                  <p className="text-slate-400 text-xs">{p.paymentDate} · {p.method.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-black">${p.amount}</p>
                  <span className="text-xs font-bold" style={{ color: sc }}>{p.paymentStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 flex items-center gap-4 px-4 sm:px-6 py-3"
        style={{ background: "rgba(4,13,20,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(234,179,8,0.15)" }}>
        <button onClick={() => router.push("/")} className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}>🔧</div>
          <span className="font-black text-white text-sm hidden sm:block">ToolRent <span className="glow-text">Pro</span></span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)" }}>
          <span>🛡️</span>
          <span className="text-xs font-bold text-yellow-400">Admin Portal</span>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)" }}>
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" style={{ animation: "pulseGlow 1.5s infinite" }} />
            <span className="text-xs text-yellow-400 font-bold">{pending.length} pending</span>
          </div>
        )}
        <div className="flex-1" />
        <div className="text-sm font-bold text-white hidden sm:block">{user.name}</div>
        <button onClick={() => { logout(); router.push("/"); }}
          className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          Logout
        </button>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 py-6 px-3"
          style={{ background: "rgba(4,13,20,0.7)", borderRight: "1px solid rgba(234,179,8,0.08)" }}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Management</p>
          {TABS.map((t) => {
            const badge = t.id === "approvals" ? pending.length : t.id === "disputes" ? openDisputes.length : 0;
            return (
              <button key={t.id} id={`admin-sidebar-${t.id}`} onClick={() => setTab(t.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold text-left transition-all w-full"
                style={{
                  background: tab === t.id ? "rgba(234,179,8,0.12)" : "transparent",
                  color: tab === t.id ? "#facc15" : "#64748b",
                  borderLeft: tab === t.id ? "3px solid #eab308" : "3px solid transparent",
                }}>
                <span>{t.icon}</span>
                <span className="flex-1">{t.label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.8)", color: "white" }}>{badge}</span>
                )}
              </button>
            );
          })}

          <div className="mt-auto px-3">
            <div className="p-3 rounded-xl" style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)" }}>
              <p className="text-xs text-yellow-400 font-bold mb-1">Admin Access</p>
              <p className="text-xs text-slate-500">This page is restricted. Only accessible via direct link.</p>
            </div>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto gap-1 px-2 py-2"
          style={{ background: "rgba(4,13,20,0.96)", borderTop: "1px solid rgba(234,179,8,0.15)" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: tab === t.id ? "rgba(234,179,8,0.15)" : "transparent", color: tab === t.id ? "#facc15" : "#64748b" }}>
              <span>{t.icon}</span>
              <span style={{ fontSize: "9px" }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-8 py-8 pb-24 md:pb-8 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">{TABS.find((t) => t.id === tab)?.icon} {TABS.find((t) => t.id === tab)?.label}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {tab === "overview" && "Platform snapshot — all activity at a glance."}
              {tab === "approvals" && "Review lender tool submissions. Set pricing before they go live in the catalog."}
              {tab === "rentals" && "All rental transactions across all borrowers."}
              {tab === "users" && "All registered users on the platform."}
              {tab === "disputes" && "Manage and resolve borrower/lender disputes."}
              {tab === "payments" && "All payment records across the platform."}
            </p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
