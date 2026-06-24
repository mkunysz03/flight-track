'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useCallback } from 'react';
import Toolbar from '@/components/Toolbar';
import AltitudeLegend from '@/components/AltitudeLegend';
import { useAircraftData } from '@/hooks/useAircraftData';
import { SelectedProvider, useSelectedAircraft } from '@/hooks/useSelectedAircraft';
import { isEmergency, getCategory } from '@/lib/aircraft-utils';
import type { CategoryFilter } from '@/components/SearchFilter';
import type { OpenSkyState } from '@/api/opensky';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-400">
      Loading map...
    </div>
  ),
});

const AircraftMarkers = dynamic(() => import('@/components/AircraftMarkers'), {
  ssr: false,
});

const AircraftDetailPanel = dynamic(() => import('@/components/AircraftDetailPanel'), {
  ssr: false,
});

const FlightPath = dynamic(() => import('@/components/FlightPath'), {
  ssr: false,
});

const SquawkPanel = dynamic(() => import('@/components/SquawkPanel'), {
  ssr: false,
});

const MapFlyTo = dynamic(() => import('@/components/MapFlyTo'), {
  ssr: false,
});

const SearchFilter = dynamic(() => import('@/components/SearchFilter'), {
  ssr: false,
});

function HomePage() {
  const [bounds, setBounds] = useState<{
    lamin: number; lomin: number; lamax: number; lomax: number;
  } | null>(null);

  const [focusPos, setFocusPos] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');

  const { aircraft, loading } = useAircraftData(bounds);
  const { selected, trackPath, select, close } = useSelectedAircraft();

  const filtered = useMemo(() => {
    let result = aircraft;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.callsign?.trim().toLowerCase().includes(q) ||
          a.icao24.toLowerCase().includes(q)
      );
    }

    if (catFilter === 'alert') {
      result = result.filter((a) => a.squawk && isEmergency(a.squawk, a.spi));
    } else if (catFilter !== 'all') {
      result = result.filter((a) => getCategory(a.category) === catFilter);
    }

    return result;
  }, [aircraft, query, catFilter]);

  const alertCount = aircraft.filter(
    (a) => a.squawk && isEmergency(a.squawk, a.spi)
  ).length;

  const handleSquawkSelect = useCallback((a: OpenSkyState) => {
    select(a);
    if (a.latitude != null && a.longitude != null) {
      setFocusPos({ lat: a.latitude, lng: a.longitude });
    }
  }, [select]);

  return (
    <div className="relative h-full w-full">
      <Toolbar aircraftCount={aircraft.length} loading={loading} alertCount={alertCount} />
      <SearchFilter
        aircraft={aircraft}
        query={query}
        catFilter={catFilter}
        onQueryChange={setQuery}
        onCatFilterChange={setCatFilter}
      />
      <Map>
        <AircraftMarkers
          aircraft={filtered}
          onBoundsChange={setBounds}
          onAircraftClick={(a: OpenSkyState) => select(a)}
        />
        <FlightPath path={trackPath} />
        {focusPos && <MapFlyTo lat={focusPos.lat} lng={focusPos.lng} />}
      </Map>
      <AltitudeLegend />
      <SquawkPanel aircraft={aircraft} onSelect={handleSquawkSelect} />
      <AircraftDetailPanel aircraft={selected} onClose={close} />
    </div>
  );
}

export default function Home() {
  return (
    <SelectedProvider>
      <HomePage />
    </SelectedProvider>
  );
}
