'use client';

import type { OpenSkyState } from '@/api/opensky';
import { isEmergency, getCategory } from '@/lib/aircraft-utils';

interface Props {
  aircraft: OpenSkyState[];
  onSelect: (a: OpenSkyState) => void;
}

const SQUAWK_LABELS: Record<string, string> = {
  '7500': 'Pojenie',
  '7600': 'Awaria radia',
  '7700': 'Sytuacja awaryjna',
  '7777': 'Interceptor',
};

export default function SquawkPanel({ aircraft, onSelect }: Props) {
  const alerts = aircraft.filter(
    (a) => a.squawk && isEmergency(a.squawk, a.spi)
  );

  if (alerts.length === 0) return null;

  return (
    <div className="absolute bottom-6 right-4 z-[1000] max-w-xs rounded-lg border border-red-200 bg-white/95 shadow-lg backdrop-blur dark:border-red-800 dark:bg-zinc-900/95">
      <div className="flex items-center gap-2 border-b border-red-100 px-3 py-2 dark:border-red-900">
        <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
          Alerty squawk ({alerts.length})
        </span>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {alerts.map((a) => {
          const cat = getCategory(a.category);
          const catLabel = cat === 'helicopter' ? '🚁' : cat === 'small' ? '✈' : cat === 'large' ? '🛩' : '◆';
          return (
            <button
              key={a.icao24}
              onClick={() => onSelect(a)}
              className="flex w-full items-center gap-2 border-b border-red-50 px-3 py-1.5 text-left text-xs transition-colors hover:bg-red-50 last:border-0 dark:border-red-950 dark:hover:bg-red-950"
            >
              <span>{catLabel}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {a.callsign?.trim() || a.icao24}
              </span>
              <span className="ml-auto font-mono font-bold text-red-500">
                {a.squawk}
              </span>
              <span className="hidden sm:inline text-red-400">
                {SQUAWK_LABELS[a.squawk?.trim() ?? ''] || ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
