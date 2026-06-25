"use client";

export default function Footer() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer style={{ background: "rgba(4,13,20,0.98)", borderTop: "1px solid rgba(249,115,22,0.1)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}>🔧</div>
              <div>
                <div className="font-black text-white">ToolRent <span className="glow-text">Pro</span></div>
                <div className="text-xs text-slate-500">Equipment Rental System</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Professional tool and equipment rental management. Browse, book, and track rentals across all roles — Lender, Borrower, Admin, Inspector, and Gig Worker.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <div className="space-y-2">
              {[
                { id: "catalog", label: "🔍 Browse Tools" },
                { id: "how-it-works", label: "📖 How It Works" },
                { id: "portals", label: "👥 Role Portals" },
                { id: "dashboard", label: "📋 My Rentals" },
              ].map((l) => (
                <button key={l.id} onClick={() => go(l.id)} id={`footer-${l.id}`}
                  className="block text-slate-400 text-sm hover:text-orange-400 transition-colors text-left">
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Role Portals</h4>
            <div className="space-y-2">
              {[
                { emoji: "🏪", label: "Lender – List & manage tools" },
                { emoji: "🛡️", label: "Admin – Approve listings & disputes" },
                { emoji: "🔍", label: "Inspector – Tool condition checks" },
                { emoji: "🛵", label: "Gig Worker – Pickup & deliveries" },
              ].map((d) => (
                <button key={d.label} onClick={() => go("portals")}
                  className="block text-slate-400 text-sm hover:text-orange-400 transition-colors text-left">
                  {d.emoji} {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm">ToolRent Pro · Full-Stack Equipment Rental Management System</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" style={{ boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
            <span className="text-slate-400 text-sm">Running on localhost:3000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
