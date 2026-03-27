// Cihaz (Device) arayüzü
export interface Device {
  id: string;
  barcode?: string;
  brandId: string;
  modelId: string;
  storageId: string;
  colorId: string;
  ydStatusId: string;
  purchaseTypeId: string;
  invoiceType: "AF" | "MF";
  condition: "sifir" | "ikinci_el";
  warrantyMonths?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  supplierType?: "musteri" | "firma";
  supplierName?: string;
  supplierSurname?: string;
  supplierPhone?: string;
  supplierCompany?: string;
  suggestedPrice?: number;
  isSold: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Satış (Sale) arayüzü
export interface Sale {
  id: string;
  deviceId: string;
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  saleMethod: "nakit" | "havale" | "kredi_karti";
  invoiceStatus: "AF" | "MF";
  afSubStatus?: "kesildi" | "bekliyor";
  salePrice: number;
  grossPrice?: number;
  commissionRate?: number;
  saleDate: string;
  createdAt?: string;
}

// Masraf (Expense) arayüzü
export interface Expense {
  id: string;
  deviceId: string;
  amount: number;
  description: string;
  createdAt?: string;
}

// Liste Öğesi (ListItem) arayüzü
export interface ListItem {
  id: string;
  categoryId: string;
  parentId?: string;
  value: string;
  createdAt?: string;
}

// Liste Kategorisi (ListCategory) arayüzü
export interface ListCategory {
  id: string;
  slug: string; // 'brand', 'model', 'storage', 'color', 'yd_status', 'purchase_type', 'sale_method'
  name: string;
}

// Stok cihaz özeti (panel için)
export interface StockDevice {
  id: string;
  barcode?: string;
  brandName?: string;
  modelName?: string;
  storageName?: string;
  colorName?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  condition: 'sifir' | 'ikinci_el';
}

// Dashboard istatistikleri
export interface DashboardStats {
  totalPurchaseAmount: number;
  totalSaleAmount: number;
  totalExpenseAmount: number;
  netProfit: number;
  pendingAfInvoices: Sale[];
  pendingAfTotal: number;
  saleMethodDistribution: {
    nakit: number;
    havale: number;
    kredi_karti: number;
  };
  stockCount: number;
  stockTotalCost: number;
  stockDevices: StockDevice[];
}

// Filtre parametreleri
export interface DeviceFilters {
  brandId?: string;
  modelId?: string;
  storageId?: string;
  colorId?: string;
  ydStatusId?: string;
  isSold?: boolean;
  invoiceType?: "AF" | "MF";
  purchaseTypeId?: string;
  searchText?: string;
  page?: number;
  pageSize?: number;
}
