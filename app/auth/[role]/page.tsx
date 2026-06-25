"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth";

const ROLE_META: Record<string, { title: string; icon: string; color: string; bg: string }> = {
  lender:    { title: "Lender",       icon: "🏪", color: "#f97316", bg: "rgba(249,115,22,0.08)" },
  borrower:  { title: "Borrower",     icon: "👷", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  delivery:  { title: "Delivery Boy", icon: "🛵", color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  inspector: { title: "Inspector",    icon: "🔍", color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  admin:     { title: "Admin",        icon: "🛡️", color: "#eab308", bg: "rgba(234,179,8,0.08)" },
};

export default function AuthPage() {
  const params = useParams();
  const role = params.role as UserRole;
  const router = useRouter();
  const { login, register, user } = useAuth();
  const meta = ROLE_META[role] ?? ROLE_META.borrower;

  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect
  useEffect(() => {
    if (user) router.replace(`/${user.role}`);
  }, [user, router]);

  const handleLogin = () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = login(form.email, form.password, role);
      if (res.ok) router.push(`/${role}`);
      else setError(res.error ?? "Login failed.");
      setLoading(false);
    }, 600);
  };

  const handleRegister = () => {
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) { setError("Please fill all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role });
      if (res.ok) router.push(`/${role}`);
      else setError(res.error ?? "Registration failed.");
      setLoading(false);
    }, 600);
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Back */}
      <button onClick={() => router.push("/")} className="absolute top-6 left-6 text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
        ← Back to Roles
      </button>

      {/* Card */}
      <div className="w-full max-w-md">
        {/* Role badge */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
            style={{ background: meta.bg, border: `2px solid ${meta.color}50`, boxShadow: `0 8px 32px ${meta.color}25` }}>
            {meta.icon}
          </div>
          <h1 className="text-3xl font-black text-white mb-1">
            {meta.title} <span className="glow-text">Portal</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {tab === "login" ? `Welcome back! Sign in to your ${meta.title} account.` : `Create your ${meta.title} account to get started.`}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl p-1 mb-6"
          style={{ background: "rgba(8,20,35,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              id={`auth-tab-${t}`}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: tab === t ? `linear-gradient(135deg, ${meta.color}, ${meta.color}bb)` : "transparent",
                color: tab === t ? (role === "admin" ? "#000" : "#fff") : "#64748b",
              }}>
              {t === "login" ? "🔑 Login" : "📝 Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4 glass-card p-6">
          {tab === "register" && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name *</label>
              <input id="auth-name" className="input-field" placeholder="Your full name"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address *</label>
            <input id="auth-email" className="input-field" type="email" placeholder="you@email.com"
              value={form.email} onChange={(e) => set("email", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tab === "login" && handleLogin()} />
          </div>
          {tab === "register" && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone Number *</label>
              <input id="auth-phone" className="input-field" placeholder="+91 9876543210"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password *</label>
            <input id="auth-password" className="input-field" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => set("password", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tab === "login" && handleLogin()} />
          </div>
          {tab === "register" && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm Password *</label>
              <input id="auth-confirm" className="input-field" type="password" placeholder="••••••••"
                value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-300"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
              ⚠️ {error}
            </div>
          )}

          <button id="auth-submit"
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={loading}
            className="btn-primary w-full mt-2"
            style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}bb)` }}>
            {loading ? "Please wait..." : tab === "login" ? `Sign In as ${meta.title}` : `Create ${meta.title} Account`}
          </button>

          {/* Demo hint for login */}
          {tab === "login" && (
            <div className="p-3 rounded-xl mt-2"
              style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
              <p className="text-xs text-slate-400">
                <span className="text-orange-400 font-semibold">Demo: </span>
                {role === "admin" && "admin@toolrent.com / admin123"}
                {role === "lender" && "lender@toolrent.com / lender123"}
                {role === "borrower" && "borrower@toolrent.com / borrow123"}
                {role === "inspector" && "inspector@toolrent.com / inspect123"}
                {role === "delivery" && "delivery@toolrent.com / deliver123"}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
            className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            {tab === "login" ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}
