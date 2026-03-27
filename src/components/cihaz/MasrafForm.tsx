"use client";

import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { createExpense } from "@/lib/supabase/device-actions";
import { calculateTotalExpenses } from "@/lib/utils/calculations";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Expense } from "@/types";

const masrafSchema = z.object({
  expenses: z.array(
    z.object({
      amount: z.number().min(0.01, "Tutar 0'dan büyük olmalıdır"),
      description: z.string().min(1, "Açıklama zorunludur"),
    })
  ),
});

type MasrafFormValues = z.infer<typeof masrafSchema>;

interface MasrafFormProps {
  deviceId: string;
  existingExpenses?: Expense[];
  onSuccess?: () => void;
}

export function MasrafForm({ deviceId, existingExpenses = [], onSuccess }: MasrafFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MasrafFormValues>({
    resolver: zodResolver(masrafSchema),
    defaultValues: {
      expenses: [{ amount: 0, description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "expenses" });
  const watchedExpenses = useWatch({ control, name: "expenses" });

  const newTotal = calculateTotalExpenses(
    (watchedExpenses ?? []).map((e) => ({ amount: Number(e?.amount) || 0 }))
  );
  const existingTotal = calculateTotalExpenses(existingExpenses);
  const grandTotal = existingTotal + newTotal;

  async function onSubmit(data: MasrafFormValues) {
    try {
      await Promise.all(
        data.expenses.map((expense) =>
          createExpense({ deviceId, amount: expense.amount, description: expense.description })
        )
      );
      toast.success("Masraflar başarıyla kaydedildi.");
      onSuccess?.();
    } catch {
      toast.error("Masraflar kaydedilirken bir hata oluştu.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-start p-4 rounded-lg border border-white/5 bg-white/3"
          >
            <Controller
              name={`expenses.${index}.amount`}
              control={control}
              render={({ field: f, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`expenses.${index}.amount`}>Tutar (TL)</FieldLabel>
                  <Input
                    id={`expenses.${index}.amount`}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid}
                    value={f.value === 0 ? "" : f.value}
                    onChange={(e) => f.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name={`expenses.${index}.description`}
              control={control}
              render={({ field: f, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`expenses.${index}.description`}>Açıklama</FieldLabel>
                  <Input
                    id={`expenses.${index}.description`}
                    placeholder="Masraf açıklaması"
                    aria-invalid={fieldState.invalid}
                    {...f}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            {fields.length > 0 && (
              <div className="flex items-end pb-0.5 md:pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                  aria-label="Masrafı sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ amount: 0, description: "" })}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Masraf Ekle
      </Button>

      <div className="glass-card rounded-xl p-4">
        <p className="text-sm font-semibold mb-3">Masraf Özeti</p>
        <div className="space-y-1 text-sm">
          {existingExpenses.length > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Mevcut masraflar</span>
              <span>{formatCurrency(existingTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Yeni masraflar</span>
            <span>{formatCurrency(newTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground border-t border-white/5 pt-2 mt-2">
            <span>Toplam</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Kaydediliyor...
          </>
        ) : (
          "Masrafları Kaydet"
        )}
      </Button>
    </form>
  );
}
