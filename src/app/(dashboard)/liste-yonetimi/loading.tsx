export default function ListeYonetimiLoading() {
  return (
    <div className="container mx-auto py-8 px-4 animate-pulse">
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <div className="h-6 w-36 rounded bg-white/5" />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-24 rounded-lg bg-white/5 shrink-0" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
