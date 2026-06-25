// ============================================================
// TOOL RENTAL SYSTEM — Central Data Store
// Full Class Diagram Implementation
// ============================================================

// ── Base User (Parent Class) ─────────────────────────────────
export type UserRole = "lender" | "borrower" | "admin" | "inspector" | "gigworker";

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string; // hashed in real app
  phone: string;
  role: UserRole;
  // Methods (represented as state flags)
  isLoggedIn?: boolean;
}

// ── Role Sub-classes ─────────────────────────────────────────
export interface Lender extends User {
  role: "lender";
  toolsListed: string[]; // toolIds
}
export interface Borrower extends User {
  role: "borrower";
  activeRequests: string[]; // requestIds
}
export interface Admin extends User {
  role: "admin";
}
export interface Inspector extends User {
  role: "inspector";
  inspectionsCompleted: number;
}
export interface GigWorker extends User {
  role: "gigworker";
  assignedDeliveries: string[]; // rentalIds
  status: "available" | "busy";
}

// ── Tool ─────────────────────────────────────────────────────
export type ToolStatus = "available" | "rented" | "reserved" | "maintenance";
export type ApprovalStatus = "pending_admin" | "approved" | "rejected";
export type ToolCategory = "Power Tools" | "Hand Tools" | "Excavation" | "Lifting" | "Measuring" | "Cleaning";

export interface Tool {
  toolId: string;
  // keep id alias for compatibility
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  pricePerDay: number;  // = dailyRate
  dailyRate: number;
  weeklyRate: number;
  availabilityStatus: ToolStatus;
  status: ToolStatus;
  approvalStatus: ApprovalStatus;
  rating: number;
  reviews: number;
  icon: string;
  imageUrl?: string;
  specs: Record<string, string>;
  lenderName?: string;
  lenderEmail?: string;
  condition?: "Excellent" | "Good" | "Fair";
  available_from?: string;
}

// ── ToolRequest ───────────────────────────────────────────────
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ToolRequest {
  requestId: string;
  toolId: string;
  toolName: string;
  toolIcon: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  requestDate: string;
  startDate: string;
  endDate: string;
  status: RequestStatus;
  lenderNote?: string;
}

// ── Rental ───────────────────────────────────────────────────
export type RentalStatus = "active" | "in_transit" | "completed" | "cancelled";

export interface Rental {
  rentalId: string;
  id: string; // alias
  toolId: string;
  toolName: string;
  toolIcon: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalCost: number;
  status: RentalStatus;
  rentalState: ToolStatus;
  createdAt: string;
  deliveryStatus?: "pending_pickup" | "picked_up" | "delivered" | "return_pickup" | "returned";
  gigWorkerId?: string;
  inspectionId?: string;
}

// ── Payment ──────────────────────────────────────────────────
export type PaymentStatus = "pending" | "completed" | "refunded" | "failed";

export interface Payment {
  paymentId: string;
  rentalId: string;
  amount: number;
  paymentDate: string;
  paymentStatus: PaymentStatus;
  method: "card" | "upi" | "wallet";
  refundAmount?: number;
}

// ── Inspection ────────────────────────────────────────────────
export type ConditionStatus = "good" | "damaged" | "minor_wear";

export interface Inspection {
  inspectionId: string;
  rentalId: string;
  toolId: string;
  toolName: string;
  inspectorId: string;
  inspectorName: string;
  conditionStatus: ConditionStatus;
  damageFee: number;
  notes: string;
  photoUrl?: string;
  inspectedAt: string;
}

// ── Dispute ───────────────────────────────────────────────────
export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export interface Dispute {
  disputeId: string;
  rentalId: string;
  raisedBy: string;
  raisedByEmail: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  raisedAt: string;
  resolvedAt?: string;
}

// ── Pending Tool (lender submission awaiting admin) ───────────
export type PendingStatus = "pending" | "approved" | "rejected";

export interface PendingTool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  lenderName: string;
  lenderEmail: string;
  lenderPhone: string;
  condition: "Excellent" | "Good" | "Fair";
  specs: Record<string, string>;
  imageUrl: string;
  submittedAt: string;
  status: PendingStatus;
  adminNote?: string;
  suggestedDailyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
}

// ── Seed Data ─────────────────────────────────────────────────
// Catalog starts EMPTY — tools only appear after Lender submits → Admin approves
export const TOOLS: Tool[] = [
];


export const INITIAL_RENTALS: Rental[] = [];

export const INITIAL_PENDING: PendingTool[] = [
  {
    id: "p001", name: "Cordless Impact Driver", category: "Power Tools",
    description: "18V brushless cordless impact driver. 3-speed, LED light, belt clip. Great for fastening tasks.",
    lenderName: "Vikram Nair", lenderEmail: "vikram@mail.com", lenderPhone: "9876543210",
    condition: "Excellent", specs: { Voltage: "18V", Torque: "220 Nm", "Speed Modes": "3", Battery: "4.0Ah" },
    imageUrl: "", submittedAt: "2026-04-22T07:00:00Z", status: "pending", suggestedDailyRate: 15,
  },
  {
    id: "p002", name: "Belt Sander 75mm", category: "Power Tools",
    description: "Professional belt sander for wood finishing. Dust bag, variable speed, 75x533mm belt.",
    lenderName: "Sunita Rao", lenderEmail: "sunita@mail.com", lenderPhone: "9988776655",
    condition: "Good", specs: { Power: "1010W", "Belt Size": "75x533mm", Speed: "200-450 m/min", Weight: "4.8 kg" },
    imageUrl: "", submittedAt: "2026-04-23T06:30:00Z", status: "pending", suggestedDailyRate: 18,
  },
];

export const INITIAL_REQUESTS: ToolRequest[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_INSPECTIONS: Inspection[] = [];

export const INITIAL_DISPUTES: Dispute[] = [];

export const GIG_WORKERS: GigWorker[] = [
  {
    userId: "gw001", name: "Ramu Delivery", email: "ramu@gig.com", password: "", phone: "9000111222",
    role: "gigworker", assignedDeliveries: ["r002"], status: "busy",
  },
  {
    userId: "gw002", name: "Suresh Express", email: "suresh@gig.com", password: "", phone: "9000333444",
    role: "gigworker", assignedDeliveries: [], status: "available",
  },
];

export const CATEGORIES: ToolCategory[] = ["Power Tools", "Hand Tools", "Excavation", "Lifting", "Measuring", "Cleaning"];

export const STATUS_LABELS: Record<ToolStatus, string> = {
  available: "Available", rented: "Rented", reserved: "Reserved", maintenance: "Maintenance",
};
