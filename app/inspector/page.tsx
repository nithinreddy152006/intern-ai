"use client";
import DashboardShell from "@/components/DashboardShell";
import InspectorPanel from "@/components/InspectorPanel";

export default function InspectorPage() {
  return (
    <DashboardShell
      title="Inspector Dashboard"
      subtitle="Inspect returned tools, record condition, and raise damage fees."
      requiredRole="inspector"
    >
      <InspectorPanel />
    </DashboardShell>
  );
}
