import L from 'leaflet';
import { getCategory, isEmergency } from '@/lib/aircraft-utils';
import type { AircraftCategory } from '@/lib/aircraft-utils';

const SVG_SHAPES: Record<Exclude<AircraftCategory, 'other'>, string> = {
  large: `<path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>`,
  small: `<path d="M19 14v-1.5l-6-3V4a1.5 1.5 0 0 0-1-1.4 1.5 1.5 0 0 0-1 1.4v5.5l-6 3V14l6-1.5V17l-1 .8V20l2.5-1 2.5 1v-2.2l-1-.8v-4.5l6 1.5z"/>`,
  helicopter: `<path d="M12 2v4.5l8 1.5v2l-8-1V12l3 1.5v1.5l-3-1v3l1 .8V20l-1-.5-1 .5v-2.2l1-.8v-3l-3 1v-1.5L9 12v-3l-8 1V8l8-1.5V2z"/>`,
};

const COLORS: Record<AircraftCategory | 'emergency', string> = {
  small: '#06b6d4',
  large: '#3b82f6',
  helicopter: '#22c55e',
  other: '#6b7280',
  emergency: '#ef4444',
};

interface IconOptions {
  heading: number;
  squawk: string | null;
  spi: boolean;
  category: number | null;
}

export function createPlaneIcon(opts: IconOptions): L.DivIcon {
  const cat = getCategory(opts.category);
  const emergency = isEmergency(opts.squawk, opts.spi);
  const key = cat === 'other' ? 'small' : cat;
  const shape = SVG_SHAPES[key];
  const color = emergency ? COLORS.emergency : COLORS[cat === 'other' ? 'small' : cat];
  const dot = emergency
    ? '<span style="position:absolute;inset:-6px;border-radius:50%;border:3px solid #ef4444;animation:pulse 1.5s infinite" />'
    : '';

  const size = 42;
  const svgSize = 32;

  const html = `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;transform:rotate(${opts.heading}deg)">
    <svg viewBox="0 0 24 24" width="${svgSize}" height="${svgSize}" fill="${color}" stroke="#fff" stroke-width="1.5">${shape}</svg>
    ${dot}
  </div>`;

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
