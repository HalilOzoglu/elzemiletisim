import { createClient } from './server'
import type { Device, DeviceFilters } from '@/types'

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

const DEVICE_WITH_NAMES_SELECT = `
  *,
  brand:list_items!brand_id(value),
  model:list_items!model_id(value),
  storage:list_items!storage_id(value),
  color:list_items!color_id(value),
  yd_status:list_items!yd_status_id(value),
  purchase_type:list_items!purchase_type_id(value)
`

type DeviceWithNamesRow = DeviceRow & {
  brand: { value: string } | null
  model: { value: string } | null
  storage: { value: string } | null
  color: { value: string } | null
  yd_status: { value: string } | null
  purchase_type: { value: string } | null
}

function rowToDeviceWithNames(row: DeviceWithNamesRow): Device & {
  brandName?: string
  modelName?: string
  storageName?: string
  colorName?: string
  ydStatusName?: string
  purchaseTypeName?: string
} {
  return {
    ...rowToDevice(row),
    brandName: row.brand?.value,
    modelName: row.model?.value,
    storageName: row.storage?.value,
    colorName: row.color?.value,
    ydStatusName: row.yd_status?.value,
    purchaseTypeName: row.purchase_type?.value,
  }
}

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

export async function getDeviceById(id: string): Promise<Device & {
  brandName?: string
  modelName?: string
  storageName?: string
  colorName?: string
  ydStatusName?: string
  purchaseTypeName?: string
}> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('devices')
    .select(DEVICE_WITH_NAMES_SELECT)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return rowToDeviceWithNames(row as DeviceWithNamesRow)
}

export async function getDeviceByBarcode(
  barcode: string
): Promise<(Device & {
  brandName?: string
  modelName?: string
  storageName?: string
  colorName?: string
  ydStatusName?: string
  purchaseTypeName?: string
}) | null> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('devices')
    .select(DEVICE_WITH_NAMES_SELECT)
    .eq('barcode', barcode)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  return rowToDeviceWithNames(row as DeviceWithNamesRow)
}

export async function getDevices(
  filters?: DeviceFilters
): Promise<{ devices: (Device & { brandName?: string; modelName?: string; storageName?: string; colorName?: string; ydStatusName?: string; purchaseTypeName?: string })[]; total: number }> {
  const supabase = await createClient()
  const page = filters?.page ?? 1
  const pageSize = filters?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('devices')
    .select(DEVICE_WITH_NAMES_SELECT, { count: 'exact' })

  if (filters?.brandId) query = query.eq('brand_id', filters.brandId)
  if (filters?.modelId) query = query.eq('model_id', filters.modelId)
  if (filters?.storageId) query = query.eq('storage_id', filters.storageId)
  if (filters?.colorId) query = query.eq('color_id', filters.colorId)
  if (filters?.ydStatusId) query = query.eq('yd_status_id', filters.ydStatusId)
  if (filters?.isSold !== undefined) query = query.eq('is_sold', filters.isSold)
  if (filters?.invoiceType) query = query.eq('invoice_type', filters.invoiceType)
  if (filters?.purchaseTypeId) query = query.eq('purchase_type_id', filters.purchaseTypeId)
  if (filters?.searchText) query = query.ilike('barcode', `%${filters.searchText}%`)

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  const devices = (data as DeviceWithNamesRow[]).map(rowToDeviceWithNames)
  return { devices, total: count ?? 0 }
}
