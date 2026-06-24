'use client';

interface Props {
  aircraftCount?: number;
  loading?: boolean;
}

export default function Toolbar({ aircraftCount = 0, loading = false }: Props) {
  return (
    <header className="absolute top-0 left-0 z-[1000] flex h-14 w-full items-center gap-4 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Flight Track
      </h1>
      <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
        {loading ? 'Loading...' : `${aircraftCount} aircraft`}
      </span>
    </header>
  );
}
