"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Smartphone, ChevronRight, Search, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { StockDevice } from "@/types";

interface StokOzetProps {
  stockCount: number;
  stockTotalCost: number;
  stockDevices: StockDevice[];
}

const conditionLabel: Record<string, string> = {
  sifir: "Sıfır",
  ikinci_el: "2. El",
};

export function StokOzet({ stockCount, stockTotalCost, stockDevices }: StokOzetProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? stockDevices.filter((d) => {
        const s = search.toLowerCase();
        return (
          d.brandName?.toLowerCase().includes(s) ||
          d.modelName?.toLowerCase().includes(s) ||
          d.storageName?.toLowerCase().includes(s) ||
          d.colorName?.toLowerCase().includes(s) ||
          d.barcode?.toLowerCase().includes(s)
        );
      })
    : stockDevices;

  return (
    <div className="glass-card rounded-xl overflow-hidden border-t-2 border-t-purple-500">
      {/* Başlık + özet */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Package className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-base font-semibold">Stok Durumu</span>
          </div>
          <Badge className="text-purple-400 border-purple-400/30 bg-purple-400/10 border tabular-nums">
            {stockCount} cihaz
          </Badge>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/3 border border-white/5 p-3">
            <p className="text-xs text-muted-foreground mb-1">Toplam Stok</p>
            <p className="text-xl font-bold tabular-nums">{stockCount}</p>
            <p className="text-xs text-muted-foreground">cihaz</p>
          </div>
          <div className="rounded-lg bg-white/3 border border-white/5 p-3">
            <p className="text-xs text-muted-foreground mb-1">Stok Maliyeti</p>
            <p className="text-lg font-bold tabular-nums text-purple-400">
              {formatCurrency(stockTotalCost)}
            </p>
            <p className="text-xs text-muted-foreground">toplam alış</p>
          </div>
        </div>
      </div>

      {/* Arama */}
      {stockDevices.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-white/5 border-white/10 focus:border-primary/50"
            />
          </div>
        </div>
      )}

      {/* Cihaz listesi */}
      <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            {stockDevices.length === 0 ? (
              <>
                <TrendingDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Stokta cihaz yok</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sonuç bulunamadı</p>
            )}
          </div>
        ) : (
          filtered.map((device) => (
            <button
              key={device.id}
              onClick={() => router.push(`/cihazlar/${device.id}`)}
              className="w-full text-left px-4 py-3 hover:bg-white/3 transition-colors duration-100 active:bg-white/5 flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium truncate">
                    {device.brandName} {device.modelName}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 border-white/10 text-muted-foreground shrink-0"
                  >
                    {conditionLabel[device.condition]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {[device.storageName, device.colorName].filter(Boolean).join(" · ")}
                  {device.purchaseDate && ` · ${formatDate(device.purchaseDate)}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                {device.purchasePrice != null && (
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(device.purchasePrice)}
                  </p>
                )}
                {device.barcode && (
                  <p className="text-[10px] text-muted-foreground font-mono">{device.barcode}</p>
                )}
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))
        )}
      </div>

      {/* Alt toplam (filtrelenmiş) */}
      {filtered.length > 0 && search.trim() && (
        <div className="px-4 py-3 border-t border-white/5 flex justify-between text-xs text-muted-foreground">
          <span>{filtered.length} sonuç</span>
          <span className="tabular-nums">
            {formatCurrency(filtered.reduce((s, d) => s + (d.purchasePrice ?? 0), 0))}
          </span>
        </div>
      )}
    </div>
  );
}
