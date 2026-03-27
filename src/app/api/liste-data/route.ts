import { NextResponse } from "next/server";
import { getListCategories, getListItemsByCategory } from "@/lib/supabase/lists";
import type { ListItem } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getListCategories();
    const itemsByCategory: Record<string, ListItem[]> = {};
    await Promise.all(
      categories.map(async (cat) => {
        itemsByCategory[cat.id] = await getListItemsByCategory(cat.id);
      })
    );
    return NextResponse.json({ categories, itemsByCategory });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Veri yüklenemedi" }, { status: 500 });
  }
}
