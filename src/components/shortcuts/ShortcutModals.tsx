"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, ArrowLeft, Loader2, Smartphone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Device, ListCategory, ListItem } from "@/types";

// Modülleri dosya yüklendiğinde bir kez import et (modal açılışında gecikme olmaz)
import { CihazForm } from "@/components/cihaz/CihazForm";
import { SatisForm } from "@/components/cihaz/SatisForm";
import { createDevice } from "@/lib/supabase/device-actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DeviceWithNames = Device & {
  brandName?: string;
  modelName?: string;
  storageName?: string;
  colorName?: string;
};

// ---------------------------------------------------------------------------
// AlisModal
// ---------------------------------------------------------------------------

function AlisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [categories, setCategories] = useState<ListCategory[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, ListItem[]>>({});
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    fetch("/api/liste-data")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        setItemsByCategory(data.itemsByCategory ?? {});
      })
      .catch(() => toast.error("Liste verileri yüklenemedi"))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-modal-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="gradient-text">Yeni Cihaz Al</span>
            <Badge variant="outline" className="text-xs font-mono ml-auto">F1</Badge>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CihazForm
            categories={categories}
            itemsByCategory={itemsByCategory}
            onSubmit={async (data) => {
              await createDevice(data);
              toast.success("Cihaz başarıyla kaydedildi.");
              onClose();
              router.refresh();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// SatisModal — 2 adımlı: DeviceSearch → SatisForm
// ---------------------------------------------------------------------------

function SatisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"search" | "form">("search");
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithNames | null>(null);
  const [query, setQuery] = useState("");
  const [devices, setDevices] = useState<DeviceWithNames[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setStep("search");
      setSelectedDevice(null);
      setQuery("");
      setDevices([]);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadDevices(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, open]);

  async function loadDevices(search: string) {
    setLoadingDevices(true);
    try {
      const supabase = createClient();
      let q = supabase
        .from("devices")
        .select(`
          *,
          brand:list_items!brand_id(value),
          model:list_items!model_id(value),
          storage:list_items!storage_id(value),
          color:list_items!color_id(value)
        `)
        .eq("is_sold", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (search.trim()) {
        q = q.or(`barcode.ilike.%${search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;

      const mapped: DeviceWithNames[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        barcode: (row.barcode as string | null) ?? undefined,
        brandId: row.brand_id as string,
        modelId: row.model_id as string,
        storageId: row.storage_id as string,
        colorId: row.color_id as string,
        ydStatusId: row.yd_status_id as string,
        purchaseTypeId: row.purchase_type_id as string,
        invoiceType: row.invoice_type as "AF" | "MF",
        condition: row.condition as "sifir" | "ikinci_el",
        warrantyMonths: (row.warranty_months as number | null) ?? undefined,
        purchaseDate: (row.purchase_date as string | null) ?? undefined,
        purchasePrice: (row.purchase_price as number | null) ?? undefined,
        supplierType: (row.supplier_type as "musteri" | "firma" | null) ?? undefined,
        supplierName: (row.supplier_name as string | null) ?? undefined,
        supplierSurname: (row.supplier_surname as string | null) ?? undefined,
        supplierPhone: (row.supplier_phone as string | null) ?? undefined,
        supplierCompany: (row.supplier_company as string | null) ?? undefined,
        isSold: row.is_sold as boolean,
        createdAt: (row.created_at as string | null) ?? undefined,
        updatedAt: (row.updated_at as string | null) ?? undefined,
        brandName: (row.brand as { value: string } | null)?.value,
        modelName: (row.model as { value: string } | null)?.value,
        storageName: (row.storage as { value: string } | null)?.value,
        colorName: (row.color as { value: string } | null)?.value,
      }));

      const filtered = search.trim()
        ? mapped.filter((d) => {
            const s = search.toLowerCase();
            return (
              d.brandName?.toLowerCase().includes(s) ||
              d.modelName?.toLowerCase().includes(s) ||
              d.barcode?.toLowerCase().includes(s)
            );
          })
        : mapped;

      setDevices(filtered);
    } catch {
      toast.error("Cihazlar yüklenemedi");
    } finally {
      setLoadingDevices(false);
    }
  }

  return (
    <div className="bg-amber-900">
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "form" && (
              <Button variant="ghost" size="icon" className="h-7 w-7 mr-1" onClick={() => setStep("search")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="gradient-text">
              {step === "search" ? "Satış — Cihaz Seç" : `Satış: ${selectedDevice?.brandName} ${selectedDevice?.modelName}`}
            </span>
            <Badge variant="outline" className="text-xs font-mono ml-auto">F2</Badge>
          </DialogTitle>
        </DialogHeader>

        {step === "search" ? (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Marka, model veya barkod ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
              {loadingDevices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : devices.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {query ? "Cihaz bulunamadı" : "Arama yapın veya tüm cihazları görmek için boş bırakın"}
                </div>
              ) : (
                devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => { setSelectedDevice(device); setStep("form"); }}
                    className="w-full text-left rounded-lg px-4 py-3 transition-all duration-100 flex items-center justify-between gap-3 hover:bg-primary/10 hover:border-primary/30 border border-transparent cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Smartphone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{device.brandName} {device.modelName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {device.storageName} · {device.colorName}
                          {device.barcode && ` · ${device.barcode}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {device.purchasePrice != null && (
                        <span className="text-xs text-muted-foreground tabular-nums">{formatCurrency(device.purchasePrice)}</span>
                      )}
                      <Badge className="text-green-400 border-green-400/30 bg-green-400/10">Stokta</Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="animate-slide-in-right">
            <SatisForm
              deviceId={selectedDevice!.id}
              devicePurchasePrice={selectedDevice!.purchasePrice}
              onSuccess={() => {
                toast.success("Satış başarıyla kaydedildi.");
                onClose();
                router.refresh();
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ShortcutModals() {
  const [alisOpen, setAlisOpen] = useState(false);
  const [satisOpen, setSatisOpen] = useState(false);

  const handlers = useCallback(
    () => ({
      onF1: () => { setSatisOpen(false); setAlisOpen((v) => !v); },
      onF2: () => { setAlisOpen(false); setSatisOpen((v) => !v); },
      onEscape: () => { setAlisOpen(false); setSatisOpen(false); },
    }),
    []
  );

  useKeyboardShortcuts(handlers());

  return (
    <>
      <AlisModal open={alisOpen} onClose={() => setAlisOpen(false)} />
      <SatisModal open={satisOpen} onClose={() => setSatisOpen(false)} />
    </>
  );
}
