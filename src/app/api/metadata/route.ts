import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://opensky-network.org/api/metadata/aircraft/icao24';

let cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 3600_000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const icao24 = searchParams.get('icao24');
  if (!icao24) return NextResponse.json({ error: 'Missing icao24' }, { status: 400 });

  const now = Date.now();
  const cached = cache.get(icao24);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(`${API_URL}/${icao24}`, {
      headers: { 'Accept-Encoding': 'gzip' },
    });

    if (!res.ok) {
      if (res.status === 404) {
        const empty = {};
        cache.set(icao24, { data: empty, timestamp: now });
        return NextResponse.json(empty);
      }
      throw new Error(`Metadata API ${res.status}`);
    }

    const data = await res.json();
    cache.set(icao24, { data, timestamp: now });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Metadata error:', err);
    const cached = cache.get(icao24);
    if (cached) return NextResponse.json(cached.data);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
