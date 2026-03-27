import { toast } from "sonner";

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("duplicate key")) return "Bu kayıt zaten mevcut";
    if (msg.includes("foreign key")) return "İlişkili kayıt bulunamadı";
    if (msg.includes("not found")) return "Kayıt bulunamadı";
    return error.message || "Beklenmeyen bir hata oluştu";
  }
  return "Beklenmeyen bir hata oluştu";
}

export function toastError(error: unknown): void {
  toast.error(handleApiError(error));
}
