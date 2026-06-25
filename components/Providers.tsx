"use client";
import { AuthProvider } from "@/lib/auth";
import { RentalProvider } from "@/lib/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RentalProvider>
        <div className="mesh-bg" />
        {children}
      </RentalProvider>
    </AuthProvider>
  );
}
