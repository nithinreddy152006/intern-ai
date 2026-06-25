"use client";
import { useState } from "react";
import { Tool } from "@/lib/data";
import { useRentalStore, RentalForm } from "@/lib/store";

const STEPS = ["Details", "Confirm", "Success"];

export default function RentModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const { rentTool } = useRentalStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RentalForm>({
    userName: "",
    userEmail: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
  });
  const [rental, setRental] = useState<ReturnType<typeof rentTool> | null>(null);
  const [errors, setErrors] = useState<Partial<RentalForm>>({});

  const days = Math.max(1, Math.ceil(
    (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000
  ));
  const cost = days >= 7
    ? Math.floor(days / 7) * tool.weeklyRate + (days % 7) * tool.dailyRate
    : days * tool.dailyRate;

  const validate = () => {
    const e: Partial<RentalForm> = {};
    if (!form.userName.trim()) e.userName = "Name is required";
    if (!form.userEmail.includes("@")) e.userEmail = "Valid email required";
    if (new Date(form.endDate) <= new Date(form.startDate)) e.endDate = "End date must be after start";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validate()) return;
    if (step === 1) {
      const r = rentTool(tool.id, form);
      setRental(r);
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(249,115,22,0.15)" }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tool.icon}</span>
            <div>
              <h3 className="font-bold text-white">{tool.name}</h3>
              <p className="text-xs text-slate-400">${tool.dailyRate}/day · ${tool.weeklyRate}/week</p>
            </div>
          </div>
          <button onClick={onClose} id="modal-close" className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-5 flex items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`step-dot ${i < step ? "step-dot-done" : i === step ? "step-dot-active" : "step-dot-pending"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-sm font-medium" style={{ color: i === step ? "#fb923c" : i < step ? "#4ade80" : "#475569" }}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px" style={{ background: i < step ? "rgba(34,197,94,0.4)" : "rgba(249,115,22,0.15)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="p-6">
          {/* ── Step 0: Fill details ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Your Name</label>
                <input id="form-name" className="input-field" placeholder="Full name"
                  value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} />
                {errors.userName && <p className="text-red-400 text-xs mt-1">{errors.userName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input id="form-email" className="input-field" type="email" placeholder="you@email.com"
                  value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} />
                {errors.userEmail && <p className="text-red-400 text-xs mt-1">{errors.userEmail}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Start Date</label>
                  <input id="form-start" className="input-field" type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">End Date</label>
                  <input id="form-end" className="input-field" type="date"
                    min={form.startDate}
                    value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {/* Cost preview */}
              <div className="p-4 rounded-xl" style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-slate-200 font-semibold">{days} day{days !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Rate</span>
                  <span className="text-slate-200 font-semibold">${tool.dailyRate}/day</span>
                </div>
                <div className="divider my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-200 font-bold">Estimated Total</span>
                  <span className="text-orange-400 font-black text-lg">${cost}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Confirm ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-lg">Confirm Your Rental</h4>
              {[
                { label: "Renter", value: form.userName },
                { label: "Email", value: form.userEmail },
                { label: "Start Date", value: form.startDate },
                { label: "End Date", value: form.endDate },
                { label: "Duration", value: `${days} day${days !== 1 ? "s" : ""}` },
                { label: "Total Cost", value: `$${cost}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b" style={{ borderColor: "rgba(249,115,22,0.08)" }}>
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-white font-semibold text-sm">{value}</span>
                </div>
              ))}

              {/* Activity diagram mini-flow */}
              <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
                <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">📊 Rental Flow (Activity Diagram)</p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {["Browse", "Select", "Book →", "Payment", "Confirm", "Rented"].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${i <= 4 ? "text-sky-300" : "text-orange-300"}`}
                        style={{ background: i <= 4 ? "rgba(14,165,233,0.1)" : "rgba(249,115,22,0.1)", border: `1px solid ${i <= 4 ? "rgba(14,165,233,0.25)" : "rgba(249,115,22,0.3)"}` }}>
                        {s.replace(" →", "")}
                      </span>
                      {i < 5 && <span className="text-slate-600 text-xs">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Success ── */}
          {step === 2 && rental && (
            <div className="text-center py-4">
              <div className="text-6xl mb-4" style={{ animation: "float 2s ease-in-out infinite" }}>🎉</div>
              <h4 className="text-2xl font-black text-white mb-2">Rental Confirmed!</h4>
              <p className="text-slate-400 mb-5">
                <strong className="text-orange-400">{tool.name}</strong> is reserved for you.
              </p>
              <div className="p-4 rounded-xl mb-6 text-left" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
                <p className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">✅ Booking Summary</p>
                <p className="text-slate-300 text-sm">Rental ID: <span className="mono text-orange-300">{rental.id}</span></p>
                <p className="text-slate-300 text-sm">{form.startDate} → {form.endDate}</p>
                <p className="text-slate-300 text-sm font-bold">Total: ${rental.totalCost}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button id="modal-success-close" onClick={onClose} className="btn-primary">Done</button>
                <button onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" }) || onClose()} className="btn-secondary text-sm">
                  View My Rentals
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 2 && (
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button id="modal-back" onClick={() => setStep((s) => s - 1)} className="btn-ghost flex-1">
                  ← Back
                </button>
              )}
              <button id="modal-next" onClick={handleNext} className="btn-primary flex-1">
                {step === 0 ? "Review Rental →" : "Confirm & Book 🔒"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
