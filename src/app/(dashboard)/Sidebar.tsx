"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useMemo } from "react";
import { LayoutDashboard, Smartphone, QrCode, List, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/cihazlar", label: "Cihazlar", icon: Smartphone },
  { href: "/barkod", label: "Barkod Sorgula", icon: QrCode },
  { href: "/liste-yonetimi", label: "Liste Yönetimi", icon: List },
];

const shortcuts = [
  { key: "F1", label: "Alış" },
  { key: "F2", label: "Satış" },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <Smartphone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Elzem İletişim</h1>
            <p className="text-xs text-muted-foreground">Muhasebe Paneli</p>
          </div>
        </div>
      </div>

      <Separator className="opacity-10" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "nav-active text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator className="opacity-10" />

      {/* Kısayollar */}
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground mb-2 px-1">Kısayollar</p>
        <div className="flex gap-2">
          {shortcuts.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-md bg-white/5 border border-white/8 px-2.5 py-1.5 text-xs text-muted-foreground"
            >
              <kbd className="font-mono text-[10px] bg-white/10 rounded px-1 py-0.5">{key}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="opacity-10" />

      {/* Çıkış */}
      <div className="px-3 py-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 glass-sidebar min-h-screen">
        <NavContent />
      </aside>

      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="glass-card border-white/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menüyü aç</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 glass-sidebar border-white/10">
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
