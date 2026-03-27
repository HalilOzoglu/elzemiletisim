export const dynamic = 'force-dynamic';

import { getListCategories, getListItemsByCategory } from "@/lib/supabase/lists";
import { ListeYonetimSayfasi } from "@/components/liste/ListeYonetimSayfasi";
import type { ListCategory, ListItem } from "@/types";

export default async function ListeYonetimiPage() {
  const categories = await getListCategories();

  const itemsByCategory: Record<string, ListItem[]> = {};
  await Promise.all(
    categories.map(async (cat: ListCategory) => {
      itemsByCategory[cat.id] = await getListItemsByCategory(cat.id);
    })
  );

  return (
    <ListeYonetimSayfasi
      categories={categories}
      itemsByCategory={itemsByCategory}
    />
  );
}
