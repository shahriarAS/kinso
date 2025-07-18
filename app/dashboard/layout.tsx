import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="bg-primary h-screen w-full text-white p-4 pl-0 flex">
        <DashboardSidebar/>
      <div className="border flex-1 rounded-4xl bg-secondary p-8 text-primary w-full">
      {children}
      </div>
    </section>
  );
}
