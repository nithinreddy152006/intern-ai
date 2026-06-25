"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  Tool, Rental, PendingTool, ToolRequest, Payment, Inspection, Dispute, GigWorker,
  TOOLS, INITIAL_RENTALS, INITIAL_PENDING, INITIAL_REQUESTS,
  INITIAL_PAYMENTS, INITIAL_INSPECTIONS, INITIAL_DISPUTES, GIG_WORKERS,
  ToolStatus, ToolCategory, ConditionStatus,
} from "@/lib/data";

// ── Public interface ─────────────────────────────────────────
interface RentalStore {
  // Catalog
  tools: Tool[];
  rentals: Rental[];
  rentTool: (toolId: string, form: RentalForm) => Rental;
  returnTool: (rentalId: string) => void;
  cancelRental: (rentalId: string) => void;
  getToolById: (id: string) => Tool | undefined;
  // Lender portal
  pendingTools: PendingTool[];
  submitPendingTool: (form: LenderForm) => void;
  // Tool requests (lender approve/reject borrower requests)
  toolRequests: ToolRequest[];
  approveRequest: (requestId: string, note: string) => void;
  rejectRequest: (requestId: string, note: string) => void;
  // Admin
  approveTool: (id: string, dailyRate: number, weeklyRate: number, note: string) => void;
  rejectPendingTool: (id: string, note: string) => void;
  // Inspector
  inspections: Inspection[];
  inspectTool: (form: InspectionForm) => void;
  // GigWorker
  gigWorkers: GigWorker[];
  updateDelivery: (rentalId: string, newStatus: Rental["deliveryStatus"]) => void;
  // Payments
  payments: Payment[];
  processPayment: (rentalId: string, method: Payment["method"]) => void;
  refundPayment: (paymentId: string) => void;
  // Disputes
  disputes: Dispute[];
  raiseDispute: (rentalId: string, raisedBy: string, raisedByEmail: string, description: string) => void;
  resolveDispute: (disputeId: string, resolution: string) => void;
}

export interface RentalForm {
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
}

export interface LenderForm {
  name: string;
  category: ToolCategory;
  description: string;
  lenderName: string;
  lenderEmail: string;
  lenderPhone: string;
  condition: "Excellent" | "Good" | "Fair";
  specs: Record<string, string>;
  imageUrl: string;
  suggestedDailyRate?: number;
}

export interface InspectionForm {
  rentalId: string;
  toolId: string;
  toolName: string;
  inspectorName: string;
  conditionStatus: ConditionStatus;
  damageFee: number;
  notes: string;
}

// ── Context ──────────────────────────────────────────────────
const Ctx = createContext<RentalStore | null>(null);

