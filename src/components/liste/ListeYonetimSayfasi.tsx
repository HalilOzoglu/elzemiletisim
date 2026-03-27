"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import {
  createListItem,
  updateListItem,
  deleteListItem,
} from "@/lib/supabase/list-actions";
import type { ListCategory, ListItem } from "@/types";

// ---------------------------------------------------------------------------
// Types & schema
// ---------------------------------------------------------------------------

interface Props {
  categories: ListCategory[];
  itemsByCategory: Record<string, ListItem[]>;
}

const CATEGORY_SLUGS = [
  "brand",
  "model",
  "storage",
  "color",
  "yd_status",
  "purchase_type",
  "sale_method",
] as const;

const SLUG_LABELS: Record<string, string> = {
  brand: "Marka",
  model: "Model",
  storage: "Hafıza",
  color: "Renk",
  yd_status: "YD Durumu",
  purchase_type: "Alım Şekli",
  sale_method: "Satış Yöntemi",
};

const formSchema = z.object({
  value: z.string().min(1, "Bu alan zorunludur"),
  parentId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ListeYonetimSayfasi({ categories, itemsByCategory }: Props) {
  const router = useRouter();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: "", parentId: undefined },
  });

  // Ordered categories (only known slugs, in display order)
  const orderedCategories = CATEGORY_SLUGS.flatMap((slug) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat ? [cat] : [];
  });

  const defaultTab = orderedCategories[0]?.id ?? "";

  // Brand category (for model parent select)
  const brandCategory = categories.find((c) => c.slug === "brand");
  const brandItems = brandCategory ? (itemsByCategory[brandCategory.id] ?? []) : [];

  function openAddDialog(categoryId: string) {
    setEditingItem(null);
    setActiveCategoryId(categoryId);
    reset({ value: "", parentId: undefined });
    setDialogOpen(true);
  }

  function openEditDialog(item: ListItem, categoryId: string) {
    setEditingItem(item);
    setActiveCategoryId(categoryId);
    reset({ value: item.value, parentId: item.parentId ?? undefined });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editingItem) {
        await updateListItem(editingItem.id, values.value);
        toast.success("Öğe başarıyla güncellendi.");
      } else {
        const activeCategory = categories.find((c) => c.id === activeCategoryId);
        await createListItem({
          categoryId: activeCategoryId,
          value: values.value,
          parentId:
            activeCategory?.slug === "model" ? values.parentId : undefined,
        });
        toast.success("Öğe başarıyla eklendi.");
      }
      setDialogOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bir hata oluştu.";
      toast.error(message);
    }
  }

  async function handleDelete(item: ListItem) {
    try {
      await deleteListItem(item.id);
      toast.success("Öğe başarıyla silindi.");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bir hata oluştu.";
      toast.error(message);
    }
  }

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const isModelCategory = activeCategory?.slug === "model";
  const dialogTitle = editingItem
    ? `${SLUG_LABELS[activeCategory?.slug ?? ""] ?? "Öğe"} Düzenle`
    : `Yeni ${SLUG_LABELS[activeCategory?.slug ?? ""] ?? "Öğe"} Ekle`;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Liste Yönetimi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Açılır menü seçeneklerini buradan yönetebilirsiniz.
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 mb-4 bg-white/5 border border-white/10 p-1">
          {orderedCategories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
              {SLUG_LABELS[cat.slug] ?? cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {orderedCategories.map((cat) => {
          const items = itemsByCategory[cat.id] ?? [];
          return (
            <TabsContent key={cat.id} value={cat.id}>
              <CategoryTab
                category={cat}
                items={items}
                brandItems={brandItems}
                onAdd={() => openAddDialog(cat.id)}
                onEdit={(item) => openEditDialog(item, cat.id)}
                onDelete={handleDelete}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Model category: show brand (parent) select */}
            {isModelCategory && !editingItem && (
              <Controller
                name="parentId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="parentId">Marka</FieldLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="parentId"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Marka seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandItems.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}

            <Controller
              name="value"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="value">Değer</FieldLabel>
                  <Input
                    id="value"
                    placeholder="Değer girin"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryTab sub-component
// ---------------------------------------------------------------------------

interface CategoryTabProps {
  category: ListCategory;
  items: ListItem[];
  brandItems: ListItem[];
  onAdd: () => void;
  onEdit: (item: ListItem) => void;
  onDelete: (item: ListItem) => void;
}

function CategoryTab({
  category,
  items,
  brandItems,
  onAdd,
  onEdit,
  onDelete,
}: CategoryTabProps) {
  const isModel = category.slug === "model";

  return (
    <div className="rounded-lg border border-white/5 glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-medium text-muted-foreground">
          {items.length} öğe
        </span>
        <Button size="sm" onClick={onAdd} className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
          <Plus className="h-4 w-4 mr-1" />
          Yeni Ekle
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Henüz öğe eklenmemiş.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Değer</TableHead>
              {isModel && <TableHead>Marka</TableHead>}
              <TableHead className="w-24 text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const parentBrand = isModel
                ? brandItems.find((b) => b.id === item.parentId)
                : undefined;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.value}</TableCell>
                  {isModel && (
                    <TableCell className="text-muted-foreground text-sm">
                      {parentBrand?.value ?? "—"}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(item)}
                        aria-label="Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(item)}
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
