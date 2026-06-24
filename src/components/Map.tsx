'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MAP_CONFIG } from '@/lib/map-config';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.invalidateSize();
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={MAP_CONFIG.defaultCenter}
      zoom={MAP_CONFIG.defaultZoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      className="z-0 h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        url={MAP_CONFIG.tileUrl}
        attribution={MAP_CONFIG.tileAttribution}
      />
    </MapContainer>
  );
}
