"use client";
import { useRentalStore } from "@/lib/store";

const stats = [
  { label: "Tools Available", key: "available", color: "#22c55e", icon: "✅" },
  { label: "Currently Rented", key: "rented", color: "#ef4444", icon: "🔑" },
  { label: "Reserved", key: "reserved", color: "#eab308", icon: "📅" },
  { label: "In Maintenance", key: "maintenance", color: "#a855f7", icon: "🔧" },
];

export default function Hero() {
  const { tools } = useRentalStore();
  const counts = {
    available: tools.filter((t) => t.status === "available").length,
    rented: tools.filter((t) => t.status === "rented").length,
    reserved: tools.filter((t) => t.status === "reserved").length,
    maintenance: tools.filter((t) => t.status === "maintenance").length,
  };

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center pt-20 pb-12 px-4">
      {/* Floating tool icons */}
      {["🔨","⚙️","🔩","⚡","💧","📏"].map((icon, i) => (
        <div key={i} className="absolute pointer-events-none select-none text-2xl opacity-10"
          style={{
            top: `${10 + i * 13}%`,
            left: i % 2 === 0 ? `${3 + i * 2}%` : `${88 - i * 2}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
          }}>
          {icon}
        </div>
      ))}

      <div className="pill mb-6 slide-up stagger-1">
        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
        Professional Equipment Rental Platform
      </div>

      <h1 className="slide-up stagger-2 text-5xl sm:text-6xl lg:text-7xl font-black mb-5 leading-tight max-w-4xl">
        Rent Any <span className="glow-text">Tool</span><br />
        <span className="text-slate-300 text-4xl sm:text-5xl">For Any Job</span>
      </h1>

      <p className="slide-up stagger-3 text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
        Browse our catalog of professional tools and equipment. Book online, track your rental,
        and return when done — all managed through a simple, visual workflow.
      </p>

      <div className="slide-up stagger-4 flex flex-wrap gap-4 justify-center mb-14">
        <button id="hero-browse-btn" onClick={() => go("catalog")} className="btn-primary" style={{ padding: "14px 36px", fontSize: "15px" }}>
          Browse All Tools 🔍
        </button>
        <button id="hero-diagram-btn" onClick={() => go("how-it-works")} className="btn-secondary" style={{ padding: "14px 32px", fontSize: "15px" }}>
          How It Works
        </button>
      </div>

      {/* Live Stats */}
      <div className="slide-up stagger-5 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
        {stats.map((s) => (
          <div key={s.key} id={`hero-stat-${s.key}`} className="glass-card p-5 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>
              {counts[s.key as keyof typeof counts]}
            </div>
            <div className="text-xs text-slate-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50" style={{ animation: "float 2s ease-in-out infinite" }}>
        <span className="text-xs text-slate-500">Scroll to explore</span>
        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
