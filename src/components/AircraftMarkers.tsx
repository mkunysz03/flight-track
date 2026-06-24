'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { OpenSkyState } from '@/api/opensky';

interface Props {
  aircraft: OpenSkyState[];
  onBoundsChange?: (bounds: { lamin: number; lomin: number; lamax: number; lomax: number }) => void;
  onAircraftClick?: (a: OpenSkyState) => void;
}

export default function AircraftMarkers({ aircraft, onBoundsChange, onAircraftClick }: Props) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBoundsChange?.({
        lamin: b.getSouth(),
        lomin: b.getWest(),
        lamax: b.getNorth(),
        lomax: b.getEast(),
      });
    },
  });

  useEffect(() => {
    if (!clusterRef.current) {
      clusterRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 12,
      });
      map.addLayer(clusterRef.current);
    }

    const cluster = clusterRef.current;
    const existing = markersRef.current;
    const updatedKeys = new Set<string>();
    const bounds = map.getBounds();

    for (const a of aircraft) {
      if (a.latitude === null || a.longitude === null) continue;
      if (!bounds.contains([a.latitude, a.longitude])) continue;

      const key = a.icao24;
      updatedKeys.add(key);
      const heading = a.true_track ?? 0;

      const html = `<div style="transform:rotate(${heading}deg);display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="#3b82f6" stroke="#fff" stroke-width="1.5">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>`;

      if (existing.has(key)) {
        const marker = existing.get(key)!;
        const newPos: [number, number] = [a.latitude, a.longitude];
        const curPos = marker.getLatLng();
        if (Math.abs(curPos.lat - newPos[0]) > 0.01 || Math.abs(curPos.lng - newPos[1]) > 0.01) {
          marker.setLatLng(newPos);
        }
        const div = marker.getElement()?.querySelector('div');
        if (div) {
          div.style.transform = `rotate(${heading}deg)`;
        }
        marker.setTooltipContent(a.callsign?.trim() || a.icao24);
      } else {
        const icon = L.divIcon({
          className: '',
          html,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([a.latitude, a.longitude], { icon });
        marker.bindTooltip(a.callsign?.trim() || a.icao24, {
          direction: 'top',
          offset: L.point(0, -10),
        });
        marker.on('click', () => onAircraftClick?.(a));
        existing.set(key, marker);
        cluster.addLayer(marker);
      }
    }

    for (const [key, marker] of existing) {
      if (!updatedKeys.has(key)) {
        cluster.removeLayer(marker);
        marker.remove();
        existing.delete(key);
      }
    }

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
      markersRef.current.clear();
    };
  }, [aircraft, map]);

  return null;
}
