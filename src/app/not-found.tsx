import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-xl font-semibold">Sayfa bulunamadı</h2>
      <p className="text-sm text-muted-foreground">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Button asChild>
        <Link href="/panel">
          <Home className="mr-2 h-4 w-4" />
          Ana Sayfaya Dön
        </Link>
      </Button>
    </div>
  );
}
