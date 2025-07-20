import { DashboardSidebar } from "@/features/dashboard/components";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="bg-primary flex-shrink-0">
        <DashboardSidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <main className="h-full">{children}</main>
      </div>
    </div>
  );
}
