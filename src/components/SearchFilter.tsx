'use client';

import { useMemo } from 'react';
import type { OpenSkyState } from '@/api/opensky';
import { getCategory, isEmergency } from '@/lib/aircraft-utils';

export type CategoryFilter = 'all' | 'small' | 'large' | 'helicopter' | 'alert';

interface Props {
  aircraft: OpenSkyState[];
  query: string;
  catFilter: CategoryFilter;
  onQueryChange: (v: string) => void;
  onCatFilterChange: (v: CategoryFilter) => void;
}

const TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'large', label: 'Duże' },
  { key: 'small', label: 'Małe' },
  { key: 'helicopter', label: 'Śmigłowce' },
  { key: 'alert', label: 'Alerty' },
];

export default function SearchFilter({ aircraft, query, catFilter, onQueryChange, onCatFilterChange }: Props) {
  const counts = useMemo(() => ({
    all: aircraft.length,
    small: aircraft.filter((a) => getCategory(a.category) === 'small').length,
    large: aircraft.filter((a) => getCategory(a.category) === 'large').length,
    helicopter: aircraft.filter((a) => getCategory(a.category) === 'helicopter').length,
    alert: aircraft.filter((a) => a.squawk && isEmergency(a.squawk, a.spi)).length,
  }), [aircraft]);

  return (
    <div className="absolute left-4 right-4 top-16 z-[1000] flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          viewBox="0 0 20 20"
          width="14"
          height="14"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Szukaj po callsign lub ICAO24..."
          className="w-full rounded-lg border border-zinc-300 bg-white/95 py-2 pl-9 pr-3 text-xs text-zinc-900 shadow-lg backdrop-blur placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900/95 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map(({ key, label }) => {
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => onCatFilterChange(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg transition-colors ${
                catFilter === key
                  ? key === 'alert'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-white/90 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {label} {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
