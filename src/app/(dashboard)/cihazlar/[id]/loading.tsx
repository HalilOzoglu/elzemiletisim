export default function CihazDetayLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/5 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-6 w-48 rounded bg-white/5" />
          <div className="h-4 w-32 rounded bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sol sütun */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-3">
              <div className="h-5 w-32 rounded bg-white/5" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between py-2 border-b border-white/5">
                  <div className="h-4 w-20 rounded bg-white/5" />
                  <div className="h-4 w-24 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Sağ sütun */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-5 w-32 rounded bg-white/5" />
              <div className="h-8 w-24 rounded bg-white/5" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5">
                  <div className="h-4 w-16 rounded bg-white/5" />
                  <div className="h-4 w-20 rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 space-y-3">
            <div className="h-9 w-48 rounded-lg bg-white/5" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
