"use client";
import { useState } from "react";
import { useRentalStore, InspectionForm } from "@/lib/store";
import { Rental, ConditionStatus } from "@/lib/data";

const CONDITION_OPTS: { val: ConditionStatus; label: string; color: string; icon: string }[] = [
  { val: "good", label: "Good – No damage", color: "#22c55e", icon: "✅" },
  { val: "minor_wear", label: "Minor Wear", color: "#eab308", icon: "⚠️" },
  { val: "damaged", label: "Damaged", color: "#ef4444", icon: "❌" },
];

function InspectForm({ rental, inspectorName, onDone }: {
  rental: Rental;
  inspectorName: string;
  onDone: () => void;
}) {
  const { inspectTool } = useRentalStore();
  const [condition, setCondition] = useState<ConditionStatus>("good");
  const [fee, setFee] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!notes.trim()) return;
    const form: InspectionForm = {
      rentalId: rental.id,
      toolId: rental.toolId,
      toolName: rental.toolName,
      inspectorName,
      conditionStatus: condition,
      damageFee: condition === "good" ? 0 : fee,
      notes,
    };
    inspectTool(form);
    setSubmitted(true);
    setTimeout(onDone, 1500);
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-400 font-bold">Inspection recorded!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5 rounded-2xl"
      style={{ background: "rgba(8,20,35,0.7)", border: "1px solid rgba(14,165,233,0.2)" }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{rental.toolIcon}</span>
        <div>
          <p className="font-bold text-white text-sm">{rental.toolName}</p>
          <p className="text-slate-400 text-xs">Rental #{rental.id} · {rental.userName}</p>
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Condition Status *</label>
        <div className="grid grid-cols-3 gap-2">
          {CONDITION_OPTS.map((opt) => (
            <button key={opt.val} id={`cond-${opt.val}`}
              onClick={() => { setCondition(opt.val); if (opt.val === "good") setFee(0); }}
              className="p-3 rounded-xl text-center text-xs font-bold transition-all"
              style={{
                background: condition === opt.val ? `${opt.color}20` : "rgba(8,20,35,0.6)",
                border: `2px solid ${condition === opt.val ? opt.color : "rgba(255,255,255,0.08)"}`,
                color: condition === opt.val ? opt.color : "#64748b",
              }}>
              <div className="text-lg mb-1">{opt.icon}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Damage fee */}
      {condition !== "good" && (
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Damage Fee ($)</label>
          <input id="damage-fee" className="input-field" type="number" min={0}
            value={fee} onChange={(e) => setFee(+e.target.value)} />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Inspection Notes *</label>
        <textarea id="inspect-notes" className="input-field" rows={3}
          placeholder="Describe the tool condition in detail..."
          value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button id="inspect-submit" onClick={submit} className="btn-primary w-full" disabled={!notes.trim()}>
        Submit Inspection Report 📋
      </button>
    </div>
  );
}

export default function InspectorPanel() {
  const { rentals, inspections } = useRentalStore();
  const [name, setName] = useState("Ravi Inspector");
  const [inspecting, setInspecting] = useState<string | null>(null);

  // Rentals that need inspection: completed but no inspectionId
  const toInspect = rentals.filter((r) => r.status === "completed" && !r.inspectionId);
  const done = rentals.filter((r) => r.inspectionId);

  return (
    <div>
      {/* Inspector identity */}
      <div className="glass-card p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
          🔍
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Inspector Name</label>
          <input className="input-field text-sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Awaiting Inspection", value: toInspect.length, color: "#eab308", icon: "⏳" },
          { label: "Inspections Done", value: inspections.length, color: "#22c55e", icon: "✅" },
          { label: "Damage Fees Raised", value: inspections.filter((i) => i.damageFee > 0).length, color: "#ef4444", icon: "💸" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* To-inspect queue */}
      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-yellow-400 rounded-full" />
        Needs Inspection ({toInspect.length})
      </h4>

      {toInspect.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-500 mb-6">
          <div className="text-3xl mb-2">✅</div>
          <p>No tools pending inspection right now.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {toInspect.map((r) => (
            <div key={r.id}>
              <div id={`inspect-card-${r.id}`} className="glass-card p-4 flex items-center gap-4">
                <span className="text-2xl">{r.toolIcon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{r.toolName}</p>
                  <p className="text-slate-400 text-xs">Returned by {r.userName} · {r.endDate}</p>
                </div>
                <button id={`start-inspect-${r.id}`}
                  onClick={() => setInspecting(inspecting === r.id ? null : r.id)}
                  className="btn-secondary text-xs" style={{ padding: "8px 16px" }}>
                  {inspecting === r.id ? "▲ Close" : "🔍 Inspect"}
                </button>
              </div>
              {inspecting === r.id && (
                <div className="mt-2">
                  <InspectForm rental={r} inspectorName={name} onDone={() => setInspecting(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed inspections */}
      {inspections.length > 0 && (
        <>
          <h4 className="font-bold text-slate-400 mb-3">Completed Inspections ({inspections.length})</h4>
          <div className="space-y-3">
            {inspections.map((ins) => {
              const cond = CONDITION_OPTS.find((c) => c.val === ins.conditionStatus)!;
              return (
                <div key={ins.inspectionId} id={`insp-done-${ins.inspectionId}`}
                  className="glass-card p-4 flex items-start gap-4"
                  style={{ borderColor: `${cond.color}20` }}>
                  <span className="text-2xl">{cond.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white text-sm">{ins.toolName}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: `${cond.color}15`, border: `1px solid ${cond.color}30`, color: cond.color }}>
                        {cond.label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{ins.notes}</p>
                    {ins.damageFee > 0 && (
                      <p className="text-red-400 text-xs font-bold mt-1">Damage Fee: ${ins.damageFee}</p>
                    )}
                    <p className="text-slate-500 text-xs mt-1">By {ins.inspectorName} · {ins.inspectedAt.slice(0, 10)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
