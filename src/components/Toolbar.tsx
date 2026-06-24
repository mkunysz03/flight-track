'use client';

interface Props {
  aircraftCount?: number;
  loading?: boolean;
  alertCount?: number;
}

export default function Toolbar({ aircraftCount = 0, loading = false, alertCount = 0 }: Props) {
  return (
    <header className="absolute top-0 left-0 z-[1000] flex h-14 w-full items-center gap-4 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Flight Track
      </h1>
      <div className="ml-auto flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        {alertCount > 0 && (
          <span className="flex items-center gap-1 font-semibold text-red-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {alertCount} alert{alertCount !== 1 ? 'y' : ''}
          </span>
        )}
        <span>{loading ? 'Loading...' : `${aircraftCount} aircraft`}</span>
      </div>
    </header>
  );
}
