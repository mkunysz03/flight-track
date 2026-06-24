export const MAP_CONFIG = {
  defaultCenter: [52.0, 19.0] as [number, number],
  defaultZoom: 5,
  minZoom: 2,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

export const REFRESH_INTERVAL_MS = 10_000;
