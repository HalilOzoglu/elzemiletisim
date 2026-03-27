import { createClient } from './server'
import type { Sale } from '@/types'

type SaleRow = {
  id: string
  device_id: string
  customer_name: string
  customer_surname: string
  customer_phone: string
  sale_method: 'nakit' | 'havale' | 'kredi_karti'
  invoice_status: 'AF' | 'MF'
  af_sub_status: 'kesildi' | 'bekliyor' | null
  sale_price: number
  gross_price: number | null
  commission_rate: number | null
  sale_date: string
  created_at: string | null
}

function rowToSale(row: SaleRow): Sale {
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

function saleToRow(data: Omit<Sale, 'id' | 'createdAt'>): Omit<SaleRow, 'id' | 'created_at'> {
  return {
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
  }
}

export async function createSale(data: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
  const supabase = await createClient()

  const { data: row, error } = await supabase
    .from('sales')
    .insert(saleToRow(data))
    .select()
    .single()

  if (error) throw new Error(error.message)

  const { error: updateError } = await supabase
    .from('devices')
    .update({ is_sold: true })
    .eq('id', data.deviceId)

  if (updateError) throw new Error(updateError.message)

  return rowToSale(row as SaleRow)
}

export async function getSaleByDevice(deviceId: string): Promise<Sale | null> {
  const supabase = await createClient()

  const { data: row, error } = await supabase
    .from('sales')
    .select('*')
    .eq('device_id', deviceId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  return rowToSale(row as SaleRow)
}
