"use client";
import DashboardShell from "@/components/DashboardShell";
import GigWorkerPanel from "@/components/GigWorkerPanel";

export default function DeliveryPage() {
  return (
    <DashboardShell
      title="Delivery Dashboard"
      subtitle="Manage tool pickups and deliveries. Update status as you go."
      requiredRole="delivery"
    >
      <GigWorkerPanel />
    </DashboardShell>
  );
}
