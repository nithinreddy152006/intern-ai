"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "lender" | "borrower" | "admin" | "inspector" | "delivery";

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthCtx {
  user: AuthUser | null;
  users: AuthUser[];
  login: (email: string, password: string, role: UserRole) => { ok: boolean; error?: string };
  register: (data: { name: string; email: string; phone: string; password: string; role: UserRole }) => { ok: boolean; error?: string };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

// Seed demo accounts
const SEED_USERS: (AuthUser & { password: string })[] = [
  { userId: "u_admin1", name: "Admin User", email: "admin@toolrent.com", phone: "9000000001", role: "admin", password: "admin123" },
  { userId: "u_lender1", name: "Vikram Nair", email: "lender@toolrent.com", phone: "9876543210", role: "lender", password: "lender123" },
  { userId: "u_borrower1", name: "Arjun Sharma", email: "borrower@toolrent.com", phone: "9111222333", role: "borrower", password: "borrow123" },
  { userId: "u_inspector1", name: "Ravi Inspector", email: "inspector@toolrent.com", phone: "9444555666", role: "inspector", password: "inspect123" },
  { userId: "u_delivery1", name: "Ramu Delivery", email: "delivery@toolrent.com", phone: "9000111222", role: "delivery", password: "deliver123" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [db, setDb] = useState<(AuthUser & { password: string })[]>(SEED_USERS);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("toolrent_user");
      if (savedUser) setUser(JSON.parse(savedUser));
      
      const savedDb = localStorage.getItem("toolrent_db");
      if (savedDb) setDb(JSON.parse(savedDb));
    } catch { /* ignore */ }
  }, []);

  const login = (email: string, password: string, role: UserRole) => {
    const found = db.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role
    );
    if (!found) return { ok: false, error: "Invalid email or password for this role." };
    const { password: _p, ...authUser } = found;
    setUser(authUser);
    localStorage.setItem("toolrent_user", JSON.stringify(authUser));
    return { ok: true };
  };

  const register = (data: { name: string; email: string; phone: string; password: string; role: UserRole }) => {
    if (db.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "Email already registered. Please login." };
    }
    const newUser = { userId: `u_${Date.now()}`, ...data };
    
    // Update DB and persist
    const newDb = [...db, newUser];
    setDb(newDb);
    localStorage.setItem("toolrent_db", JSON.stringify(newDb));

    // Auto-login
    const { password: _p, ...authUser } = newUser;
    setUser(authUser);
    localStorage.setItem("toolrent_user", JSON.stringify(authUser));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("toolrent_user");
  };

  return (
    <Ctx.Provider value={{ user, users: db.map(({ password: _p, ...u }) => u), login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
