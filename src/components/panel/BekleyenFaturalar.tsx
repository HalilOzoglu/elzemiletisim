"use client";

import { useState } from "react";
import { Sale } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, CheckCircle, Loader2 } from "lucide-react";
import { updateAfSubStatus } from "@/lib/supabase/device-actions";
import { toast } from "sonner";

interface BekleyenFaturalarProps {
  invoices: Sale[];
  total?: number;
}

export function BekleyenFaturalar({ invoices: initialInvoices }: BekleyenFaturalarProps) {
  const [invoices, setInvoices] = useState<Sale[]>(initialInvoices);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const total = invoices.reduce((sum, inv) => sum + inv.salePrice, 0);

  async function handleKesildi(saleId: string) {
    setLoadingId(saleId);
    try {
      await updateAfSubStatus(saleId, "kesildi");
      setInvoices((prev) => prev.filter((inv) => inv.id !== saleId));
      toast.success("Fatura kesildi olarak güncellendi");
    } catch {
      toast.error("Güncelleme sırasında bir hata oluştu");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="glass-card rounded-xl p-5 border-t-2 border-t-yellow-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
            <FileText className="h-4 w-4 text-yellow-400" />
          </div>
          <span className="text-base font-semibold">Bekleyen AF Faturaları</span>
        </div>
        {invoices.length > 0 && (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            {invoices.length} fatura
          </Badge>
        )}
      </div>

      {invoices.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Bekleyen fatura yok
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead>Müşteri</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-white/5 hover:bg-white/3">
                  <TableCell className="font-medium">
                    {invoice.customerName} {invoice.customerSurname}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(invoice.saleDate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(invoice.salePrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                      disabled={loadingId === invoice.id}
                      onClick={() => handleKesildi(invoice.id)}
                    >
                      {loadingId === invoice.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <><CheckCircle className="h-3 w-3 mr-1" />Kesildi</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-sm text-muted-foreground">Toplam Bekleyen</span>
            <span className="font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
