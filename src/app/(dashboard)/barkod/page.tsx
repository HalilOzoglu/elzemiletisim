"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, QrCode, ArrowRight, Smartphone, Package } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { Device } from "@/types";

type DeviceResult = Device & {
  brandName?: string;
  modelName?: string;
  storageName?: string;
  colorName?: string;
  ydStatusName?: string;
  purchaseTypeName?: string;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

const conditionLabel: Record<string, string> = { sifir: "Sıfır", ikinci_el: "İkinci El" };
const invoiceLabel: Record<string, string> = { AF: "AF (Açık Fatura)", MF: "MF (Faturasız)" };

export default function BarkodPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<DeviceResult | null | undefined>(undefined);

  async function handleSearch() {
    const trimmed = barcode.trim();
    if (!trimmed) return;
    setLoading(true);
    setDevice(undefined);
    try {
      const res = await fetch(`/api/barkod?barcode=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Bilinmeyen hata");
      setDevice(json.device ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sorgulama sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <QrCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Barkod Sorgula</h1>
          <p className="text-sm text-muted-foreground">Barkod numarasıyla cihaz bilgilerine ulaşın</p>
        </div>
      </div>

      {/* Arama */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Barkod numarası girin..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
              autoFocus
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !barcode.trim()}
            className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Sorgula</span>
          </Button>
        </div>
      </div>

      {/* Yükleniyor */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Bulunamadı */}
      {!loading && device === null && (
        <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Cihaz bulunamadı</p>
          <p className="text-sm text-muted-foreground mt-1">Bu barkoda ait kayıt yok.</p>
        </div>
      )}

      {/* Sonuç */}
      {!loading && device && (
        <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
          {/* Cihaz başlığı */}
          <div className="p-5 border-b border-white/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate">
                {device.brandName} {device.modelName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {device.storageName && `${device.storageName} · `}
                {device.colorName}
                {device.barcode && ` · ${device.barcode}`}
              </p>
            </div>
            <Badge
              className={
                device.isSold
                  ? "text-muted-foreground border-white/10 bg-white/5"
                  : "text-green-400 border-green-400/30 bg-green-400/10 border"
              }
            >
              {device.isSold ? "Satıldı" : "Stokta"}
            </Badge>
          </div>

          {/* Bilgiler — 2 sütun */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cihaz Bilgileri</p>
              <InfoRow label="Marka" value={device.brandName} />
              <InfoRow label="Model" value={device.modelName} />
              <InfoRow label="Hafıza" value={device.storageName} />
              <InfoRow label="Renk" value={device.colorName} />
              <InfoRow label="YD Durumu" value={device.ydStatusName} />
              <InfoRow label="Durum" value={conditionLabel[device.condition]} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alış Bilgileri</p>
              <InfoRow label="Alım Şekli" value={device.purchaseTypeName} />
              <InfoRow label="Fatura Türü" value={invoiceLabel[device.invoiceType]} />
              <InfoRow
                label="Alış Tarihi"
                value={device.purchaseDate ? formatDate(device.purchaseDate) : undefined}
              />
              <InfoRow
                label="Alış Fiyatı"
                value={device.purchasePrice != null ? formatCurrency(device.purchasePrice) : undefined}
              />
              <InfoRow
                label="Önerilen Satış Fiyatı"
                value={device.suggestedPrice != null ? formatCurrency(device.suggestedPrice) : undefined}
              />
              {device.warrantyMonths != null && (
                <InfoRow label="Garanti" value={`${device.warrantyMonths} ay`} />
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 pb-5">
            <Button
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-150 active:scale-[0.98]"
              onClick={() => router.push(`/cihazlar/${device.id}`)}
            >
              Cihaz Detayına Git
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
