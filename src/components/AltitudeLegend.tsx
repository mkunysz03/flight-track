export default function AltitudeLegend() {
  const steps = [
    { label: '< 1000\'', color: '#22c55e' },
    { label: '< 5000\'', color: '#84cc16' },
    { label: '< 10000\'', color: '#eab308' },
    { label: '< 20000\'', color: '#f97316' },
    { label: '< 30000\'', color: '#ef4444' },
    { label: '< 40000\'', color: '#ec4899' },
    { label: '> 40000\'', color: '#a855f7' },
  ];

  return (
    <div className="absolute bottom-6 left-4 z-[1000] rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Altitude
      </p>
      <div className="flex flex-col gap-0.5">
        {steps.map((s) => (
          <div key={s.color} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: s.color }} />
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
