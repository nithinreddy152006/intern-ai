"use client";
import { useState, useEffect } from "react";

const links = [
  { href: "#catalog", label: "Browse Tools" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#portals", label: "Role Portals" },
  { href: "#dashboard", label: "My Rentals" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(4,13,20,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(249,115,22,0.12)" : "none",
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => go("#hero")} className="flex items-center gap-2.5" id="nav-logo">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}>🔧</div>
            <div className="text-left hidden sm:block">
              <div className="font-black text-white text-base leading-none">ToolRent <span className="glow-text">Pro</span></div>
              <div className="text-xs text-slate-500 font-medium">Equipment Rental</div>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button key={l.href} onClick={() => go(l.href)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-orange-400 hover:bg-orange-400/8 transition-all duration-200">
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => go("#catalog")} id="nav-rent-btn" className="btn-primary hidden sm:block"
              style={{ padding: "9px 20px", fontSize: "13px" }}>
              Rent a Tool 🔧
            </button>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400 hover:text-white" id="nav-mobile-toggle">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-orange-500/10">
            {links.map((l) => (
              <button key={l.href} onClick={() => go(l.href)}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-orange-400 transition-all">
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
