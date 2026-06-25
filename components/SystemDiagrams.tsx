"use client";
import { useState } from "react";

/* ── Activity Diagram: Rental Flow ─────────────────────────── */
function ActivityDiagram() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px] p-6">
        {/* Swimlane: USER */}
        <div className="swim-lane mb-4">
          <div className="swim-header">🧑 Customer</div>
          <div className="p-4 flex items-center gap-3 flex-wrap">
            {/* Initial node */}
            <div className="flex flex-col items-center gap-1">
              <div className="uml-initial" />
              <span className="text-xs text-slate-500">Start</span>
            </div>
            <span className="uml-arrow">→</span>
            <div className="uml-action">Browse Tool Catalog</div>
            <span className="uml-arrow">→</span>
            <div className="uml-action">Select Tool</div>
            <span className="uml-arrow">→</span>
            <div className="uml-action">Fill Rental Form</div>
            <span className="uml-arrow">→</span>
            {/* Decision */}
            <div className="flex flex-col items-center gap-1 relative">
              <div className="uml-decision" />
              <span className="text-xs text-yellow-400 absolute -bottom-6 whitespace-nowrap">Tool Available?</span>
            </div>
          </div>
        </div>

        {/* Decision branch (Yes/No) */}
        <div className="grid grid-cols-2 gap-4 mb-4 pl-6">
          <div className="p-3 rounded-xl" style={{ border: "1px dashed rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.03)" }}>
            <div className="text-xs font-bold text-green-400 mb-2">✅ Yes — Available</div>
            <div className="flex items-center gap-2">
              <div className="uml-action">Confirm Reservation</div>
              <span className="uml-arrow">→</span>
              <div className="uml-action">Process Payment</div>
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ border: "1px dashed rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.03)" }}>
            <div className="text-xs font-bold text-red-400 mb-2">❌ No — Not Available</div>
            <div className="flex items-center gap-2">
              <div className="uml-action">Show Availability Date</div>
              <span className="uml-arrow">→</span>
              <div className="uml-action">Return to Catalog</div>
            </div>
          </div>
        </div>

        {/* Swimlane: SYSTEM */}
        <div className="swim-lane">
          <div className="swim-header" style={{ color: "#38bdf8", borderColor: "rgba(14,165,233,0.2)", background: "rgba(14,165,233,0.06)" }}>🖥️ System</div>
          <div className="p-4 flex items-center gap-3 flex-wrap">
            <div className="uml-action" style={{ borderColor: "rgba(34,197,94,0.4)", color: "#86efac", background: "rgba(34,197,94,0.08)" }}>
              Update Tool Status → Rented
            </div>
            <span className="uml-arrow">→</span>
            <div className="uml-action" style={{ borderColor: "rgba(34,197,94,0.4)", color: "#86efac", background: "rgba(34,197,94,0.08)" }}>
              Generate Rental Record
            </div>
            <span className="uml-arrow">→</span>
            <div className="uml-action" style={{ borderColor: "rgba(34,197,94,0.4)", color: "#86efac", background: "rgba(34,197,94,0.08)" }}>
              Send Confirmation Email
            </div>
            <span className="uml-arrow">→</span>
            <div className="uml-action">Tool In Use</div>
            <span className="uml-arrow">→</span>
            <div className="uml-action">Return Processed</div>
            <span className="uml-arrow">→</span>
            <div className="flex flex-col items-center gap-1">
              <div className="uml-final"><div className="uml-final-inner" /></div>
              <span className="text-xs text-slate-500">End</span>
            </div>
          </div>
        </div>

        {/* Fork/Join note */}
        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <p className="text-xs text-green-400 font-bold mb-1">⚡ Fork / Join (Parallel)</p>
          <div className="flex items-center gap-3">
            <div className="uml-fork w-32" />
            <div className="flex gap-2">
              <div className="uml-action text-xs py-1 px-3">Update Inventory DB</div>
              <div className="uml-action text-xs py-1 px-3">Notify Admin</div>
            </div>
            <div className="uml-fork w-16" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Both actions execute in parallel after booking is confirmed.</p>
        </div>
      </div>
    </div>
  );
}

