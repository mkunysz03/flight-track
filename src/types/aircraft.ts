export interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
  category: number | null;
}

export interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | number[] | null)[][] | null;
}

export interface Aircraft {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  baroAltitude: number;
  geoAltitude: number | null;
  onGround: boolean;
  velocity: number;
  trueTrack: number;
  verticalRate: number;
  squawk: string;
  category: number | null;
}

export function parseOpenSkyState(state: (string | number | boolean | number[] | null)[]): Aircraft | null {
  if (state.length < 17) return null;

  const lat = state[6] as number | null;
  const lng = state[5] as number | null;
  if (lat === null || lng === null) return null;

  return {
    icao24: state[0] as string,
    callsign: (state[1] as string)?.trim() || 'N/A',
    originCountry: state[2] as string,
    longitude: lng,
    latitude: lat,
    baroAltitude: state[7] as number | null ?? 0,
    geoAltitude: state[13] as number | null,
    onGround: state[8] as boolean,
    velocity: (state[9] as number | null ?? 0) * 1.94384,
    trueTrack: state[10] as number | null ?? 0,
    verticalRate: state[11] as number | null ?? 0,
    squawk: (state[14] as string | null) ?? '----',
    category: state[17] as number | null ?? null,
  };
}
