export const dynamic = 'force-dynamic';

import { Sidebar } from "./Sidebar";
import { ShortcutModals } from "@/components/shortcuts/ShortcutModals";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 md:p-8 pt-16 md:pt-8">
        {children}
      </main>
      <ShortcutModals />
    </div>
  );
}
