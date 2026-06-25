"use client";
import { useRentalStore } from "@/lib/store";
import { Rental } from "@/lib/data";

const DELIVERY_STEPS: { key: Rental["deliveryStatus"]; label: string; icon: string; action: string }[] = [
  { key: "pending_pickup", label: "Pending Pickup", icon: "⏳", action: "Pick Up from Lender" },
  { key: "picked_up", label: "Picked Up", icon: "📦", action: "Mark as Picked Up" },
  { key: "delivered", label: "Delivered", icon: "✅", action: "Mark Delivered to Borrower" },
  { key: "return_pickup", label: "Return Pickup", icon: "↩️", action: "Pick Up Return" },
  { key: "returned", label: "Returned to Lender", icon: "🏁", action: "Mark Returned to Lender" },
];

function progressStep(current: Rental["deliveryStatus"]): number {
  const idx = DELIVERY_STEPS.findIndex((s) => s.key === current);
  return idx >= 0 ? idx : 0;
}

function nextStatus(current: Rental["deliveryStatus"]): Rental["deliveryStatus"] {
  const steps = DELIVERY_STEPS.map((s) => s.key);
  const idx = steps.indexOf(current);
  return idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : current;
}

export default function GigWorkerPanel() {
  const { rentals, updateDelivery, gigWorkers } = useRentalStore();

  // Active deliveries (not fully returned)
  const active = rentals.filter(
    (r) => r.status === "active" && r.deliveryStatus !== "returned"
  );
  const completed = rentals.filter(
    (r) => r.deliveryStatus === "returned"
  );

  return (
    <div>
      {/* Gig Worker profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {gigWorkers.map((gw) => (
          <div key={gw.userId} className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)" }}>
              🛵
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">{gw.name}</p>
              <p className="text-slate-400 text-xs">{gw.email} · {gw.phone}</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                background: gw.status === "available" ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)",
                border: `1px solid ${gw.status === "available" ? "rgba(34,197,94,0.35)" : "rgba(234,179,8,0.35)"}`,
                color: gw.status === "available" ? "#4ade80" : "#facc15",
              }}>
              {gw.status === "available" ? "Available" : "On Delivery"}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Deliveries", value: active.length, color: "#f97316", icon: "🚚" },
          { label: "Delivered Today", value: rentals.filter((r) => r.deliveryStatus === "delivered").length, color: "#22c55e", icon: "✅" },
          { label: "Returns Pending", value: rentals.filter((r) => r.deliveryStatus === "return_pickup").length, color: "#eab308", icon: "↩️" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active deliveries */}
      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-orange-400 rounded-full" style={{ boxShadow: "0 0 8px rgba(249,115,22,0.6)" }} />
        Active Deliveries ({active.length})
      </h4>

      {active.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-500 mb-6">
          <div className="text-3xl mb-2">🚚</div>
          <p>No active deliveries right now.</p>
        </div>
      ) : (
        <div className="space-y-5 mb-6">
          {active.map((r) => {
            const stepIdx = progressStep(r.deliveryStatus);
            const pct = (stepIdx / (DELIVERY_STEPS.length - 1)) * 100;
            const next = nextStatus(r.deliveryStatus);
            const nextLabel = DELIVERY_STEPS.find((s) => s.key === next)?.action ?? "";

            return (
              <div key={r.id} id={`delivery-${r.id}`} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{r.toolIcon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{r.toolName}</p>
                    <p className="text-slate-400 text-xs">
                      {r.userName} · {r.startDate} → {r.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-black text-sm">${r.totalCost}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Pickup</span>
                    <span>{Math.round(pct)}% complete</span>
                    <span>Returned</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "rgba(249,115,22,0.1)" }}>
                    <div className="progress-bar rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    {DELIVERY_STEPS.map((s, i) => (
                      <div key={s.key} className="flex flex-col items-center gap-1" style={{ flex: "0 0 auto" }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{
                            background: i <= stepIdx ? "linear-gradient(135deg,#f97316,#c2410c)" : "rgba(249,115,22,0.1)",
                            border: `1px solid ${i <= stepIdx ? "transparent" : "rgba(249,115,22,0.2)"}`,
                          }}>
                          {i <= stepIdx ? "✓" : i + 1}
                        </div>
                        <span className="text-xs text-slate-500 hidden sm:block" style={{ maxWidth: 60, textAlign: "center", fontSize: "9px" }}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current status */}
                <div className="flex items-center justify-between">
                  <div className="pill text-xs" style={{ fontSize: "11px" }}>
                    {DELIVERY_STEPS.find((s) => s.key === r.deliveryStatus)?.icon}{" "}
                    {DELIVERY_STEPS.find((s) => s.key === r.deliveryStatus)?.label}
                  </div>
                  {r.deliveryStatus !== "returned" && (
                    <button id={`advance-delivery-${r.id}`}
                      onClick={() => updateDelivery(r.id, next)}
                      className="btn-primary text-xs" style={{ padding: "8px 16px" }}>
                      {nextLabel} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <h4 className="font-bold text-slate-400 mb-3">Completed Deliveries ({completed.length})</h4>
          <div className="space-y-3">
            {completed.map((r) => (
              <div key={r.id} className="glass-card p-4 flex items-center gap-3"
                style={{ opacity: 0.7 }}>
                <span className="text-xl">{r.toolIcon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{r.toolName}</p>
                  <p className="text-xs text-slate-400">{r.userName} · Returned ✅</p>
                </div>
                <div className="text-green-400 font-bold text-sm">Done</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
