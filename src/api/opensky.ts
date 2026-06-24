const OPENSKY_AUTH_URL = 'https://opensky-network.org/api/token';
const OPENSKY_API_URL = 'https://opensky-network.org/api';

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(OPENSKY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.OPENSKY_CLIENT_ID!,
      client_secret: process.env.OPENSKY_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenSky auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

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

export async function fetchOpenSkyStates(): Promise<OpenSkyState[]> {
  const token = await getAccessToken();

  const res = await fetch(`${OPENSKY_API_URL}/states/all?extended=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept-Encoding': 'gzip',
    },
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error(`OpenSky API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.states || !Array.isArray(data.states)) {
    return [];
  }

  return data.states.map((state: (string | number | boolean | number[] | null)[]) => ({
    icao24: state[0] as string,
    callsign: state[1] as string | null,
    origin_country: state[2] as string,
    time_position: state[3] as number | null,
    last_contact: state[4] as number,
    longitude: state[5] as number | null,
    latitude: state[6] as number | null,
    baro_altitude: state[7] as number | null,
    on_ground: state[8] as boolean,
    velocity: state[9] as number | null,
    true_track: state[10] as number | null,
    vertical_rate: state[11] as number | null,
    sensors: state[12] as number[] | null,
    geo_altitude: state[13] as number | null,
    squawk: state[14] as string | null,
    spi: state[15] as boolean,
    position_source: state[16] as number,
    category: state[17] as number | null,
  }));
}
