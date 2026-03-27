import { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils/formatters";
import { ShoppingCart, TrendingUp, Receipt, DollarSign } from "lucide-react";

interface FinansalOzetProps {
  stats: DashboardStats;
}

const cards = (stats: DashboardStats) => [
  {
    title: "Toplam Alış",
    subtitle: "Periyottaki cihaz alımları",
    value: stats.totalPurchaseAmount,
    icon: ShoppingCart,
    iconClass: "text-blue-400",
    borderColor: "border-t-blue-500",
  },
  {
    title: "Toplam Satış",
    subtitle: "Periyottaki satış gelirleri",
    value: stats.totalSaleAmount,
    icon: TrendingUp,
    iconClass: "text-emerald-400",
    borderColor: "border-t-emerald-500",
  },
  {
    title: "Toplam Masraf",
    subtitle: "Periyottaki ek masraflar",
    value: stats.totalExpenseAmount,
    icon: Receipt,
    iconClass: "text-orange-400",
    borderColor: "border-t-orange-500",
  },
  {
    title: "Net Kâr",
    subtitle: "Satış − maliyet − masraf",
    value: stats.netProfit,
    icon: DollarSign,
    iconClass: stats.netProfit >= 0 ? "text-emerald-400" : "text-red-400",
    borderColor: stats.netProfit >= 0 ? "border-t-emerald-500" : "border-t-red-500",
    valueClass: stats.netProfit >= 0 ? "text-emerald-400" : "text-red-400",
  },
];

export function FinansalOzet({ stats }: FinansalOzetProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards(stats).map(({ title, subtitle, value, icon: Icon, iconClass, borderColor, valueClass }) => (
        <div
          key={title}
          className={`glass-card rounded-xl p-5 border-t-2 ${borderColor} transition-all duration-150 hover:scale-[1.01]`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-sm text-muted-foreground">{title}</span>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <Icon className={`h-4 w-4 ${iconClass}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${valueClass ?? "text-foreground"}`}>
            {value != null ? formatCurrency(value) : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
