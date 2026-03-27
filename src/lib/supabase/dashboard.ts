import { createClient } from './server'
import type { Sale, DashboardStats } from '@/types'

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

function getPeriodStart(period: 'gunluk' | 'haftalik' | 'aylik'): string {
  const now = new Date()
  if (period === 'gunluk') {
    // Bugünün başlangıcı (yerel saat)
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return start.toISOString()
  }
  const days = period === 'haftalik' ? 7 : 30
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return start.toISOString()
}

export async function getDashboardStats(
  period: 'gunluk' | 'haftalik' | 'aylik'
): Promise<DashboardStats> {
  const supabase = await createClient()
  const periodStart = getPeriodStart(period)

  // Periyottaki satışlar + satılan cihazların alış fiyatı (JOIN ile)
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select(`
      sale_price,
      sale_method,
      device:devices!device_id(purchase_price)
    `)
    .gte('sale_date', periodStart)
  if (salesError) throw new Error(salesError.message)

  const totalSaleAmount = (salesData ?? []).reduce((sum, s) => sum + (s.sale_price ?? 0), 0)

  // Satılan cihazların alış maliyeti (kar hesabı için)
  const totalSoldCost = (salesData ?? []).reduce((sum, s) => {
    const device = s.device as { purchase_price: number | null } | null | unknown
    return sum + ((device as { purchase_price: number | null } | null)?.purchase_price ?? 0)
  }, 0)

  const saleMethodDistribution = { nakit: 0, havale: 0, kredi_karti: 0 }
  for (const s of salesData ?? []) {
    if (s.sale_method === 'nakit') saleMethodDistribution.nakit++
    else if (s.sale_method === 'havale') saleMethodDistribution.havale++
    else if (s.sale_method === 'kredi_karti') saleMethodDistribution.kredi_karti++
  }

  // Periyottaki masraflar
  const { data: expensesData, error: expensesError } = await supabase
    .from('expenses')
    .select('amount')
    .gte('created_at', periodStart)
  if (expensesError) throw new Error(expensesError.message)

  const totalExpenseAmount = (expensesData ?? []).reduce((sum, e) => sum + (e.amount ?? 0), 0)

  // Periyottaki alışlar (bilgi amaçlı gösterim)
  const { data: devicesData, error: devicesError } = await supabase
    .from('devices')
    .select('purchase_price')
    .gte('purchase_date', periodStart)
  if (devicesError) throw new Error(devicesError.message)

  const totalPurchaseAmount = (devicesData ?? []).reduce(
    (sum, d) => sum + (d.purchase_price ?? 0),
    0
  )

  // Bekleyen AF faturaları (periyotsuz — tüm zamanlar)
  const { data: pendingAfData, error: pendingAfError } = await supabase
    .from('sales')
    .select('*')
    .eq('invoice_status', 'AF')
    .eq('af_sub_status', 'bekliyor')
  if (pendingAfError) throw new Error(pendingAfError.message)

  const pendingAfInvoices = (pendingAfData ?? []).map((row) => rowToSale(row as SaleRow))
  const pendingAfTotal = pendingAfInvoices.reduce((sum, s) => sum + s.salePrice, 0)

  // Stok özeti (periyotsuz) — tam cihaz listesi ile
  const { data: stockData, error: stockError } = await supabase
    .from('devices')
    .select(`
      id,
      barcode,
      purchase_price,
      purchase_date,
      condition,
      brand:list_items!brand_id(value),
      model:list_items!model_id(value),
      storage:list_items!storage_id(value),
      color:list_items!color_id(value)
    `)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
  if (stockError) throw new Error(stockError.message)

  const stockCount = (stockData ?? []).length
  const stockTotalCost = (stockData ?? []).reduce((sum, d) => sum + ((d.purchase_price as number | null) ?? 0), 0)

  type StockRow = {
    id: string
    barcode: string | null
    purchase_price: number | null
    purchase_date: string | null
    condition: 'sifir' | 'ikinci_el'
    brand: { value: string }[] | null
    model: { value: string }[] | null
    storage: { value: string }[] | null
    color: { value: string }[] | null
  }

  const stockDevices = (stockData as unknown as StockRow[]).map((d) => ({
    id: d.id,
    barcode: d.barcode ?? undefined,
    brandName: Array.isArray(d.brand) ? d.brand[0]?.value : (d.brand as { value: string } | null)?.value,
    modelName: Array.isArray(d.model) ? d.model[0]?.value : (d.model as { value: string } | null)?.value,
    storageName: Array.isArray(d.storage) ? d.storage[0]?.value : (d.storage as { value: string } | null)?.value,
    colorName: Array.isArray(d.color) ? d.color[0]?.value : (d.color as { value: string } | null)?.value,
    purchasePrice: d.purchase_price ?? undefined,
    purchaseDate: d.purchase_date ?? undefined,
    condition: d.condition,
  }))

  // Net kâr = satış geliri - satılan cihazların maliyeti - masraflar
  const netProfit = totalSaleAmount - totalSoldCost - totalExpenseAmount

  return {
    totalPurchaseAmount,
    totalSaleAmount,
    totalExpenseAmount,
    netProfit,
    pendingAfInvoices,
    pendingAfTotal,
    saleMethodDistribution,
    stockCount,
    stockTotalCost,
    stockDevices,
  }
}
