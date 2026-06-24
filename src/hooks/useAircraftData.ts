'use client';

import { useEffect, useRef, useState } from 'react';
import type { OpenSkyState } from '@/api/opensky';
import { REFRESH_INTERVAL_MS } from '@/lib/map-config';

export function useAircraftData() {
  const [aircraft, setAircraft] = useState<OpenSkyState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchData() {
      try {
        const res = await fetch('/api/opensky');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  }, []);

  return { aircraft, loading, error };
}
