"use client";
import { useRentalStore } from "@/lib/store";
import { Rental } from "@/lib/data";

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  completed: "#0ea5e9",
  cancelled: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

function RentalRow({ rental, onReturn, onCancel }: {
  rental: Rental;
  onReturn: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const color = STATUS_COLORS[rental.status];
  const now = new Date();
  const end = new Date(rental.endDate);
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);

  return (
    <div id={`rental-row-${rental.id}`}
      className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ borderColor: `${color}20` }}
    >
      {/* Tool info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
          {rental.toolIcon}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">{rental.toolName}</h4>
          <p className="text-slate-400 text-xs">{rental.userName} · {rental.userEmail}</p>
          <p className="text-slate-500 text-xs mt-0.5">
            {rental.startDate} → {rental.endDate} &nbsp;·&nbsp; {rental.totalDays} day{rental.totalDays !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-orange-400 font-black text-lg">${rental.totalCost}</div>
          <div className="text-slate-500 text-xs">Total</div>
        </div>
        {rental.status === "active" && daysLeft > 0 && (
          <div className="text-center">
            <div className="font-bold text-yellow-400 text-sm">{daysLeft}d</div>
            <div className="text-slate-500 text-xs">Left</div>
          </div>
        )}
        <div>
          <span className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: `${color}15`, border: `1px solid ${color}35`, color }}>
            {STATUS_LABELS[rental.status]}
          </span>
        </div>
      </div>

      {/* Actions */}
      {rental.status === "active" && (
        <div className="flex gap-2">
          <button id={`return-btn-${rental.id}`} onClick={() => onReturn(rental.id)}
            className="btn-secondary text-xs" style={{ padding: "7px 14px" }}>
            ↩ Return
          </button>
          <button id={`cancel-btn-${rental.id}`} onClick={() => onCancel(rental.id)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function RentalDashboard() {
  const { rentals, returnTool, cancelRental, tools } = useRentalStore();
  const active = rentals.filter((r) => r.status === "active");
  const past = rentals.filter((r) => r.status !== "active");
  const totalSpent = rentals.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.totalCost, 0);
  const available = tools.filter((t) => t.status === "available").length;

  return (
    <section id="dashboard" className="py-20 px-4" style={{ background: "rgba(8,20,35,0.3)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="pill pill-blue inline-flex mb-4">📋 Dashboard</div>
          <h2 className="text-4xl font-black text-white mb-3">My <span className="glow-text">Rentals</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Track your current and past tool rentals. Return tools or manage bookings here.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Rentals", value: active.length, color: "#22c55e", icon: "🔑" },
            { label: "Total Rentals", value: rentals.length, color: "#f97316", icon: "📋" },
            { label: "Total Spent", value: `$${totalSpent}`, color: "#0ea5e9", icon: "💰" },
            { label: "Tools Available", value: available, color: "#a855f7", icon: "✅" },
          ].map((s, i) => (
            <div key={i} id={`dash-stat-${i}`} className="glass-card p-5 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active Rentals */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" style={{ animation: "pulseGlow 2s ease-in-out infinite" }} />
            Active Rentals ({active.length})
          </h3>
          {active.length === 0 ? (
            <div className="glass-card p-10 text-center text-slate-500">
              <div className="text-3xl mb-2">🔍</div>
              <p>No active rentals. Browse tools to get started!</p>
              <button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-primary mt-4 text-sm" style={{ padding: "9px 20px" }}>
                Browse Tools
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map((r) => (
                <RentalRow key={r.id} rental={r} onReturn={returnTool} onCancel={cancelRental} />
              ))}
            </div>
          )}
        </div>

        {/* Past Rentals */}
        {past.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-400 mb-4">Past Rentals ({past.length})</h3>
            <div className="space-y-3">
              {past.map((r) => (
                <RentalRow key={r.id} rental={r} onReturn={returnTool} onCancel={cancelRental} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
