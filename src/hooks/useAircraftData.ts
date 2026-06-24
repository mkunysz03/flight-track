'use client';

import { useEffect, useRef, useState } from 'react';
import type { OpenSkyState } from '@/api/opensky';
import { REFRESH_INTERVAL_MS } from '@/lib/map-config';

interface Bounds {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}

export function useAircraftData(bounds?: Bounds | null) {
  const [aircraft, setAircraft] = useState<OpenSkyState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchData() {
      try {
        let url = '/api/opensky';
        if (bounds) {
          url += `?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (mountedRef.current) {
          setAircraft(data);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Fetch failed');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [bounds]);

  return { aircraft, loading, error };
}
