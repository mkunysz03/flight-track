'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MilitaryAircraft } from '@/hooks/useMilitaryAircraft';

interface Props {
  aircraft: MilitaryAircraft[];
  visible: boolean;
}

export default function MilitaryMarkers({ aircraft, visible }: Props) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!layerRef.current) {
      layerRef.current = L.layerGroup();
      map.addLayer(layerRef.current);
    }

    const layer = layerRef.current;
    const existing = markersRef.current;
    const updatedKeys = new Set<string>();

    if (!visible) {
      layer.clearLayers();
      existing.clear();
      return;
    }

    for (const a of aircraft) {
      if (a.lat == null || a.lon == null) continue;

      const key = a.hex;
      updatedKeys.add(key);
      const heading = a.track ?? 0;

      const html = `<div style="transform:rotate(${heading}deg);display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="#dc2626" stroke="#fff" stroke-width="1.5">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>`;

      if (existing.has(key)) {
        const marker = existing.get(key)!;
        const newPos: [number, number] = [a.lat, a.lon];
        const curPos = marker.getLatLng();
        if (Math.abs(curPos.lat - newPos[0]) > 0.01 || Math.abs(curPos.lng - newPos[1]) > 0.01) {
          marker.setLatLng(newPos);
        }
        const div = marker.getElement()?.querySelector('div');
        if (div) div.style.transform = `rotate(${heading}deg)`;
        marker.setTooltipContent(a.flight?.trim() || a.hex);
      } else {
        const icon = L.divIcon({
          className: '',
          html,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([a.lat, a.lon], { icon });
        marker.bindTooltip(a.flight?.trim() || a.hex, {
          direction: 'top',
          offset: L.point(0, -10),
        });
        existing.set(key, marker);
        layer.addLayer(marker);
      }
    }

    for (const [key, marker] of existing) {
      if (!updatedKeys.has(key)) {
        layer.removeLayer(marker);
        marker.remove();
        existing.delete(key);
      }
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      markersRef.current.clear();
    };
  }, [aircraft, visible, map]);

  return null;
}
