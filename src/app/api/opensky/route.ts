import { NextResponse } from 'next/server';
import { fetchOpenSkyStates } from '@/api/opensky';

let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 10_000;

export async function GET() {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const data = await fetchOpenSkyStates();
    cache = { data, timestamp: now };
    return NextResponse.json(data);
  } catch {
    if (cache) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 502 });
  }
}
