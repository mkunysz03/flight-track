import { NextRequest, NextResponse } from 'next/server';

let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 10_000;

const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const API_URL = 'https://opensky-network.org/api';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.OPENSKY_CLIENT_ID!,
      client_secret: process.env.OPENSKY_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth ${res.status}: ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export async function GET(request: NextRequest) {
  const now = Date.now();

  const { searchParams } = new URL(request.url);
  const lamin = searchParams.get('lamin');
  const lomin = searchParams.get('lomin');
  const lamax = searchParams.get('lamax');
  const lomax = searchParams.get('lomax');
  const hasBounds = lamin && lomin && lamax && lomax;

  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const token = await getToken();

    let url = `${API_URL}/states/all?extended=1`;
    if (hasBounds) {
      url += `&lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Encoding': 'gzip',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }

    const data = await res.json();
    const aircraft = (data.states ?? [])
      .filter((s: unknown[]) => s[5] !== null && s[6] !== null)
      .map((s: (string | number | boolean | number[] | null)[]) => ({
        icao24: s[0],
        callsign: s[1],
        origin_country: s[2],
        time_position: s[3],
        last_contact: s[4],
        longitude: s[5],
        latitude: s[6],
        baro_altitude: s[7],
        on_ground: s[8],
        velocity: s[9],
        true_track: s[10],
        vertical_rate: s[11],
        sensors: s[12],
        geo_altitude: s[13],
        squawk: s[14],
        spi: s[15],
        position_source: s[16],
        category: s[17],
      }));

    cache = { data: aircraft, timestamp: now };
    return NextResponse.json(aircraft);
  } catch (err) {
    console.error('OpenSky API error:', err);
    if (cache) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
