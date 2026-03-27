export const dynamic = 'force-dynamic';

import Link from "next/link"
import { getDashboardStats } from "@/lib/supabase/dashboard"
import { FinansalOzet } from "@/components/panel/FinansalOzet"
import { BekleyenFaturalar } from "@/components/panel/BekleyenFaturalar"
import { SatisDagilimi } from "@/components/panel/SatisDagilimi"
import { StokOzet } from "@/components/panel/StokOzet"

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

const PERIODS = [
  { value: "gunluk", label: "Günlük" },
  { value: "haftalik", label: "Haftalık" },
  { value: "aylik", label: "Aylık" },
] as const

type Period = "gunluk" | "haftalik" | "aylik"

function isValidPeriod(value: string | undefined): value is Period {
  return value === "gunluk" || value === "haftalik" || value === "aylik"
}

const PERIOD_LABELS: Record<Period, string> = {
  gunluk: "bugünkü",
  haftalik: "son 7 günlük",
  aylik: "son 30 günlük",
}

export default async function PanelPage({ searchParams }: PageProps) {
  const params = await searchParams
  const period: Period = isValidPeriod(params.period) ? params.period : "gunluk"
  const stats = await getDashboardStats(period)

  return (
    <div className="space-y-6 p-6">
      {/* Başlık + Periyot Seçici */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finansal Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {PERIOD_LABELS[period]} veriler gösteriliyor
          </p>
        </div>

        {/* Periyot seçici — pill tabs */}
        <div className="flex items-center gap-1 rounded-xl glass-card p-1 self-start sm:self-auto">
          {PERIODS.map(({ value, label }) => {
            const isActive = period === value
            return (
              <Link
                key={value}
                href={`/panel?period=${value}`}
                className={
                  isActive
                    ? "relative rounded-lg px-4 py-2 text-sm font-semibold text-foreground bg-primary/20 border border-primary/30 shadow-sm transition-all duration-150"
                    : "rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150"
                }
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <FinansalOzet stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BekleyenFaturalar invoices={stats.pendingAfInvoices} total={stats.pendingAfTotal} />
        </div>
        <div className="lg:col-span-2">
          <StokOzet stockCount={stats.stockCount} stockTotalCost={stats.stockTotalCost} stockDevices={stats.stockDevices} />
        </div>
      </div>

      <SatisDagilimi distribution={stats.saleMethodDistribution} />
    </div>
  )
}
