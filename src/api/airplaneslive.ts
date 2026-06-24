export interface AirplanesLiveAircraft {
  hex: string;
  flight: string | null;
  r: string | null;
  t: string | null;
  type: string | null;
  lat: number;
  lon: number;
  alt_baro: number | null;
  gs: number | null;
  track: number | null;
  squawk: string | null;
  category: string | null;
  mil: boolean;
  [key: string]: unknown;
}

export interface AirplanesLiveResponse {
  ac: AirplanesLiveAircraft[];
  now: number;
  total: number;
  ctime: number;
}

const BASE_URL = 'http://api.airplanes.live/v2';

export async function fetchMilitaryAircraft(): Promise<AirplanesLiveAircraft[]> {
  const res = await fetch(`${BASE_URL}/mil`, {
    headers: { 'Accept-Encoding': 'gzip' },
  });

  if (!res.ok) {
    throw new Error(`Airplanes.live error: ${res.status}`);
  }

  const data: AirplanesLiveResponse = await res.json();
  return data.ac ?? [];
}
