import { DashboardSidebar } from "@/features/dashboard/components";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex w-full h-screen p-4 pl-0 overflow-y-hidden text-white bg-primary">
      <DashboardSidebar />
      <div className="flex-1 w-full overflow-x-scroll border rounded-xl bg-gray-50 text-primary no-scrollbar">
        {children}
      </div>
    </section>
  );
}
