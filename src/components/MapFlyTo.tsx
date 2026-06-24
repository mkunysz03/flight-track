'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface Props {
  lat?: number;
  lng?: number;
}

export default function MapFlyTo({ lat, lng }: Props) {
  const map = useMap();

  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 12, { duration: 1.5 });
    }
  }, [lat, lng, map]);

  return null;
}
