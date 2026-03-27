export default function CihazlarLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="glass-card rounded-xl overflow-hidden animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="h-6 w-24 rounded bg-white/5" />
          <div className="h-8 w-28 rounded-lg bg-white/5" />
        </div>
        <div className="p-5 space-y-4">
          {/* Filtreler */}
          <div className="flex gap-3">
            <div className="h-9 w-64 rounded-lg bg-white/5" />
            <div className="h-9 w-48 rounded-lg bg-white/5" />
          </div>
          {/* Tablo satırları */}
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <div className="h-10 bg-white/3 border-b border-white/5" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-0">
                <div className="h-7 w-7 rounded-md bg-white/5 shrink-0" />
                <div className="h-4 w-24 rounded bg-white/5" />
                <div className="h-4 w-32 rounded bg-white/5" />
                <div className="h-4 w-16 rounded bg-white/5" />
                <div className="h-4 w-16 rounded bg-white/5" />
                <div className="h-4 w-20 rounded bg-white/5 ml-auto" />
                <div className="h-5 w-14 rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
