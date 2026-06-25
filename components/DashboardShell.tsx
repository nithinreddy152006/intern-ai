"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth";

const META: Record<UserRole, { color: string; icon: string; label: string }> = {
  lender:    { color: "#f97316", icon: "🏪", label: "Lender" },
  borrower:  { color: "#0ea5e9", icon: "👷", label: "Borrower" },
  delivery:  { color: "#22c55e", icon: "🛵", label: "Delivery" },
  inspector: { color: "#a855f7", icon: "🔍", label: "Inspector" },
  admin:     { color: "#eab308", icon: "🛡️", label: "Admin" },
};

export default function DashboardShell({
  children,
  title,
  subtitle,
  requiredRole,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  requiredRole: UserRole;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const meta = META[requiredRole];

  useEffect(() => {
    if (!user) { router.replace(`/auth/${requiredRole}`); return; }
    if (user.role !== requiredRole) { router.replace(`/${user.role}`); }
  }, [user, requiredRole, router]);

  if (!user || user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <nav className="sticky top-0 z-50"
        style={{ background: "rgba(4,13,20,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${meta.color}18` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Logo */}
          <button onClick={() => router.push("/")} className="flex items-center gap-2 mr-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}>🔧</div>
            <span className="font-black text-white text-sm hidden sm:block">ToolRent <span className="glow-text">Pro</span></span>
          </button>

          {/* Role badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0"
            style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}35` }}>
            <span className="text-base">{meta.icon}</span>
            <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label} Portal</span>
          </div>

          <div className="flex-1" />

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white">{user.name}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: `${meta.color}25`, border: `1px solid ${meta.color}40`, color: meta.color }}>
              {user.name[0].toUpperCase()}
            </div>
            <button onClick={() => { logout(); router.push("/"); }} id="logout-btn"
              className="text-xs px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors flex-shrink-0"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-1">
          {title}
        </h1>
        <p className="text-slate-400">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
