import airlines from 'airline-codes/airlines.json';

export interface AirlineInfo {
  name: string;
  icao: string;
  iata: string;
  callsign: string;
  country: string;
}

const SPECIAL: Record<string, AirlineInfo> = {
  SAM: { name: 'US Air Force Special Air Mission', icao: 'SAM', iata: '', callsign: 'SAM', country: 'United States' },
  REACH: { name: 'US Air Force Air Mobility Command', icao: 'RCH', iata: '', callsign: 'REACH', country: 'United States' },
  AFO: { name: 'Air Force One', icao: 'AFO', iata: '', callsign: 'AIR FORCE ONE', country: 'United States' },
  AF1: { name: 'Air Force One', icao: 'AFO', iata: '', callsign: 'AIR FORCE ONE', country: 'United States' },
  SPAR: { name: 'Special Priority Air Resource', icao: 'SPR', iata: '', callsign: 'SPAR', country: 'United States' },
  DUKE: { name: 'US Army', icao: 'DUK', iata: '', callsign: 'DUKE', country: 'United States' },
  JSTARS: { name: 'USAF Joint STARS', icao: 'JST', iata: '', callsign: 'JSTARS', country: 'United States' },
  ARIA: { name: 'NASA/USAF Advanced Range Instrumentation Aircraft', icao: 'ARI', iata: '', callsign: 'ARIA', country: 'United States' },
  NASA: { name: 'NASA', icao: 'NASA', iata: '', callsign: 'NASA', country: 'United States' },
  GOLD: { name: 'USAF Tanker (en route UK)', icao: 'GLD', iata: '', callsign: 'GOLD', country: 'United States' },
  COBRA: { name: 'US Army', icao: 'COB', iata: '', callsign: 'COBRA', country: 'United States' },
  VENUS: { name: 'US Navy', icao: 'VEN', iata: '', callsign: 'VENUS', country: 'United States' },
  NIGHT: { name: 'USAF Special Operations', icao: 'NGT', iata: '', callsign: 'NIGHT', country: 'United States' },
  GUARD: { name: 'US Coast Guard', icao: 'CGD', iata: '', callsign: 'CG GUARD', country: 'United States' },
  COAST: { name: 'US Coast Guard', icao: 'CGR', iata: '', callsign: 'COAST GUARD', country: 'United States' },
  CANFORCE: { name: 'Canadian Armed Forces', icao: 'CFC', iata: '', callsign: 'CANFORCE', country: 'Canada' },
  ASCOT: { name: 'Royal Air Force', icao: 'RAF', iata: '', callsign: 'ASCOT', country: 'United Kingdom' },
  KING: { name: 'Royal Air Force', icao: 'RFR', iata: '', callsign: 'KING', country: 'United Kingdom' },
  NATO: { name: 'NATO', icao: 'NATO', iata: '', callsign: 'NATO', country: 'NATO' },
  HUNTER: { name: 'USAF', icao: 'HUN', iata: '', callsign: 'HUNTER', country: 'United States' },
  LIFEGUARD: { name: 'Air Ambulance / MEDEVAC', icao: 'MED', iata: '', callsign: 'LIFEGUARD', country: 'International' },
  MEDEVAC: { name: 'Medical Evacuation', icao: 'MED', iata: '', callsign: 'MEDEVAC', country: 'International' },
  JANET: { name: 'Janet Airlines (USAF contract, Las Vegas)', icao: 'JNT', iata: '', callsign: 'JANET', country: 'United States' },
  TITAN: { name: 'USAF', icao: 'TTN', iata: '', callsign: 'TITAN', country: 'United States' },
};

const airlineMap = new Map<string, AirlineInfo>();

for (const a of airlines as any[]) {
  const icao = (a.icao || '').trim().toUpperCase();
  if (icao && icao !== 'N/A' && icao.length === 3) {
    if (!airlineMap.has(icao)) {
      airlineMap.set(icao, {
        name: a.name || 'Unknown',
        icao,
        iata: a.iata || '',
        callsign: (a.callsign || '').trim() || '',
        country: a.country || '',
      });
    }
  }
}

const SPECIAL_UPPER = new Map(Object.entries(SPECIAL).map(([k, v]) => [k.toUpperCase(), v]));

export function getAirlineInfo(callsign: string | null, operatorIcao?: string | null): AirlineInfo | null {
  if (!callsign && !operatorIcao) return null;

  if (operatorIcao) {
    const op = operatorIcao.trim().toUpperCase();
    const found = airlineMap.get(op);
    if (found) return found;
  }

  if (!callsign) return null;
  const cs = callsign.trim().toUpperCase();

  const prefix = cs.slice(0, 3);
  const found = airlineMap.get(prefix);
  if (found) return found;

  const foundSpecial = SPECIAL_UPPER.get(cs);
  if (foundSpecial) return foundSpecial;

  const prefix2 = cs.slice(0, 2);
  for (const [, v] of airlineMap) {
    if (v.icao.startsWith(prefix2)) return v;
  }

  return null;
}
