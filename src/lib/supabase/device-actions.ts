"use server";

import { createClient } from './server'
import type { Device, Expense, Sale } from '@/types'

// ---------------------------------------------------------------------------
// Device helpers
// ---------------------------------------------------------------------------

type DeviceRow = {
  id: string
  barcode: string | null
  brand_id: string
  model_id: string
  storage_id: string
  color_id: string
  yd_status_id: string
  purchase_type_id: string
  invoice_type: 'AF' | 'MF'
  condition: 'sifir' | 'ikinci_el'
  warranty_months: number | null
  purchase_date: string | null
  purchase_price: number | null
  supplier_type: 'musteri' | 'firma' | null
  supplier_name: string | null
  supplier_surname: string | null
  supplier_phone: string | null
  supplier_company: string | null
  suggested_price: number | null
  is_sold: boolean
  created_at: string | null
  updated_at: string | null
}

function rowToDevice(row: DeviceRow): Device {
  return {
    id: row.id,
    barcode: row.barcode ?? undefined,
    brandId: row.brand_id,
    modelId: row.model_id,
    storageId: row.storage_id,
    colorId: row.color_id,
    ydStatusId: row.yd_status_id,
    purchaseTypeId: row.purchase_type_id,
    invoiceType: row.invoice_type,
    condition: row.condition,
    warrantyMonths: row.warranty_months ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
    purchasePrice: row.purchase_price ?? undefined,
    supplierType: row.supplier_type ?? undefined,
    supplierName: row.supplier_name ?? undefined,
    supplierSurname: row.supplier_surname ?? undefined,
    supplierPhone: row.supplier_phone ?? undefined,
    supplierCompany: row.supplier_company ?? undefined,
    suggestedPrice: row.suggested_price ?? undefined,
    isSold: row.is_sold,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }
}

function deviceToRow(data: Partial<Omit<Device, 'id' | 'createdAt'>>) {
  const row: Record<string, unknown> = {}
  if (data.barcode !== undefined) row.barcode = data.barcode
  if (data.brandId !== undefined) row.brand_id = data.brandId
  if (data.modelId !== undefined) row.model_id = data.modelId
  if (data.storageId !== undefined) row.storage_id = data.storageId
  if (data.colorId !== undefined) row.color_id = data.colorId
  if (data.ydStatusId !== undefined) row.yd_status_id = data.ydStatusId
  if (data.purchaseTypeId !== undefined) row.purchase_type_id = data.purchaseTypeId
  if (data.invoiceType !== undefined) row.invoice_type = data.invoiceType
  if (data.condition !== undefined) row.condition = data.condition
  if (data.warrantyMonths !== undefined) row.warranty_months = data.warrantyMonths
  if (data.purchaseDate !== undefined) row.purchase_date = data.purchaseDate
  if (data.purchasePrice !== undefined) row.purchase_price = data.purchasePrice
  if (data.supplierType !== undefined) row.supplier_type = data.supplierType
  if (data.supplierName !== undefined) row.supplier_name = data.supplierName
  if (data.supplierSurname !== undefined) row.supplier_surname = data.supplierSurname
  if (data.supplierPhone !== undefined) row.supplier_phone = data.supplierPhone
  if (data.supplierCompany !== undefined) row.supplier_company = data.supplierCompany
  if (data.suggestedPrice !== undefined) row.suggested_price = data.suggestedPrice
  if (data.isSold !== undefined) row.is_sold = data.isSold
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt
  return row
}

// ---------------------------------------------------------------------------
// Device actions
// ---------------------------------------------------------------------------

export async function createDevice(
  data: Omit<Device, 'id' | 'isSold' | 'createdAt' | 'updatedAt'>
): Promise<Device> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('devices')
    .insert({ ...deviceToRow(data), is_sold: false })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToDevice(row as DeviceRow)
}

export async function updateDevice(
  id: string,
  data: Partial<Omit<Device, 'id' | 'createdAt'>>
): Promise<Device> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('devices')
    .update(deviceToRow(data))
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToDevice(row as DeviceRow)
}

export async function getDeviceByBarcode(
  barcode: string
): Promise<(Device & { brandName?: string; modelName?: string }) | null> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('devices')
    .select(`*, brand:list_items!brand_id(value), model:list_items!model_id(value)`)
    .eq('barcode', barcode)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  const r = row as DeviceRow & {
    brand: { value: string } | null
    model: { value: string } | null
  }
  return {
    ...rowToDevice(r),
    brandName: r.brand?.value,
    modelName: r.model?.value,
  }
}

// ---------------------------------------------------------------------------
// Expense actions
// ---------------------------------------------------------------------------

export async function createExpense(data: {
  deviceId: string
  amount: number
  description: string
}): Promise<Expense> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('expenses')
    .insert({
      device_id: data.deviceId,
      amount: data.amount,
      description: data.description,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return {
    id: row.id,
    deviceId: row.device_id,
    amount: row.amount,
    description: row.description,
    createdAt: row.created_at ?? undefined,
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Sale actions
// ---------------------------------------------------------------------------

export async function updateAfSubStatus(
  saleId: string,
  status: 'kesildi' | 'bekliyor'
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sales')
    .update({ af_sub_status: status })
    .eq('id', saleId)
  if (error) throw new Error(error.message)
}

export async function createSale(data: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
  const supabase = await createClient()

  const { data: row, error } = await supabase
    .from('sales')
    .insert({
      device_id: data.deviceId,
      customer_name: data.customerName,
      customer_surname: data.customerSurname,
      customer_phone: data.customerPhone,
      sale_method: data.saleMethod,
      invoice_status: data.invoiceStatus,
      af_sub_status: data.afSubStatus ?? null,
      sale_price: data.salePrice,
      gross_price: data.grossPrice ?? null,
      commission_rate: data.commissionRate ?? null,
      sale_date: data.saleDate,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const { error: updateError } = await supabase
    .from('devices')
    .update({ is_sold: true })
    .eq('id', data.deviceId)

  if (updateError) throw new Error(updateError.message)

  return {
    id: row.id,
    deviceId: row.device_id,
    customerName: row.customer_name,
    customerSurname: row.customer_surname,
    customerPhone: row.customer_phone,
    saleMethod: row.sale_method,
    invoiceStatus: row.invoice_status,
    afSubStatus: row.af_sub_status ?? undefined,
    salePrice: row.sale_price,
    grossPrice: row.gross_price ?? undefined,
    commissionRate: row.commission_rate ?? undefined,
    saleDate: row.sale_date,
    createdAt: row.created_at ?? undefined,
  }
}
