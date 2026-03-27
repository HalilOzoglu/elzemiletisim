import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

interface SatisDagilimiProps {
  distribution: {
    nakit: number;
    havale: number;
    kredi_karti: number;
  };
}

const YONTEMLER = [
  { key: "nakit" as const, label: "Nakit", color: "bg-emerald-500", glow: "shadow-emerald-500/20" },
  { key: "havale" as const, label: "Havale", color: "bg-blue-500", glow: "shadow-blue-500/20" },
  { key: "kredi_karti" as const, label: "Kredi Kartı", color: "bg-purple-500", glow: "shadow-purple-500/20" },
];

export function SatisDagilimi({ distribution }: SatisDagilimiProps) {
  const toplam = distribution.nakit + distribution.havale + distribution.kredi_karti;

  return (
    <div className="glass-card rounded-xl p-5 border-t-2 border-t-blue-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-base font-semibold">Satış Dağılımı</span>
        </div>
        {toplam > 0 && (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            {toplam} satış
          </Badge>
        )}
      </div>

      {toplam === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Satış verisi yok
        </p>
      ) : (
        <div className="space-y-4">
          {YONTEMLER.map(({ key, label, color }) => {
            const count = distribution[key];
            const percent = toplam > 0 ? Math.round((count / toplam) * 100) : 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">
                    {count} <span className="text-muted-foreground text-xs">({percent}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
