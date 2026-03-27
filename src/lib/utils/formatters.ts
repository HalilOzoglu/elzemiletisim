/**
 * Türk Lirası formatında para birimi döndürür.
 * Örnek: 1250 → "1.250,00 ₺"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

/**
 * Tarihi GG.AA.YYYY formatında döndürür.
 */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Yüzde oranını formatlar.
 * Örnek: 5 → "%5,00"
 */
export function formatPercent(rate: number): string {
  return `%${new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate)}`;
}
