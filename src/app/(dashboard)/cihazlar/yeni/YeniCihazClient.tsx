"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CihazForm, type CihazFormValues } from "@/components/cihaz/CihazForm";
import { createDevice } from "@/lib/supabase/device-actions";
import type { ListCategory, ListItem } from "@/types";

interface YeniCihazClientProps {
  categories: ListCategory[];
  itemsByCategory: Record<string, ListItem[]>;
}

export function YeniCihazClient({ categories, itemsByCategory }: YeniCihazClientProps) {
  const router = useRouter();

  async function handleSubmit(data: CihazFormValues) {
    try {
      const device = await createDevice(data);
      router.push(`/cihazlar/${device.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cihaz kaydedilirken bir hata oluştu.");
    }
  }

  return (
    <CihazForm
      categories={categories}
      itemsByCategory={itemsByCategory}
      onSubmit={handleSubmit}
    />
  );
}
