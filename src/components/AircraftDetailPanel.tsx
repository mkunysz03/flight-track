'use client';

import { useEffect, useState, useMemo } from 'react';
import type { OpenSkyState } from '@/api/opensky';
import { getCategory } from '@/lib/aircraft-utils';
import { getAirlineInfo } from '@/lib/airline-lookup';

interface AircraftMetadata {
  registration?: string | null;
  manufacturericao?: string | null;
  manufacturername?: string | null;
  model?: string | null;
  typecode?: string | null;
  serialnumber?: string | null;
  linenumber?: string | null;
  icaoaircrafttype?: string | null;
  operator?: string | null;
  operatorcallsign?: string | null;
  operatoricao?: string | null;
  ownername?: string | null;
}

interface Props {
  aircraft: OpenSkyState | null;
  onClose: () => void;
}

function altFt(m: number | null): string {
  if (m === null || m === undefined) return '---';
  return `${Math.round(m * 3.28084).toLocaleString()} ft`;
}

function speedKt(v: number | null): string {
  if (v === null || v === undefined) return '---';
  return `${Math.round(v * 1.94384)} kt`;
}

function vsFpm(v: number | null): string {
  if (v === null || v === undefined) return '---';
  const fpm = Math.round(v * 196.85);
  return `${fpm > 0 ? '▲' : fpm < 0 ? '▼' : '―'} ${Math.abs(fpm).toLocaleString()} fpm`;
}

function formatTime(ts: number | null): string {
  if (!ts) return '---';
  return new Date(ts * 1000).toLocaleTimeString();
}

export default function AircraftDetailPanel({ aircraft, onClose }: Props) {
  const [meta, setMeta] = useState<AircraftMetadata | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

  useEffect(() => {
    if (!aircraft) {
      setMeta(null);
      return;
    }
    setMetaLoading(true);
    fetch(`/api/metadata?icao24=${aircraft.icao24}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object' && !data.error) {
          setMeta(data as AircraftMetadata);
        } else {
          setMeta(null);
        }
      })
      .catch(() => setMeta(null))
      .finally(() => setMetaLoading(false));
  }, [aircraft]);

  const airline = useMemo(
    () => getAirlineInfo(aircraft?.callsign ?? null, meta?.operatoricao ?? null),
    [aircraft?.callsign, meta?.operatoricao]
  );

  if (!aircraft) return null;

  const model = meta?.model || '';
  const manufacturer = meta?.manufacturername || '';
  const typeCode = meta?.typecode || '';
  const reg = meta?.registration || '';
  const operator = meta?.operator || '';
  const opCallsign = meta?.operatorcallsign || '';
  const icaoType = meta?.icaoaircrafttype || '';
  const serial = meta?.serialnumber || '';
  const owner = meta?.ownername || '';
  const lineNum = meta?.linenumber || '';

  const catLabel = () => {
    const labels: Record<number, string> = {
      0: 'Brak danych', 1: 'Brak kategorii', 2: 'Lekki', 3: 'Mały',
      4: 'Duży', 5: 'Duży (B-757)', 6: 'Ciężki', 7: 'VIP / wojskowy',
      8: 'Śmigłowiec', 9: 'Szybowiec', 10: 'Lżejszy od powietrza',
      11: 'Spadochroniarz', 12: 'Ultralekki', 14: 'Dron', 15: 'Kosmiczny',
    };
    return labels[aircraft.category ?? -1] ?? '---';
  };

  return (
    <div className="absolute right-0 top-14 z-[1000] h-[calc(100%-3.5rem)] w-80 border-l border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {aircraft.callsign?.trim() || 'N/A'}
          </h2>
          {metaLoading && <p className="text-[10px] text-zinc-400">Ładowanie danych...</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-5">
        {/* Lot */}
        <Section title="Lot">
          <Row label="Callsign" value={aircraft.callsign?.trim() || '---'} />
          <Row label="ICAO24" value={aircraft.icao24} mono />
          <Row label="Squawk" value={aircraft.squawk ?? '----'} mono highlight={aircraft.squawk !== null && aircraft.squawk !== undefined && aircraft.squawk !== '----'} />
          <Row label="SPI" value={aircraft.spi ? 'Tak' : 'Nie'} />
          <Row label="Pozycja" value={['adsb', 'asterix', 'mlat', 'flarm'][aircraft.position_source] || 'nieznane'} />
        </Section>

        {/* Pozycja */}
        <Section title="Pozycja">
          <Row label="Szerokość" value={aircraft.latitude?.toFixed(4) ?? '---'} />
          <Row label="Długość" value={aircraft.longitude?.toFixed(4) ?? '---'} />
          <Row label="Wysokość (baro)" value={altFt(aircraft.baro_altitude)} />
          <Row label="Wysokość (geo)" value={altFt(aircraft.geo_altitude)} />
          <Row label="Prędkość" value={speedKt(aircraft.velocity)} />
          <Row label="Kurs" value={aircraft.true_track != null ? `${Math.round(aircraft.true_track)}°` : '---'} />
          <Row label="Pionowo" value={vsFpm(aircraft.vertical_rate)} />
          <Row label="Status" value={aircraft.on_ground ? 'Na ziemi' : 'W powietrzu'} />
          <Row label="Ostatni kontakt" value={formatTime(aircraft.last_contact)} />
        </Section>

        {/* Samolot */}
        <Section title="Samolot">
          <Row label="Model" value={model || catLabel()} />
          {manufacturer && <Row label="Producent" value={manufacturer} />}
          {typeCode && <Row label="Kod typu" value={typeCode} />}
          {icaoType && <Row label="Typ ICAO" value={icaoType} />}
          {reg && <Row label="Rejestracja" value={reg} />}
          {serial && <Row label="Nr seryjny" value={serial} />}
          {lineNum && <Row label="Nr linii" value={lineNum} />}
          <Row label="Kategoria" value={catLabel()} />
        </Section>

        {/* Linia lotnicza */}
        {(airline || operator || opCallsign || owner) && (
          <Section title="Linia lotnicza">
            {airline && <Row label="Linia" value={airline.name} />}
            {airline?.callsign && airline.callsign !== operator && (
              <Row label="Callsign" value={airline.callsign} />
            )}
            {operator && operator !== airline?.name && (
              <Row label="Operator" value={operator} />
            )}
            {opCallsign && <Row label="Kod opsa" value={opCallsign} />}
            {airline?.iata && <Row label="IATA" value={airline.iata} />}
            {airline?.country && <Row label="Kraj" value={airline.country} />}
            {owner && <Row label="Właściciel" value={owner} />}
          </Section>
        )}

        {/* Kraj */}
        <Section title="Pochodzenie">
          <Row label="Kraj" value={aircraft.origin_country || '---'} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="shrink-0 text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={`text-right font-medium text-zinc-900 dark:text-zinc-100 ${
          mono ? 'font-mono text-[11px]' : ''
        } ${highlight ? 'text-red-500 dark:text-red-400' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
