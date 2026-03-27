export default function BarkodLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/5" />
        <div className="space-y-1.5">
          <div className="h-5 w-32 rounded bg-white/5" />
          <div className="h-4 w-48 rounded bg-white/5" />
        </div>
      </div>
      <div className="glass-card rounded-xl p-4">
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-white/5" />
          <div className="h-10 w-24 rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}
