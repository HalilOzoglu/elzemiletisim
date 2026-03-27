export const dynamic = 'force-dynamic';

import { getListCategories, getListItemsByCategory } from "@/lib/supabase/lists";
import type { ListItem } from "@/types";
import { YeniCihazClient } from "./YeniCihazClient";

export default async function YeniCihazPage() {
  const categories = await getListCategories();

  const itemsByCategory: Record<string, ListItem[]> = {};
  await Promise.all(
    categories.map(async (cat) => {
      itemsByCategory[cat.id] = await getListItemsByCategory(cat.id);
    })
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Yeni Cihaz Ekle</h1>
        <p className="text-sm text-muted-foreground mt-1">Cihaz bilgilerini doldurun, barkod otomatik oluşturulur.</p>
      </div>
      <div className="glass-card rounded-xl p-6">
        <YeniCihazClient categories={categories} itemsByCategory={itemsByCategory} />
      </div>
    </div>
  );
}
