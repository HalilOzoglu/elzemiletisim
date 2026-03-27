"use server";

import { createClient } from './server'
import type { ListItem } from '@/types'

export async function createListItem(data: {
  categoryId: string
  value: string
  parentId?: string
}): Promise<ListItem> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('list_items')
    .insert({
      category_id: data.categoryId,
      value: data.value,
      parent_id: data.parentId ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return {
    id: row.id,
    categoryId: row.category_id,
    parentId: row.parent_id ?? undefined,
    value: row.value,
    createdAt: row.created_at,
  }
}

export async function updateListItem(id: string, value: string): Promise<ListItem> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('list_items')
    .update({ value })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return {
    id: row.id,
    categoryId: row.category_id,
    parentId: row.parent_id ?? undefined,
    value: row.value,
    createdAt: row.created_at,
  }
}

export async function deleteListItem(id: string): Promise<void> {
  const supabase = await createClient()

  const { count, error: checkError } = await supabase
    .from('devices')
    .select('id', { count: 'exact', head: true })
    .or(
      `brand_id.eq.${id},model_id.eq.${id},storage_id.eq.${id},color_id.eq.${id},yd_status_id.eq.${id},purchase_type_id.eq.${id}`
    )

  if (checkError) throw new Error(checkError.message)
  if (count && count > 0) {
    throw new Error('Bu öğe mevcut cihaz kayıtlarında kullanılıyor, silinemez.')
  }

  const { error } = await supabase.from('list_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
