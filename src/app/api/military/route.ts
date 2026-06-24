import { NextResponse } from 'next/server';

const BASE_URL = 'http://api.airplanes.live/v2';

let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 10_000;

export async function GET() {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(`${BASE_URL}/mil`, {
      headers: { 'Accept-Encoding': 'gzip' },
    });

    if (!res.ok) throw new Error(`Airplanes.live error: ${res.status}`);

    const data = await res.json();
    const aircraft = (data.ac ?? []).map((a: Record<string, unknown>) => ({
      hex: a.hex,
      flight: a.flight,
      lat: a.lat,
      lon: a.lon,
      alt_baro: a.alt_baro,
      gs: a.gs,
      track: a.track,
      squawk: a.squawk,
      type: a.t,
      mil: true,
    }));

    cache = { data: aircraft, timestamp: now };
    return NextResponse.json(aircraft);
  } catch (err) {
    console.error('Airplanes.live error:', err);
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