export function RentalProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>(TOOLS);
  const [rentals, setRentals] = useState<Rental[]>(INITIAL_RENTALS);
  const [pendingTools, setPendingTools] = useState<PendingTool[]>(INITIAL_PENDING);
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>(INITIAL_REQUESTS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [inspections, setInspections] = useState<Inspection[]>(INITIAL_INSPECTIONS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [gigWorkers] = useState<GigWorker[]>(GIG_WORKERS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolrent_store_db");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tools) setTools(parsed.tools);
        if (parsed.rentals) setRentals(parsed.rentals);
        if (parsed.pendingTools) setPendingTools(parsed.pendingTools);
        if (parsed.toolRequests) setToolRequests(parsed.toolRequests);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.inspections) setInspections(parsed.inspections);
        if (parsed.disputes) setDisputes(parsed.disputes);
      }
    } catch { /* ignore */ }
    setIsHydrated(true);
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("toolrent_store_db", JSON.stringify({
      tools, rentals, pendingTools, toolRequests, payments, inspections, disputes
    }));
  }, [tools, rentals, pendingTools, toolRequests, payments, inspections, disputes, isHydrated]);

  const getToolById = useCallback((id: string) => tools.find((t) => t.id === id), [tools]);

  // ── Borrower: Rent a tool ────────────────────────────────
  const rentTool = useCallback((toolId: string, form: RentalForm): Rental => {
    const tool = tools.find((t) => t.id === toolId);
    if (!tool) throw new Error("Tool not found");
    const days = Math.max(1, Math.ceil(
      (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000
    ));
    const cost = days >= 7
      ? Math.floor(days / 7) * tool.weeklyRate + (days % 7) * tool.dailyRate
      : days * tool.dailyRate;

    const rental: Rental = {
      rentalId: `r${Date.now()}`, id: `r${Date.now()}`,
      toolId, toolName: tool.name, toolIcon: tool.icon,
      userName: form.userName, userEmail: form.userEmail,
      startDate: form.startDate, endDate: form.endDate,
      totalDays: days, totalCost: cost,
      status: "active", rentalState: "rented",
      createdAt: new Date().toISOString(),
      deliveryStatus: "pending_pickup",
    };
    setRentals((prev) => [rental, ...prev]);
    setTools((prev) => prev.map((t) => t.id === toolId ? { ...t, status: "rented" as ToolStatus, availabilityStatus: "rented" as ToolStatus } : t));
    return rental;
  }, [tools]);

  // ── Borrower: Return tool ────────────────────────────────
  const returnTool = useCallback((rentalId: string) => {
    let tid: string | undefined;
    setRentals((prev) => prev.map((r) => {
      if (r.id === rentalId) { tid = r.toolId; return { ...r, status: "completed" as const, deliveryStatus: "return_pickup" as const }; }
      return r;
    }));
    if (tid) setTools((prev) => prev.map((t) => t.id === tid ? { ...t, status: "available" as ToolStatus, availabilityStatus: "available" as ToolStatus } : t));
  }, []);

  // ── Borrower: Cancel rental ──────────────────────────────
  const cancelRental = useCallback((rentalId: string) => {
    let tid: string | undefined;
    setRentals((prev) => prev.map((r) => {
      if (r.id === rentalId) { tid = r.toolId; return { ...r, status: "cancelled" as const }; }
      return r;
    }));
    if (tid) setTools((prev) => prev.map((t) => t.id === tid ? { ...t, status: "available" as ToolStatus, availabilityStatus: "available" as ToolStatus } : t));
  }, []);

  // ── Lender: Submit tool for admin review ─────────────────
  const submitPendingTool = useCallback((form: LenderForm) => {
    setPendingTools((prev) => [{
      id: `p${Date.now()}`, ...form,
      submittedAt: new Date().toISOString(), status: "pending",
    }, ...prev]);
  }, []);

  // ── Lender: Approve borrower request ─────────────────────
  const approveRequest = useCallback((requestId: string, note: string) => {
    setToolRequests((prev) => prev.map((r) =>
      r.requestId === requestId ? { ...r, status: "approved", lenderNote: note } : r
    ));
  }, []);

  // ── Lender: Reject borrower request ──────────────────────
  const rejectRequest = useCallback((requestId: string, note: string) => {
    setToolRequests((prev) => prev.map((r) =>
      r.requestId === requestId ? { ...r, status: "rejected", lenderNote: note } : r
    ));
  }, []);

  // ── Admin: Approve tool listing ──────────────────────────
  const approveTool = useCallback((id: string, dailyRate: number, weeklyRate: number, note: string) => {
    let approved: PendingTool | undefined;
    setPendingTools((prev) => prev.map((p) => {
      if (p.id === id) { approved = { ...p, status: "approved", dailyRate, weeklyRate, adminNote: note }; return approved; }
      return p;
    }));
    if (approved) {
      const newTool: Tool = {
        toolId: `t${Date.now()}`, id: `t${Date.now()}`,
        name: approved.name, category: approved.category, description: approved.description,
        pricePerDay: dailyRate, dailyRate, weeklyRate,
        availabilityStatus: "available", status: "available", approvalStatus: "approved",
        rating: 0, reviews: 0, icon: "🔧",
        imageUrl: approved.imageUrl, specs: approved.specs,
        lenderName: approved.lenderName, lenderEmail: approved.lenderEmail,
        condition: approved.condition,
      };
      setTools((prev) => [newTool, ...prev]);
    }
  }, []);

  // ── Admin: Reject tool listing ───────────────────────────
  const rejectPendingTool = useCallback((id: string, note: string) => {
    setPendingTools((prev) => prev.map((p) => p.id === id ? { ...p, status: "rejected", adminNote: note } : p));
  }, []);

  // ── Inspector: Inspect tool ──────────────────────────────
  const inspectTool = useCallback((form: InspectionForm) => {
    const insp: Inspection = {
      inspectionId: `ins${Date.now()}`,
      ...form,
      inspectorId: "current_inspector",
      inspectedAt: new Date().toISOString(),
    };
    setInspections((prev) => [insp, ...prev]);
    // Update rental with inspectionId
    setRentals((prev) => prev.map((r) =>
      r.id === form.rentalId ? { ...r, inspectionId: insp.inspectionId } : r
    ));
    // If damaged, apply fee to payment
    if (form.damageFee > 0) {
      setPayments((prev) => [{
        paymentId: `pay${Date.now()}`,
        rentalId: form.rentalId,
        amount: form.damageFee,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentStatus: "pending",
        method: "card",
      }, ...prev]);
    }
  }, []);

  // ── GigWorker: Update delivery status ────────────────────
  const updateDelivery = useCallback((rentalId: string, newStatus: Rental["deliveryStatus"]) => {
    setRentals((prev) => prev.map((r) =>
      r.id === rentalId ? { ...r, deliveryStatus: newStatus } : r
    ));
  }, []);

  // ── Payment: Process ─────────────────────────────────────
  const processPayment = useCallback((rentalId: string, method: Payment["method"]) => {
    setPayments((prev) => [{
      paymentId: `pay${Date.now()}`,
      rentalId, amount: 0, // calculated from rental
      paymentDate: new Date().toISOString().split("T")[0],
      paymentStatus: "completed", method,
    }, ...prev]);
  }, []);

  // ── Payment: Refund ──────────────────────────────────────
  const refundPayment = useCallback((paymentId: string) => {
    setPayments((prev) => prev.map((p) =>
      p.paymentId === paymentId ? { ...p, paymentStatus: "refunded" } : p
    ));
  }, []);

  // ── Dispute: Raise ───────────────────────────────────────
  const raiseDispute = useCallback((rentalId: string, raisedBy: string, raisedByEmail: string, description: string) => {
    setDisputes((prev) => [{
      disputeId: `dis${Date.now()}`,
      rentalId, raisedBy, raisedByEmail, description,
      status: "open", raisedAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  // ── Dispute: Resolve ─────────────────────────────────────
  const resolveDispute = useCallback((disputeId: string, resolution: string) => {
    setDisputes((prev) => prev.map((d) =>
      d.disputeId === disputeId
        ? { ...d, status: "resolved", resolution, resolvedAt: new Date().toISOString() }
        : d
    ));
  }, []);

  return (
    <Ctx.Provider value={{
      tools, rentals, rentTool, returnTool, cancelRental, getToolById,
      pendingTools, submitPendingTool,
      toolRequests, approveRequest, rejectRequest,
      approveTool, rejectPendingTool,
      inspections, inspectTool,
      gigWorkers, updateDelivery,
      payments, processPayment, refundPayment,
      disputes, raiseDispute, resolveDispute,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRentalStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRentalStore must be inside RentalProvider");
  return ctx;
}
