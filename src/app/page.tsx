'use client';

import dynamic from 'next/dynamic';
import Toolbar from '@/components/Toolbar';
import { useAircraftData } from '@/hooks/useAircraftData';

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

export default function Home() {
  const { aircraft, loading } = useAircraftData();

  return (
    <div className="relative h-full w-full">
      <Toolbar aircraftCount={aircraft.length} loading={loading} />
      <Map>
        <AircraftMarkers aircraft={aircraft} />
      </Map>
    </div>
  );
}
