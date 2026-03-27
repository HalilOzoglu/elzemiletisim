export default function PanelLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Başlık */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-white/5" />
          <div className="h-4 w-56 rounded bg-white/5" />
        </div>
        <div className="h-10 w-56 rounded-xl bg-white/5" />
      </div>

      {/* Finansal kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-5 border-t-2 border-t-white/10 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded bg-white/5" />
              <div className="h-7 w-7 rounded-lg bg-white/5" />
            </div>
            <div className="h-8 w-32 rounded bg-white/5" />
            <div className="h-3 w-20 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Alt grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 glass-card rounded-xl p-5 space-y-3">
          <div className="h-5 w-40 rounded bg-white/5" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="lg:col-span-2 glass-card rounded-xl p-5 space-y-3">
          <div className="h-5 w-32 rounded bg-white/5" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-lg bg-white/5" />
            <div className="h-20 rounded-lg bg-white/5" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
