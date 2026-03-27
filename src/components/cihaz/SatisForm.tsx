"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { createSale } from "@/lib/supabase/device-actions";
import { calculateGrossPrice } from "@/lib/utils/calculations";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Sale } from "@/types";

const satisSchema = z
  .object({
    customerName: z.string().min(1, "İsim zorunludur"),
    customerSurname: z.string().min(1, "Soyisim zorunludur"),
    customerPhone: z.string().min(1, "Telefon zorunludur"),
    saleDate: z.string().min(1, "Tarih zorunludur"),
    salePrice: z.number().min(0.01, "Satış fiyatı zorunludur"),
    saleMethod: z.enum(["nakit", "havale", "kredi_karti"]),
    invoiceStatus: z.enum(["AF", "MF"]),
    afSubStatus: z.enum(["kesildi", "bekliyor"]).optional(),
    commissionRate: z.number().optional(),
    grossPrice: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.invoiceStatus === "AF" && !data.afSubStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AF alt durumu zorunludur",
        path: ["afSubStatus"],
      });
    }
    if (data.saleMethod === "kredi_karti" && !data.commissionRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Komisyon oranı zorunludur",
        path: ["commissionRate"],
      });
    }
  });

type SatisFormValues = z.infer<typeof satisSchema>;

interface SatisFormProps {
  deviceId: string;
  devicePurchasePrice?: number;
  onSuccess?: (sale: Sale) => void;
}

export function SatisForm({ deviceId, onSuccess }: SatisFormProps) {
  const [komisyonDialogOpen, setKomisyonDialogOpen] = useState(false);
  const [komisyonOrani, setKomisyonOrani] = useState<number>(0);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<SatisFormValues>({
    resolver: zodResolver(satisSchema),
    defaultValues: {
      customerName: "",
      customerSurname: "",
      customerPhone: "",
      saleDate: new Date().toISOString().split("T")[0],
      salePrice: 0,
      saleMethod: "nakit",
      invoiceStatus: "MF",
      afSubStatus: undefined,
      commissionRate: undefined,
      grossPrice: undefined,
    },
  });

  const saleMethod = useWatch({ control, name: "saleMethod" });
  const invoiceStatus = useWatch({ control, name: "invoiceStatus" });
  const salePrice = useWatch({ control, name: "salePrice" });

  const brut = calculateGrossPrice(salePrice || 0, komisyonOrani || 0);

  function handleKomisyonOnayla() {
    setValue("commissionRate", komisyonOrani);
    setValue("grossPrice", brut);
    setKomisyonDialogOpen(false);
  }

  async function onSubmit(data: SatisFormValues) {
    try {
      const sale = await createSale({
        deviceId,
        customerName: data.customerName,
        customerSurname: data.customerSurname,
        customerPhone: data.customerPhone,
        saleDate: data.saleDate,
        salePrice: data.salePrice,
        saleMethod: data.saleMethod,
        invoiceStatus: data.invoiceStatus,
        afSubStatus: data.afSubStatus,
        commissionRate: data.commissionRate,
        grossPrice: data.grossPrice,
      });
      toast.success("Satış başarıyla kaydedildi.");
      onSuccess?.(sale);
    } catch {
      toast.error("Satış kaydedilirken bir hata oluştu.");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Müşteri İsim */}
          <Controller
            name="customerName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customerName">Müşteri İsim</FieldLabel>
                <Input
                  id="customerName"
                  placeholder="İsim"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* Müşteri Soyisim */}
          <Controller
            name="customerSurname"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customerSurname">Müşteri Soyisim</FieldLabel>
                <Input
                  id="customerSurname"
                  placeholder="Soyisim"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* Müşteri Telefon */}
          <Controller
            name="customerPhone"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customerPhone">Müşteri Telefon</FieldLabel>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="05xx xxx xx xx"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* Satış Tarihi */}
          <Controller
            name="saleDate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="saleDate">Satış Tarihi</FieldLabel>
                <DateInput
                  id="saleDate"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* Satış Fiyatı */}
          <Controller
            name="salePrice"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="salePrice">Satış Fiyatı (₺)</FieldLabel>
                <Input
                  id="salePrice"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={fieldState.invalid}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* Satış Yöntemi */}
          <Controller
            name="saleMethod"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Satış Yöntemi</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val === "kredi_karti") {
                      setKomisyonOrani(0);
                      setKomisyonDialogOpen(true);
                    }
                  }}
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nakit">Nakit</SelectItem>
                    <SelectItem value="havale">Havale</SelectItem>
                    <SelectItem value="kredi_karti">Kredi Kartı</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* Fatura Durumu */}
          <Controller
            name="invoiceStatus"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Fatura Durumu</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AF">AF (Alıcı Faturası)</SelectItem>
                    <SelectItem value="MF">MF (Müşteri Faturası)</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* AF Alt Durum — sadece invoiceStatus "AF" ise göster */}
          {invoiceStatus === "AF" && (
            <Controller
              name="afSubStatus"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>AF Alt Durum</FieldLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kesildi">Kesildi</SelectItem>
                      <SelectItem value="bekliyor">Bekliyor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}
        </div>

        {/* Kredi kartı komisyon özeti */}
        {saleMethod === "kredi_karti" && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Komisyon Oranı</span>
              <span>%{komisyonOrani}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Müşteriden Çekilecek Tutar</span>
              <span>{formatCurrency(brut)}</span>
            </div>
            <div className="flex justify-between font-medium text-foreground">
              <span>Hesabınıza Geçecek Tutar</span>
              <span>{formatCurrency(salePrice || 0)}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setKomisyonDialogOpen(true)}
            >
              Komisyon Oranını Düzenle
            </Button>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Kaydediliyor...
            </>
          ) : (
            "Satışı Kaydet"
          )}
        </Button>
      </form>

      {/* Kredi Kartı Komisyon Dialog */}
      <Dialog open={komisyonDialogOpen} onOpenChange={setKomisyonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kredi Kartı Komisyon Oranı</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="komisyonOrani" className="text-sm font-medium">
                Komisyon Oranı (%)
              </label>
              <Input
                id="komisyonOrani"
                type="number"
                min={0}
                step="0.01"
                placeholder="Örn: 2.5"
                value={komisyonOrani === 0 ? "" : komisyonOrani}
                onChange={(e) =>
                  setKomisyonOrani(e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Müşteriden Çekilecek Tutar</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(calculateGrossPrice(salePrice || 0, komisyonOrani || 0))}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Hesabınıza Geçecek Tutar</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(salePrice || 0)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleKomisyonOnayla}>
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
