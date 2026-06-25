"use client";
import { useState, useRef, useCallback } from "react";
import { useRentalStore, LenderForm } from "@/lib/store";
import { CATEGORIES, ToolCategory } from "@/lib/data";

const SPEC_KEYS = ["Power", "Weight", "Capacity", "Speed", "Material", "Voltage", "Pressure", "Size"];
const STEPS = ["Your Details", "Tool Info", "Photo & Specs", "Submit"];

const EMPTY_FORM: LenderForm = {
  name: "",
  category: "Power Tools",
  description: "",
  lenderName: "",
  lenderEmail: "",
  lenderPhone: "",
  condition: "Good",
  specs: {},
  imageUrl: "",
  suggestedDailyRate: undefined,
};

export default function LenderPortal() {
  const { submitPendingTool } = useRentalStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LenderForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Image handling ───────────────────────────────────────
  const handleImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, imageUrl: url }));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImage(file);
    },
    [handleImage]
  );

  // ── Validation per step ──────────────────────────────────
  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.lenderName.trim()) e.lenderName = "Name required";
      if (!form.lenderEmail.includes("@")) e.lenderEmail = "Valid email required";
      if (form.lenderPhone.length < 8) e.lenderPhone = "Valid phone required";
    }
    if (s === 1) {
      if (!form.name.trim()) e.name = "Tool name required";
      if (!form.description.trim() || form.description.length < 20)
        e.description = "Please write at least 20 characters";
    }
    if (s === 2) {
      if (!form.imageUrl) e.imageUrl = "Please upload a photo";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      submitPendingTool(form);
      setDone(true);
    }
  };

  const addSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setForm((f) => ({ ...f, specs: { ...f.specs, [specKey.trim()]: specVal.trim() } }));
    setSpecKey("");
    setSpecVal("");
  };

  const removeSpec = (k: string) => {
    setForm((f) => {
      const s = { ...f.specs };
      delete s[k];
      return { ...f, specs: s };
    });
  };

  // ── Done screen ──────────────────────────────────────────
  if (done) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-7xl mb-5" style={{ animation: "float 2s ease-in-out infinite" }}>🎉</div>
        <h3 className="text-3xl font-black text-white mb-3">Tool Submitted!</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Your tool <strong className="text-orange-400">{form.name}</strong> has been sent for admin review.
          An admin will set the pricing and approve it — you'll see it in the catalog once approved.
        </p>
        <div className="inline-flex items-center gap-3 p-4 rounded-2xl mb-8"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <div className="font-bold text-green-400 text-sm">What happens next?</div>
            <div className="text-slate-400 text-xs">Admin reviews → Sets price → Tool goes live in catalog</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setForm(EMPTY_FORM); setStep(0); setDone(false); }} className="btn-primary">
            Submit Another Tool
          </button>
          <button onClick={() => document.getElementById("admin-panel")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-secondary text-sm">
            View Admin Panel ↓
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`step-dot ${i < step ? "step-dot-done" : i === step ? "step-dot-active" : "step-dot-pending"}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block"
              style={{ color: i === step ? "#fb923c" : i < step ? "#4ade80" : "#475569" }}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px" style={{ background: i < step ? "rgba(34,197,94,0.4)" : "rgba(249,115,22,0.15)" }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Your Details ── */}
      {step === 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg mb-2">👤 Your Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name *</label>
              <input id="lender-name" className="input-field" placeholder="Your full name"
                value={form.lenderName} onChange={(e) => setForm({ ...form, lenderName: e.target.value })} />
              {errors.lenderName && <p className="text-red-400 text-xs mt-1">{errors.lenderName}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone Number *</label>
              <input id="lender-phone" className="input-field" placeholder="+91 9876543210"
                value={form.lenderPhone} onChange={(e) => setForm({ ...form, lenderPhone: e.target.value })} />
              {errors.lenderPhone && <p className="text-red-400 text-xs mt-1">{errors.lenderPhone}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address *</label>
            <input id="lender-email" className="input-field" type="email" placeholder="you@email.com"
              value={form.lenderEmail} onChange={(e) => setForm({ ...form, lenderEmail: e.target.value })} />
            {errors.lenderEmail && <p className="text-red-400 text-xs mt-1">{errors.lenderEmail}</p>}
          </div>
          <div className="p-4 rounded-xl" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
            <p className="text-xs text-orange-300">
              🔒 Your contact details are only shared with admins for verification purposes.
            </p>
          </div>
        </div>
      )}

      {/* ── Step 1: Tool Info ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg mb-2">🔧 Tool Information</h3>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tool Name *</label>
            <input id="tool-name" className="input-field" placeholder="e.g. Rotary Hammer Drill 900W"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Category *</label>
              <select id="tool-category" className="input-field"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ToolCategory })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Condition *</label>
              <select id="tool-condition" className="input-field"
                value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as LenderForm["condition"] })}>
                {["Excellent", "Good", "Fair"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description * <span className="text-slate-500 font-normal">(min 20 chars)</span></label>
            <textarea id="tool-desc" className="input-field" rows={4}
              placeholder="Describe the tool — its use, features, included accessories..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="text-right text-xs text-slate-500 mt-1">{form.description.length} chars</div>
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Suggested Daily Rate (₹/$) <span className="text-slate-500 font-normal">— Admin sets final price</span></label>
            <input id="tool-rate" className="input-field" type="number" placeholder="e.g. 25"
              value={form.suggestedDailyRate ?? ""}
              onChange={(e) => setForm({ ...form, suggestedDailyRate: Number(e.target.value) || undefined })} />
          </div>
        </div>
      )}

      {/* ── Step 2: Photo & Specs ── */}
      {step === 2 && (
        <div className="space-y-5">
          <h3 className="font-bold text-white text-lg mb-2">📸 Photo &amp; Specifications</h3>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tool Photo *</label>
            <div
              id="lender-upload-zone"
              className="relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: dragging ? "#f97316" : errors.imageUrl ? "#ef4444" : "rgba(249,115,22,0.3)",
                background: dragging ? "rgba(249,115,22,0.08)" : "rgba(8,20,35,0.6)",
                minHeight: form.imageUrl ? "auto" : 180,
              }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              {form.imageUrl ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Tool preview"
                    className="w-full rounded-xl object-cover" style={{ maxHeight: 280 }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, imageUrl: "" })); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: "rgba(239,68,68,0.8)" }}>✕</button>
                  <div className="absolute bottom-2 left-2 px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(4,13,20,0.85)", color: "#4ade80" }}>
                    ✅ Photo uploaded
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-slate-300 font-semibold">Drag &amp; drop or click to upload</p>
                  <p className="text-slate-500 text-sm mt-1">JPG, PNG, WEBP · Max 10MB</p>
                  <div className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold inline-block"
                    style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", color: "#fb923c" }}>
                    Choose File
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleImage(e.target.files[0]); }} />
            </div>
            {errors.imageUrl && <p className="text-red-400 text-xs mt-1.5">{errors.imageUrl}</p>}
          </div>

          {/* Specs builder */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Specifications <span className="text-slate-500 font-normal">(optional but recommended)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <select className="input-field" style={{ flex: "0 0 140px" }}
                value={specKey} onChange={(e) => setSpecKey(e.target.value)}>
                <option value="">Select key...</option>
                {SPEC_KEYS.map((k) => <option key={k}>{k}</option>)}
                <option value="__custom">Custom...</option>
              </select>
              {specKey === "__custom" ? (
                <input className="input-field" placeholder="Custom key"
                  onChange={(e) => setSpecKey(e.target.value)} />
              ) : null}
              <input id="spec-val" className="input-field flex-1" placeholder="Value (e.g. 900W)"
                value={specVal} onChange={(e) => setSpecVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSpec()} />
              <button onClick={addSpec} className="btn-primary flex-shrink-0" style={{ padding: "10px 16px" }}>
                Add
              </button>
            </div>
            {Object.keys(form.specs).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(form.specs).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", color: "#7dd3fc" }}>
                    <span className="text-slate-400">{k}:</span> {v}
                    <button onClick={() => removeSpec(k)} className="text-slate-500 hover:text-red-400 ml-1">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Summary & Submit ── */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg mb-2">✅ Review &amp; Submit</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preview card */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(249,115,22,0.25)", background: "rgba(8,20,35,0.8)" }}>
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt={form.name}
                  className="w-full object-cover" style={{ height: 160 }} />
              ) : (
                <div className="h-32 flex items-center justify-center text-5xl"
                  style={{ background: "rgba(249,115,22,0.06)" }}>🔧</div>
              )}
              <div className="p-4">
                <span className="pill text-xs" style={{ fontSize: "10px", padding: "2px 10px" }}>{form.category}</span>
                <h4 className="font-bold text-white mt-2">{form.name || "—"}</h4>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">{form.description}</p>
              </div>
            </div>

            {/* Details summary */}
            <div className="space-y-2 text-sm">
              {[
                { label: "Lender", value: form.lenderName },
                { label: "Email", value: form.lenderEmail },
                { label: "Phone", value: form.lenderPhone },
                { label: "Condition", value: form.condition },
                { label: "Suggested Rate", value: form.suggestedDailyRate ? `$${form.suggestedDailyRate}/day` : "—" },
                { label: "Specs", value: `${Object.keys(form.specs).length} added` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b"
                  style={{ borderColor: "rgba(249,115,22,0.08)" }}>
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <p className="text-yellow-400 text-xs font-semibold">⏳ Pricing Decision</p>
            <p className="text-slate-400 text-xs mt-1">
              An admin will review your tool and set the final daily & weekly rental price.
              You'll be notified once it's approved and live in the catalog.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-ghost flex-1">← Back</button>
        )}
        <button id="lender-next-btn" onClick={next} className="btn-primary flex-1">
          {step < STEPS.length - 1 ? "Next →" : "Submit Tool for Review 🚀"}
        </button>
      </div>
    </div>
  );
}
