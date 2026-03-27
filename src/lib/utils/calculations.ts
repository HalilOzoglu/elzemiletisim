/**
 * Masraf listesindeki tüm amount değerlerini toplar.
 * Boş liste için 0 döndürür.
 */
export function calculateTotalExpenses(expenses: { amount: number }[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Net tutardan brüt tutarı hesaplar.
 * Brüt = Net × (1 + komisyon/100)
 */
export function calculateGrossPrice(netPrice: number, commissionRate: number): number {
  return parseFloat((netPrice * (1 + commissionRate / 100)).toFixed(2));
}

/**
 * Brüt tutardan net tutarı hesaplar.
 * Net = Brüt / (1 + komisyon/100)
 */
export function calculateNetFromGross(grossPrice: number, commissionRate: number): number {
  return parseFloat((grossPrice / (1 + commissionRate / 100)).toFixed(2));
}

/**
 * Net kârı hesaplar.
 * Net Kâr = Satış Fiyatı − Alış Fiyatı − Toplam Masraf
 */
export function calculateProfit(
  salePrice: number,
  purchasePrice: number,
  expenses: { amount: number }[]
): number {
  const totalExpenses = calculateTotalExpenses(expenses);
  return parseFloat((salePrice - purchasePrice - totalExpenses).toFixed(2));
}
