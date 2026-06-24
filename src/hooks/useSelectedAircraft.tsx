'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { OpenSkyState } from '@/api/opensky';

export interface TrackPoint {
  lat: number;
  lon: number;
  alt: number;
}

interface SelectedContext {
  selected: OpenSkyState | null;
  trackPath: TrackPoint[];
  loadingTrack: boolean;
  select: (a: OpenSkyState | null) => void;
  close: () => void;
}

const Ctx = createContext<SelectedContext>({
  selected: null,
  trackPath: [],
  loadingTrack: false,
  select: () => {},
  close: () => {},
});

export function SelectedProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<OpenSkyState | null>(null);
  const [trackPath, setTrackPath] = useState<TrackPoint[]>([]);
  const [loadingTrack, setLoadingTrack] = useState(false);

  const select = useCallback((a: OpenSkyState | null) => {
    setSelected(a);
    setTrackPath([]);

    if (!a) return;

    setLoadingTrack(true);
    fetch(`/api/track?icao24=${a.icao24}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.path) setTrackPath(data.path);
      })
      .catch(() => {})
      .finally(() => setLoadingTrack(false));
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    setTrackPath([]);
  }, []);

  return (
    <Ctx.Provider value={{ selected, trackPath, loadingTrack, select, close }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSelectedAircraft() {
  return useContext(Ctx);
}
