import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const API_URL = 'https://opensky-network.org/api';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.OPENSKY_CLIENT_ID!,
      client_secret: process.env.OPENSKY_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) throw new Error(`Auth ${res.status}`);
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

interface Waypoint {
  lat: number;
  lon: number;
  alt: number;
  time: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const icao24 = searchParams.get('icao24');
  if (!icao24) return NextResponse.json({ error: 'Missing icao24' }, { status: 400 });

  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/tracks/all?icao24=${icao24}&time=0`, {
      headers: { Authorization: `Bearer ${token}`, 'Accept-Encoding': 'gzip' },
    });

    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ path: [] });
      throw new Error(`Track API ${res.status}`);
    }

    const data = await res.json();
    const path: Waypoint[] = (data.path ?? [])
      .filter((p: unknown[]) => p[1] != null && p[2] != null)
      .map((p: unknown[]) => ({
        lat: p[1] as number,
        lon: p[2] as number,
        alt: (p[3] as number) ?? 0,
        time: p[0] as number,
      }));

    return NextResponse.json({ path, callsign: data.callsign });
  } catch (err) {
    console.error('Track error:', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
