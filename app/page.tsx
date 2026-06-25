"use client";
import { useRouter } from "next/navigation";

const ROLES = [
  {
    id: "lender",
    title: "Lender",
    subtitle: "Tool Owner",
    icon: "🏪",
    color: "#f97316",
    glow: "rgba(249,115,22,0.35)",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.3)",
    desc: "List your tools for rent, manage incoming requests, track your earnings and approvals.",
    features: ["List tools with photos", "Approve / reject requests", "Track earnings", "Manage your listings"],
  },
  {
    id: "borrower",
    title: "Borrower",
    subtitle: "Tool Renter",
    icon: "👷",
    color: "#0ea5e9",
    glow: "rgba(14,165,233,0.35)",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.3)",
    desc: "Browse and rent tools for your projects. Track deliveries, returns, and raise disputes.",
    features: ["Browse all available tools", "Book & pay online", "Track rental status", "Raise disputes"],
  },
  {
    id: "delivery",
    title: "Delivery Boy",
    subtitle: "Gig Worker",
    icon: "🛵",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.35)",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
    desc: "Handle tool pickups and deliveries. Manage your assigned jobs and update delivery status.",
    features: ["View assigned deliveries", "Update pickup status", "Mark as delivered", "Handle returns"],
  },
  {
    id: "inspector",
    title: "Inspector",
    subtitle: "Quality Checker",
    icon: "🔍",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.35)",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.3)",
    desc: "Inspect returned tools for damage. Mark condition and raise damage fees when needed.",
    features: ["Inspect returned tools", "Mark condition status", "Set damage fees", "View inspection history"],
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}>🔧</div>
          <div>
            <div className="font-black text-white text-base leading-none">ToolRent <span className="glow-text">Pro</span></div>
            <div className="text-xs text-slate-500">Equipment Rental Platform</div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center px-4 pt-10 pb-12">
        <div className="pill inline-flex mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
          Select your role to get started
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
          Who Are <span className="glow-text">You?</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          ToolRent Pro has a dedicated portal for every role. Pick yours below to login or create an account.
        </p>
      </div>

      {/* Role Cards — 2×2 grid */}
      <div className="flex-1 px-4 pb-16 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ROLES.map((role) => (
            <div
              key={role.id}
              id={`role-card-${role.id}`}
              className="rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col"
              style={{ background: role.bg, border: `1px solid ${role.border}`, minHeight: 260 }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 16px 48px ${role.glow}`;
                el.style.transform = "translateY(-5px)";
                el.style.borderColor = role.color;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "none";
                el.style.transform = "none";
                el.style.borderColor = role.border;
              }}
              onClick={() => router.push(`/auth/${role.id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `${role.color}18`, border: `1px solid ${role.border}` }}>
                  {role.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">{role.title}</h3>
                  <span className="text-xs font-semibold" style={{ color: role.color }}>{role.subtitle}</span>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{role.desc}</p>

              <ul className="space-y-1.5 mb-5">
                {role.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-sm flex-shrink-0" style={{ color: role.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button className="w-full py-3 rounded-xl font-bold text-sm transition-all text-white"
                style={{ background: `linear-gradient(135deg, ${role.color}dd, ${role.color}99)` }}>
                Enter as {role.title} →
              </button>
            </div>
          ))}
        </div>

        {/* Demo credentials */}
        <div className="mt-8 text-center">
          <div className="inline-block p-4 rounded-2xl"
            style={{ background: "rgba(8,20,35,0.7)", border: "1px solid rgba(249,115,22,0.12)" }}>
            <p className="text-xs text-slate-400 mb-2 font-semibold">🔑 Demo Credentials</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-slate-500">
              <span><span className="text-orange-400 font-semibold">Lender:</span> lender@toolrent.com / lender123</span>
              <span><span className="text-sky-400 font-semibold">Borrower:</span> borrower@toolrent.com / borrow123</span>
              <span><span className="text-green-400 font-semibold">Delivery:</span> delivery@toolrent.com / deliver123</span>
              <span><span className="text-purple-400 font-semibold">Inspector:</span> inspector@toolrent.com / inspect123</span>
            </div>
          </div>
        </div>

        {/* Hidden Admin access — subtle link at the very bottom */}
        <div className="mt-10 text-center">
          <button
            id="admin-access-link"
            onClick={() => router.push("/auth/admin")}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-300"
            style={{ letterSpacing: "0.05em" }}
          >
            ⚙ Platform Administration
          </button>
        </div>
      </div>
    </div>
  );
}
