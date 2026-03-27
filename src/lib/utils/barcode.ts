const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_RETRIES = 10;

export function generateBarcode(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const suffix = Array.from({ length: 5 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
  return `ELZ-${date}-${suffix}`;
}

export async function generateUniqueBarcode(
  checkExists: (barcode: string) => Promise<boolean>,
  retries = 0
): Promise<string> {
  if (retries >= MAX_RETRIES) {
    throw new Error('Benzersiz barkod üretilemedi. Lütfen manuel girin.');
  }
  const barcode = generateBarcode();
  const exists = await checkExists(barcode);
  return exists ? generateUniqueBarcode(checkExists, retries + 1) : barcode;
}