/* ── State Chart: Tool Lifecycle ────────────────────────────── */
function StateChart() {
  const [active, setActive] = useState<string | null>(null);

  const states = [
    { id: "available", label: "Available", color: "#22c55e", note: "Tool is in depot, ready to rent." },
    { id: "reserved", label: "Reserved", color: "#eab308", note: "Customer has booked — awaiting pickup." },
    { id: "rented", label: "Rented Out", color: "#ef4444", note: "Tool is with the customer on-site." },
    { id: "maintenance", label: "Maintenance", color: "#a855f7", note: "Tool is being serviced or repaired." },
    { id: "returned", label: "Returned", color: "#0ea5e9", note: "Customer returned the tool for inspection." },
  ];

  const transitions = [
    { from: "Available", to: "Reserved", label: "Customer Books" },
    { from: "Reserved", to: "Rented Out", label: "Customer Picks Up" },
    { from: "Rented Out", to: "Returned", label: "Customer Returns" },
    { from: "Returned", to: "Available", label: "Inspection Passed" },
    { from: "Returned", to: "Maintenance", label: "Damage Found" },
    { from: "Maintenance", to: "Available", label: "Repair Complete" },
    { from: "Reserved", to: "Available", label: "Booking Cancelled" },
  ];

  return (
    <div className="p-6">
      <p className="text-xs text-slate-400 mb-5">Click a state to see its description. Arrows show transitions (events that move a tool between states).</p>
      
      {/* States */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {states.map((s) => (
          <div
            key={s.id}
            id={`state-${s.id}`}
            className="state-node"
            style={{
              borderColor: s.color,
              color: s.color,
              background: active === s.id ? `${s.color}18` : "rgba(8,20,35,0.8)",
              boxShadow: active === s.id ? `0 0 20px ${s.color}30` : "none",
            }}
            onClick={() => setActive(active === s.id ? null : s.id)}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Active state description */}
      {active && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)" }}>
          <p className="text-orange-300 font-semibold text-sm">
            📌 {states.find((s) => s.id === active)?.note}
          </p>
        </div>
      )}

      {/* Transitions table */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">State Transitions</p>
        {transitions.map((t, i) => (
          <div key={i} id={`transition-${i}`}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: "rgba(8,20,35,0.5)", border: "1px solid rgba(249,115,22,0.08)" }}
          >
            <span className="text-xs font-semibold text-sky-400 min-w-[100px]">{t.from}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: "rgba(249,115,22,0.25)" }} />
              <span className="text-xs text-orange-400 font-medium px-2">[{t.label}]</span>
              <div className="flex-1 h-px" style={{ background: "rgba(249,115,22,0.25)" }} />
              <span className="text-orange-500 text-xs">▶</span>
            </div>
            <span className="text-xs font-semibold text-sky-400 min-w-[100px] text-right">{t.to}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sequence Diagram: Rental Interaction ───────────────────── */
function SequenceDiagram() {
  const actors = ["Customer", "Web App", "Rental System", "Database"];
  const messages = [
    { from: 0, to: 1, label: "Search for tools", type: "req" },
    { from: 1, to: 2, label: "GET /tools?status=available", type: "req" },
    { from: 2, to: 3, label: "SELECT * FROM tools WHERE status='available'", type: "req" },
    { from: 3, to: 2, label: "Return tool list", type: "res" },
    { from: 2, to: 1, label: "Tool catalog data", type: "res" },
    { from: 1, to: 0, label: "Display tools", type: "res" },
    { from: 0, to: 1, label: "Submit rental form (tool_id, dates, user)", type: "req" },
    { from: 1, to: 2, label: "POST /rentals", type: "req" },
    { from: 2, to: 3, label: "Check tool availability", type: "req" },
    { from: 3, to: 2, label: "Available: true", type: "res" },
    { from: 2, to: 3, label: "INSERT rental + UPDATE tool status='rented'", type: "req" },
    { from: 3, to: 2, label: "Success + rental_id", type: "res" },
    { from: 2, to: 1, label: "Rental confirmed {rental_id, cost}", type: "res" },
    { from: 1, to: 0, label: "Show confirmation screen", type: "res" },
  ];

  const colors = ["#f97316", "#0ea5e9", "#a855f7", "#22c55e"];
  const W = 160; // actor column width
  const total = actors.length;
  const svgW = total * W + 40;
  const rowH = 38;
  const svgH = messages.length * rowH + 80;

  return (
    <div className="overflow-x-auto p-4">
      <svg width={svgW} height={svgH} style={{ minWidth: svgW }}>
        {/* Actor boxes */}
        {actors.map((a, i) => {
          const cx = 20 + i * W + W / 2;
          return (
            <g key={i}>
              <rect x={cx - 55} y={10} width={110} height={34} rx={8}
                fill={`${colors[i]}18`} stroke={colors[i]} strokeWidth={1.5} strokeOpacity={0.6} />
              <text x={cx} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill={colors[i]}>{a}</text>
              {/* Lifeline */}
              <line x1={cx} y1={44} x2={cx} y2={svgH - 10} stroke={colors[i]} strokeWidth={1} strokeOpacity={0.25} strokeDasharray="4,4" />
            </g>
          );
        })}

        {/* Messages */}
        {messages.map((m, idx) => {
          const y = 44 + idx * rowH + rowH / 2;
          const x1 = 20 + m.from * W + W / 2;
          const x2 = 20 + m.to * W + W / 2;
          const isRes = m.type === "res";
          const mid = (x1 + x2) / 2;
          const arrowDir = x2 > x1 ? 1 : -1;
          const col = isRes ? "#38bdf8" : "#fb923c";
          return (
            <g key={idx}>
              {/* Arrow line */}
              <line x1={x1} y1={y} x2={x2 - arrowDir * 6} y2={y}
                stroke={col} strokeWidth={isRes ? 1 : 1.5}
                strokeDasharray={isRes ? "5,3" : "0"} strokeOpacity={0.85} />
              {/* Arrowhead */}
              <polygon
                points={`${x2},${y} ${x2 - arrowDir * 8},${y - 4} ${x2 - arrowDir * 8},${y + 4}`}
                fill={col} opacity={0.85}
              />
              {/* Label */}
              <rect x={mid - 70} y={y - 14} width={140} height={14} rx={3} fill="rgba(4,13,20,0.7)" />
              <text x={mid} y={y - 3} textAnchor="middle" fontSize={9} fill={col} fontFamily="JetBrains Mono, monospace">
                {m.label.length > 28 ? m.label.slice(0, 27) + "…" : m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-6 mt-3">
        <div className="flex items-center gap-2"><div className="w-8 h-px" style={{ background: "#fb923c", height: 2 }} /><span className="text-xs text-slate-400">Request</span></div>
        <div className="flex items-center gap-2"><div className="w-8" style={{ borderTop: "2px dashed #38bdf8" }} /><span className="text-xs text-slate-400">Response</span></div>
      </div>
    </div>
  );
}

/* ── Main Section ────────────────────────────────────────────── */
const TABS = [
  { id: "activity", label: "Activity Diagram", icon: "🌊", subtitle: "Rental booking flow" },
  { id: "state", label: "State Chart", icon: "🔄", subtitle: "Tool lifecycle states" },
  { id: "sequence", label: "Sequence Diagram", icon: "⏱️", subtitle: "System interactions" },
];

export default function SystemDiagrams() {
  const [tab, setTab] = useState("activity");

  return (
    <section id="diagrams" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="pill pill-blue inline-flex mb-4">📊 UML System Diagrams</div>
          <h2 className="text-4xl font-black text-white mb-3">
            How the System <span className="glow-text-blue">Works</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            These UML diagrams model the Tool Rental System — showing the booking flow, tool states, and component interactions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 p-1.5 rounded-2xl glass-card-flat">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`diagram-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: tab === t.id ? "linear-gradient(135deg,rgba(14,165,233,0.2),rgba(14,165,233,0.1))" : "transparent",
                border: tab === t.id ? "1px solid rgba(14,165,233,0.35)" : "1px solid transparent",
                color: tab === t.id ? "#38bdf8" : "#64748b",
                boxShadow: tab === t.id ? "0 4px 20px rgba(14,165,233,0.12)" : "none",
              }}
            >
              <span>{t.icon}</span>
              <div className="text-left">
                <div>{t.label}</div>
                <div className="text-xs opacity-60 hidden sm:block">{t.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Diagram panel */}
        <div className="diagram-panel">
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid rgba(14,165,233,0.12)", background: "rgba(14,165,233,0.04)" }}>
            <span className="text-xl">{TABS.find((t) => t.id === tab)?.icon}</span>
            <div>
              <h3 className="font-bold text-white text-base">{TABS.find((t) => t.id === tab)?.label}</h3>
              <p className="text-xs text-slate-400">{TABS.find((t) => t.id === tab)?.subtitle}</p>
            </div>
          </div>
          {tab === "activity" && <ActivityDiagram />}
          {tab === "state" && <StateChart />}
          {tab === "sequence" && <SequenceDiagram />}
        </div>

        {/* Legend strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "●", color: "#f97316", label: "Initial Node", desc: "Start of flow" },
            { icon: "◇", color: "#eab308", label: "Decision Node", desc: "Branch / condition" },
            { icon: "═", color: "#22c55e", label: "Fork / Join", desc: "Parallel execution" },
            { icon: "⊙", color: "#ef4444", label: "Final Node", desc: "End of flow" },
          ].map((item) => (
            <div key={item.label} className="glass-card p-3 flex items-center gap-3">
              <span className="text-lg" style={{ color: item.color }}>{item.icon}</span>
              <div>
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
