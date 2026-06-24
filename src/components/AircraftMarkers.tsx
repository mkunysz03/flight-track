'use client';

import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { OpenSkyState } from '@/api/opensky';
import { createPlaneIcon } from './AircraftIcons';

interface Props {
  aircraft: OpenSkyState[];
  onBoundsChange?: (bounds: { lamin: number; lomin: number; lamax: number; lomax: number }) => void;
  onAircraftClick?: (a: OpenSkyState) => void;
}

interface Stamped {
  heading: number;
  squawk: string | null;
  spi: boolean;
  category: number | null;
}

function sendBounds(map: L.Map, cb: Props['onBoundsChange']) {
  const b = map.getBounds();
  cb?.({
    lamin: b.getSouth(),
    lomin: b.getWest(),
    lamax: b.getNorth(),
    lomax: b.getEast(),
  });
}

export default function AircraftMarkers({ aircraft, onBoundsChange, onAircraftClick }: Props) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const stampsRef = useRef<Map<string, Stamped>>(new Map());
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const boundsSent = useRef(false);

  useMapEvents({
    moveend: () => sendBounds(map, onBoundsChange),
    zoomend: () => sendBounds(map, onBoundsChange),
  });

  useEffect(() => {
    if (!boundsSent.current) {
      sendBounds(map, onBoundsChange);
      boundsSent.current = true;
    }
  }, [map, onBoundsChange]);

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
    const stamps = stampsRef.current;
    const updatedKeys = new Set<string>();
    const bounds = map.getBounds();

    for (const a of aircraft) {
      if (a.latitude === null || a.longitude === null) continue;
      if (!bounds.contains([a.latitude, a.longitude])) continue;

      const key = a.icao24;
      updatedKeys.add(key);
      const heading = a.true_track ?? 0;
      const stamp: Stamped = { heading, squawk: a.squawk, spi: a.spi, category: a.category };

      if (existing.has(key)) {
        const marker = existing.get(key)!;
        const prev = stamps.get(key)!;

        const posChanged =
          Math.abs(marker.getLatLng().lat - a.latitude) > 0.01 ||
          Math.abs(marker.getLatLng().lng - a.longitude) > 0.01;
        const iconChanged =
          stamp.heading !== prev.heading ||
          stamp.squawk !== prev.squawk ||
          stamp.spi !== prev.spi ||
          stamp.category !== prev.category;

        if (posChanged || iconChanged) {
          if (posChanged) marker.setLatLng([a.latitude, a.longitude]);
          if (iconChanged) marker.setIcon(createPlaneIcon({ heading, squawk: a.squawk, spi: a.spi, category: a.category }));
        }
        stamps.set(key, stamp);
        marker.setTooltipContent(a.callsign?.trim() || a.icao24);
      } else {
        const icon = createPlaneIcon({ heading, squawk: a.squawk, spi: a.spi, category: a.category });
        const marker = L.marker([a.latitude, a.longitude], { icon });
        marker.bindTooltip(a.callsign?.trim() || a.icao24, {
          direction: 'top',
          offset: L.point(0, -10),
        });
        marker.on('click', () => onAircraftClick?.(a));
        existing.set(key, marker);
        stamps.set(key, stamp);
        cluster.addLayer(marker);
      }
    }

    for (const [key, marker] of existing) {
      if (!updatedKeys.has(key)) {
        cluster.removeLayer(marker);
        marker.remove();
        existing.delete(key);
        stamps.delete(key);
      }
    }

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
      markersRef.current.clear();
      stampsRef.current.clear();
    };
  }, [aircraft, map, onAircraftClick]);

  return null;
}
