'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Waypoint {
  lat: number;
  lon: number;
  alt: number;
}

interface Props {
  path: Waypoint[];
}

function altitudeColor(altM: number): string {
  const altFt = altM * 3.28084;
  if (altFt < 1000) return '#22c55e';
  if (altFt < 5000) return '#84cc16';
  if (altFt < 10000) return '#eab308';
  if (altFt < 20000) return '#f97316';
  if (altFt < 30000) return '#ef4444';
  if (altFt < 40000) return '#ec4899';
  return '#a855f7';
}

export default function FlightPath({ path: waypoints }: Props) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    if (!waypoints || waypoints.length < 2) return;

    const layer = L.layerGroup();

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const color = altitudeColor(p1.alt);

      const polyline = L.polyline(
        [[p1.lat, p1.lon], [p2.lat, p2.lon]],
        {
          color,
          weight: 3,
          opacity: 0.8,
          smoothFactor: 1,
        }
      );
      polyline.addTo(layer);
    }

    const last = waypoints[waypoints.length - 1];
    const current = L.circleMarker([last.lat, last.lon], {
      radius: 5,
      color: altitudeColor(last.alt),
      fillColor: '#fff',
      fillOpacity: 0.6,
      weight: 3,
    });
    current.addTo(layer);

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [waypoints, map]);

  return null;
}
