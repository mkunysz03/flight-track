'use client';

import { useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { OpenSkyState } from '@/api/opensky';

const PLANE_ICON = L.divIcon({
  className: '',
  html: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#3b82f6" stroke="#fff" stroke-width="1.5">
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface Props {
  aircraft: OpenSkyState[];
}

export default function AircraftMarkers({ aircraft }: Props) {
  const map = useMap();

  const markers = useMemo(() => {
    const layerGroup = L.layerGroup();

    for (const a of aircraft) {
      if (a.latitude === null || a.longitude === null) continue;

      const heading = a.true_track ?? 0;
      const icon = L.divIcon({
        className: '',
        html: `<div style="transform:rotate(${heading}deg);transition:transform 0.3s">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#3b82f6" stroke="#fff" stroke-width="1.2">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([a.latitude, a.longitude], { icon });
      marker.bindTooltip(a.callsign?.trim() || a.icao24, {
        direction: 'top',
        offset: L.point(0, -12),
      });
      (marker as unknown as Record<string, unknown>).aircraftData = a;
      layerGroup.addLayer(marker);
    }

    return layerGroup;
  }, [aircraft]);

  useEffect(() => {
    markers.addTo(map);
    const layer = markers;
    return () => {
      map.removeLayer(layer);
    };
  }, [map, markers]);

  return null;
}
