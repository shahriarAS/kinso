import { DashboardSidebar } from "@/features/dashboard/components";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="bg-primary h-screen w-full text-white p-4 pl-0 flex">
      <DashboardSidebar />
      <div className="border flex-1 rounded-4xl bg-gray-50 text-primary w-full overflow-x-scroll no-scrollbar">
        {children}
      </div>
    </section>
  );
}
