"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { useEffect } from "react";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { generateUniqueBarcode } from "@/lib/utils/barcode";
import { createClient } from "@/lib/supabase/client";
import type { ListCategory, ListItem } from "@/types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const cihazFormSchema = z
  .object({
    brandId: z.string().min(1, "Marka zorunludur"),
    modelId: z.string().min(1, "Model zorunludur"),
    storageId: z.string().min(1, "Hafıza zorunludur"),
    colorId: z.string().min(1, "Renk zorunludur"),
    ydStatusId: z.string().min(1, "YD Durumu zorunludur"),
    purchaseTypeId: z.string().min(1, "Alım şekli zorunludur"),
    invoiceType: z.enum(["AF", "MF"]),
    condition: z.enum(["sifir", "ikinci_el"]),
    warrantyMonths: z.number().optional(),
    purchaseDate: z.string().optional(),
    purchasePrice: z.number().optional(),
    suggestedPrice: z.number().optional(),
    barcode: z.string().optional(),
    supplierType: z.enum(["musteri", "firma"]).optional(),
    supplierName: z.string().optional(),
    supplierSurname: z.string().optional(),
    supplierPhone: z.string().optional(),
    supplierCompany: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.supplierType === "musteri") {
      if (!data.supplierName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "İsim zorunludur", path: ["supplierName"] });
      if (!data.supplierSurname?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Soyisim zorunludur", path: ["supplierSurname"] });
      if (!data.supplierPhone?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefon zorunludur", path: ["supplierPhone"] });
    }
    if (data.supplierType === "firma") {
      if (!data.supplierCompany?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Firma adı zorunludur", path: ["supplierCompany"] });
    }
  });

export type CihazFormValues = z.infer<typeof cihazFormSchema>;

interface CihazFormProps {
  categories: ListCategory[];
  itemsByCategory: Record<string, ListItem[]>;
  onSubmit: (data: CihazFormValues) => Promise<void>;
  defaultValues?: Partial<CihazFormValues>;
  isLoading?: boolean;
}

function getCategoryItems(categories: ListCategory[], itemsByCategory: Record<string, ListItem[]>, slug: string): ListItem[] {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  return itemsByCategory[cat.id] ?? [];
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function CihazForm({ categories, itemsByCategory, onSubmit, defaultValues, isLoading }: CihazFormProps) {
  const { control, handleSubmit, setValue, formState: { isSubmitting } } = useForm<CihazFormValues>({
    resolver: zodResolver(cihazFormSchema),
    defaultValues: {
      brandId: "",
      modelId: "",
      storageId: "",
      colorId: "",
      ydStatusId: "",
      purchaseTypeId: "",
      invoiceType: "MF",
      condition: "sifir",
      purchaseDate: today(),
      ...defaultValues,
    },
  });

  const selectedBrandId = useWatch({ control, name: "brandId" });
  const selectedCondition = useWatch({ control, name: "condition" });
  const selectedSupplierType = useWatch({ control, name: "supplierType" });

  // Otomatik barkod üretimi
  useEffect(() => {
    async function initBarcode() {
      try {
        const supabase = createClient();
        const barcode = await generateUniqueBarcode(async (b) => {
          const { count } = await supabase
            .from("devices")
            .select("id", { count: "exact", head: true })
            .eq("barcode", b);
          return (count ?? 0) > 0;
        });
        setValue("barcode", barcode);
      } catch {
        toast.error("Barkod üretilemedi, manuel girin.");
      }
    }
    if (!defaultValues?.barcode) initBarcode();
  }, []);

  const allModels = getCategoryItems(categories, itemsByCategory, "model");
  const filteredModels = selectedBrandId ? allModels.filter((m) => m.parentId === selectedBrandId) : allModels;
  const brands = getCategoryItems(categories, itemsByCategory, "brand");
  const storages = getCategoryItems(categories, itemsByCategory, "storage");
  const colors = getCategoryItems(categories, itemsByCategory, "color");
  const ydStatuses = getCategoryItems(categories, itemsByCategory, "yd_status");
  const purchaseTypes = getCategoryItems(categories, itemsByCategory, "purchase_type");

  const loading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Marka */}
        <Controller name="brandId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="brandId">Marka</FieldLabel>
            <Select value={field.value} onValueChange={(val) => { field.onChange(val); setValue("modelId", ""); }}>
              <SelectTrigger id="brandId" aria-invalid={fieldState.invalid} autoFocus>
                <SelectValue placeholder="Marka seçin" />
              </SelectTrigger>
              <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.value}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Model */}
        <Controller name="modelId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="modelId">Model</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="modelId" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Model seçin" />
              </SelectTrigger>
              <SelectContent>{filteredModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.value}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Hafıza */}
        <Controller name="storageId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="storageId">Hafıza</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="storageId" aria-invalid={fieldState.invalid}><SelectValue placeholder="Hafıza seçin" /></SelectTrigger>
              <SelectContent>{storages.map((s) => <SelectItem key={s.id} value={s.id}>{s.value}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Renk */}
        <Controller name="colorId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="colorId">Renk</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="colorId" aria-invalid={fieldState.invalid}><SelectValue placeholder="Renk seçin" /></SelectTrigger>
              <SelectContent>{colors.map((c) => <SelectItem key={c.id} value={c.id}>{c.value}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* YD Durumu */}
        <Controller name="ydStatusId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="ydStatusId">YD Durumu</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="ydStatusId" aria-invalid={fieldState.invalid}><SelectValue placeholder="YD Durumu seçin" /></SelectTrigger>
              <SelectContent>{ydStatuses.map((y) => <SelectItem key={y.id} value={y.id}>{y.value}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Alım Şekli */}
        <Controller name="purchaseTypeId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="purchaseTypeId">Alım Şekli</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="purchaseTypeId" aria-invalid={fieldState.invalid}><SelectValue placeholder="Alım şekli seçin" /></SelectTrigger>
              <SelectContent>{purchaseTypes.map((p) => <SelectItem key={p.id} value={p.id}>{p.value}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Fatura Türü */}
        <Controller name="invoiceType" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="invoiceType">Fatura Türü</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="invoiceType" aria-invalid={fieldState.invalid}><SelectValue placeholder="Fatura türü seçin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AF">AF (Açık Fatura)</SelectItem>
                <SelectItem value="MF">MF (Faturasız)</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Durum */}
        <Controller name="condition" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="condition">Durum</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="condition" aria-invalid={fieldState.invalid}><SelectValue placeholder="Durum seçin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sifir">Sıfır</SelectItem>
                <SelectItem value="ikinci_el">İkinci El</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Garanti */}
        <Controller name="warrantyMonths" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="warrantyMonths">Garanti Süresi (Ay)</FieldLabel>
            <Input id="warrantyMonths" type="number" min={0} placeholder="Ay sayısı"
              disabled={selectedCondition !== "ikinci_el"} aria-invalid={fieldState.invalid}
              value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Alış Tarihi */}
        <Controller name="purchaseDate" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="purchaseDate">Alış Tarihi</FieldLabel>
            <DateInput id="purchaseDate" value={field.value ?? ""} onChange={field.onChange} aria-invalid={fieldState.invalid} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Alış Fiyatı */}
        <Controller name="purchasePrice" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="purchasePrice">Alış Fiyatı (₺)</FieldLabel>
            <Input id="purchasePrice" type="number" min={0} step="0.01" placeholder="0.00" aria-invalid={fieldState.invalid}
              value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Önerilen Satış Fiyatı */}
        <Controller name="suggestedPrice" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="suggestedPrice">Önerilen Satış Fiyatı (₺)</FieldLabel>
            <Input id="suggestedPrice" type="number" min={0} step="0.01" placeholder="0.00" aria-invalid={fieldState.invalid}
              value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Barkod */}
        <Controller name="barcode" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="barcode">Barkod</FieldLabel>
            <Input id="barcode" placeholder="Otomatik oluşturuluyor..." aria-invalid={fieldState.invalid}
              {...field} value={field.value ?? ""}
              onBlur={async (e) => {
                field.onBlur();
                if (!e.target.value.trim()) {
                  try {
                    const supabase = createClient();
                    const barcode = await generateUniqueBarcode(async (b) => {
                      const { count } = await supabase.from("devices").select("id", { count: "exact", head: true }).eq("barcode", b);
                      return (count ?? 0) > 0;
                    });
                    setValue("barcode", barcode);
                  } catch { /* ignore */ }
                }
              }}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />

        {/* Tedarikçi Türü */}
        <Controller name="supplierType" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="supplierType">Tedarikçi Türü</FieldLabel>
            <Select value={field.value ?? ""} onValueChange={(val) => field.onChange(val === "" ? undefined : val)}>
              <SelectTrigger id="supplierType" aria-invalid={fieldState.invalid}><SelectValue placeholder="Tedarikçi türü seçin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="musteri">Müşteri</SelectItem>
                <SelectItem value="firma">Firma</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )} />
      </div>

      {/* Müşteri tedarikçi */}
      {selectedSupplierType === "musteri" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <Controller name="supplierName" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="supplierName">Tedarikçi İsim</FieldLabel>
              <Input id="supplierName" placeholder="İsim" aria-invalid={fieldState.invalid} {...field} value={field.value ?? ""} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )} />
          <Controller name="supplierSurname" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="supplierSurname">Tedarikçi Soyisim</FieldLabel>
              <Input id="supplierSurname" placeholder="Soyisim" aria-invalid={fieldState.invalid} {...field} value={field.value ?? ""} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )} />
          <Controller name="supplierPhone" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="supplierPhone">Tedarikçi Telefon</FieldLabel>
              <Input id="supplierPhone" placeholder="05xx xxx xx xx" aria-invalid={fieldState.invalid} {...field} value={field.value ?? ""} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )} />
        </div>
      )}

      {/* Firma tedarikçi */}
      {selectedSupplierType === "firma" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <Controller name="supplierCompany" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="supplierCompany">Firma Adı</FieldLabel>
              <Input id="supplierCompany" placeholder="Firma adı" aria-invalid={fieldState.invalid} {...field} value={field.value ?? ""} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )} />
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full md:w-auto bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-150 active:scale-[0.97]">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Kaydediliyor...</> : "Cihazı Kaydet"}
      </Button>
    </form>
  );
}
