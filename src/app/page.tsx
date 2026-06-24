'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Toolbar from '@/components/Toolbar';
import AltitudeLegend from '@/components/AltitudeLegend';
import { useAircraftData } from '@/hooks/useAircraftData';
import { SelectedProvider, useSelectedAircraft } from '@/hooks/useSelectedAircraft';
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

function HomePage() {
  const [bounds, setBounds] = useState<{
    lamin: number; lomin: number; lamax: number; lomax: number;
  } | null>(null);

  const { aircraft, loading } = useAircraftData(bounds);
  const { selected, trackPath, select, close } = useSelectedAircraft();

  return (
    <div className="relative h-full w-full">
      <Toolbar aircraftCount={aircraft.length} loading={loading} />
      <Map>
        <AircraftMarkers
          aircraft={aircraft}
          onBoundsChange={setBounds}
          onAircraftClick={(a: OpenSkyState) => select(a)}
        />
        <FlightPath path={trackPath} />
      </Map>
      <AltitudeLegend />
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
