'use client';

import { useEffect, useRef, useState } from 'react';
import { REFRESH_INTERVAL_MS } from '@/lib/map-config';

export interface MilitaryAircraft {
  hex: string;
  flight: string | null;
  lat: number;
  lon: number;
  alt_baro: number | null;
  gs: number | null;
  track: number | null;
  squawk: string | null;
  type: string | null;
  mil: boolean;
}

export function useMilitaryAircraft() {
  const [aircraft, setAircraft] = useState<MilitaryAircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchData() {
      try {
        const res = await fetch('/api/military');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mountedRef.current) setAircraft(data);
      } catch {
        // silent fail, military is optional
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  return { aircraft, loading };
}
