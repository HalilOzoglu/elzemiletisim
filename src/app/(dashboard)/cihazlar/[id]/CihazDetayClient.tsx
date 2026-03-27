"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Smartphone,
  Receipt,
  TrendingUp,
  TrendingDown,
  Tag,
  User,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MasrafForm } from "@/components/cihaz/MasrafForm";
import { SatisForm } from "@/components/cihaz/SatisForm";
import { calculateProfit, calculateTotalExpenses } from "@/lib/utils/calculations";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { Device, Expense, Sale } from "@/types";

type DeviceWithNames = Device & {
  brandName?: string;
  modelName?: string;
  storageName?: string;
  colorName?: string;
  ydStatusName?: string;
  purchaseTypeName?: string;
};

interface CihazDetayClientProps {
  device: DeviceWithNames;
  expenses: Expense[];
  sale: Sale | null;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
    </div>
  );
}

const saleMethodLabel: Record<string, string> = {
  nakit: "Nakit",
  havale: "Havale",
  kredi_karti: "Kredi Kartı",
};
const invoiceTypeLabel: Record<string, string> = {
  AF: "AF (Açık Fatura)",
  MF: "MF (Faturasız)",
};
const conditionLabel: Record<string, string> = {
  sifir: "Sıfır",
  ikinci_el: "İkinci El",
};
const supplierTypeLabel: Record<string, string> = {
  musteri: "Müşteri",
  firma: "Firma",
};

export function CihazDetayClient({ device, expenses, sale }: CihazDetayClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(sale ? "masraf" : "satis");

  const totalExpenses = calculateTotalExpenses(expenses);
  const profit = sale
    ? calculateProfit(sale.salePrice, device.purchasePrice ?? 0, expenses)
    : null;
  const isProfit = profit !== null && profit >= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Geri"
          className="hover:bg-white/5 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold truncate">
              {device.brandName} {device.modelName}
            </h1>
            <Badge
              className={
                device.isSold
                  ? "text-muted-foreground border-white/10 bg-white/5 shrink-0"
                  : "text-green-400 border-green-400/30 bg-green-400/10 border shrink-0"
              }
            >
              {device.isSold ? "Satıldı" : "Stokta"}
            </Badge>
          </div>
          {device.barcode && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Barkod: <span className="font-mono">{device.barcode}</span>
            </p>
          )}
        </div>
      </div>

      {/* Ana içerik — 2 sütun */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Sol sütun — bilgiler (lg: 2/5) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Cihaz bilgileri */}
          <div className="glass-card rounded-xl p-5">
            <SectionTitle icon={Smartphone} title="Cihaz Bilgileri" />
            <InfoRow label="Marka" value={device.brandName} />
            <InfoRow label="Model" value={device.modelName} />
            <InfoRow label="Hafıza" value={device.storageName} />
            <InfoRow label="Renk" value={device.colorName} />
            <InfoRow label="YD Durumu" value={device.ydStatusName} />
            <InfoRow label="Durum" value={conditionLabel[device.condition]} />
            {device.warrantyMonths != null && (
              <InfoRow label="Garanti" value={`${device.warrantyMonths} ay`} />
            )}
          </div>

          {/* Alış bilgileri */}
          <div className="glass-card rounded-xl p-5">
            <SectionTitle icon={ShoppingCart} title="Alış Bilgileri" />
            <InfoRow label="Alım Şekli" value={device.purchaseTypeName} />
            <InfoRow label="Fatura Türü" value={invoiceTypeLabel[device.invoiceType]} />
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
          </div>

          {/* Tedarikçi bilgileri */}
          {device.supplierType && (
            <div className="glass-card rounded-xl p-5">
              <SectionTitle icon={User} title="Tedarikçi" />
              <InfoRow label="Tür" value={supplierTypeLabel[device.supplierType]} />
              {device.supplierType === "musteri" && (
                <>
                  <InfoRow
                    label="Ad Soyad"
                    value={
                      device.supplierName || device.supplierSurname
                        ? `${device.supplierName ?? ""} ${device.supplierSurname ?? ""}`.trim()
                        : undefined
                    }
                  />
                  {device.supplierPhone && (
                    <InfoRow label="Telefon" value={device.supplierPhone} />
                  )}
                </>
              )}
              {device.supplierType === "firma" && device.supplierCompany && (
                <InfoRow label="Firma Adı" value={device.supplierCompany} />
              )}
            </div>
          )}

          {/* Masraf özeti */}
          {expenses.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <SectionTitle icon={Receipt} title="Masraflar" />
              {expenses.map((expense) => (
                <InfoRow
                  key={expense.id}
                  label={expense.description}
                  value={formatCurrency(expense.amount)}
                />
              ))}
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-white/5">
                <span className="text-sm font-semibold">Toplam Masraf</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sağ sütun — satış bilgisi + formlar (lg: 3/5) */}
        <div className="lg:col-span-3 space-y-4">

          {/* Satış bilgileri (satıldıysa) */}
          {sale && (
            <div className={`glass-card rounded-xl p-5 border-t-2 ${isProfit ? "border-t-emerald-500" : "border-t-red-500"}`}>
              <div className="flex items-center justify-between mb-4">
                <SectionTitle
                  icon={isProfit ? TrendingUp : TrendingDown}
                  title="Satış Bilgileri"
                />
                {/* Net kâr özeti */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Net Kâr</p>
                  <p className={`text-xl font-bold tabular-nums ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                    {profit !== null ? formatCurrency(profit) : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Müşteri</p>
                  <InfoRow label="Ad Soyad" value={`${sale.customerName} ${sale.customerSurname}`} />
                  <InfoRow label="Telefon" value={sale.customerPhone} />
                  <InfoRow label="Satış Tarihi" value={formatDate(sale.saleDate)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Ödeme</p>
                  <InfoRow label="Satış Fiyatı" value={formatCurrency(sale.salePrice)} />
                  {sale.saleMethod === "kredi_karti" && sale.grossPrice != null && (
                    <InfoRow label="Brüt Tutar" value={formatCurrency(sale.grossPrice)} />
                  )}
                  {sale.commissionRate != null && (
                    <InfoRow label="Komisyon" value={`%${sale.commissionRate}`} />
                  )}
                  <InfoRow label="Yöntem" value={saleMethodLabel[sale.saleMethod]} />
                  <InfoRow label="Fatura" value={invoiceTypeLabel[sale.invoiceStatus]} />
                  {sale.afSubStatus && (
                    <InfoRow
                      label="AF Durum"
                      value={sale.afSubStatus === "kesildi" ? "Kesildi" : "Bekliyor"}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formlar — tab'lı */}
          <div className="glass-card rounded-xl overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-white/5 px-5 pt-4">
                <TabsList className="bg-white/5 border border-white/10 h-9">
                  {!sale && (
                    <TabsTrigger value="satis" className="text-xs gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Satış Kaydet
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="masraf" className="text-xs gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Masraf Ekle
                  </TabsTrigger>
                </TabsList>
              </div>

              {!sale && (
                <TabsContent value="satis" className="p-5 mt-0">
                  <SatisForm
                    deviceId={device.id}
                    devicePurchasePrice={device.purchasePrice}
                    onSuccess={() => router.refresh()}
                  />
                </TabsContent>
              )}

              <TabsContent value="masraf" className="p-5 mt-0">
                <MasrafForm
                  deviceId={device.id}
                  existingExpenses={expenses}
                  onSuccess={() => router.refresh()}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
