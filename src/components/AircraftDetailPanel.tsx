'use client';

import type { OpenSkyState } from '@/api/opensky';

interface Props {
  aircraft: OpenSkyState | null;
  onClose: () => void;
}

export default function AircraftDetailPanel({ aircraft, onClose }: Props) {
  if (!aircraft) return null;

  const altM = aircraft.baro_altitude ?? aircraft.geo_altitude ?? 0;
  const altFt = Math.round(altM * 3.28084);
  const speedKt = aircraft.velocity ? Math.round((aircraft.velocity as number) * 1.94384) : 0;
  const vsFpm = aircraft.vertical_rate ? Math.round(aircraft.vertical_rate * 196.85) : 0;

  const rows = [
    ['Callsign', aircraft.callsign?.trim() || '---'],
    ['ICAO24', aircraft.icao24],
    ['Kraj', aircraft.origin_country || '---'],
    ['Wysokość', `${altFt.toLocaleString()} ft`],
    ['Prędkość', `${speedKt} kt`],
    ['Kurs', `${Math.round(aircraft.true_track ?? 0)}°`],
    ['Pionowo', `${vsFpm > 0 ? '▲' : vsFpm < 0 ? '▼' : '―'} ${Math.abs(vsFpm)} fpm`],
    ['Squawk', aircraft.squawk ?? '----'],
    ['Status', aircraft.on_ground ? 'Na ziemi' : 'W powietrzu'],
    ['Kategoria', categoryLabel(aircraft.category ?? -1)],
  ];

  return (
    <div className="absolute right-0 top-14 z-[1000] h-[calc(100%-3.5rem)] w-80 border-l border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {aircraft.callsign?.trim() || 'N/A'}
        </h2>
        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto p-4">
        <table className="w-full text-xs">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-3 text-zinc-500 dark:text-zinc-400">{label}</td>
                <td className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-100">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function categoryLabel(cat: number): string {
  const labels: Record<number, string> = {
    0: 'Brak danych',
    1: 'Brak kategorii',
    2: 'Lekki',
    3: 'Mały',
    4: 'Duży',
    5: 'Duży (B-757)',
    6: 'Ciężki',
    7: 'VIP / wojskowy',
    8: 'Śmigłowiec',
    9: 'Szybowiec',
    10: 'Lżejszy od powietrza',
    11: 'Spadochroniarz',
    12: 'Ultralekki',
    14: 'Dron',
    15: 'Kosmiczny',
  };
  return labels[cat] ?? `Kategoria ${cat}`;
}
