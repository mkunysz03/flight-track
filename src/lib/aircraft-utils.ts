export type AircraftCategory = 'small' | 'large' | 'helicopter' | 'other';

export function getCategory(cat: number | null): AircraftCategory {
  if (cat === null) return 'other';
  if (cat === 8) return 'helicopter';
  if (cat >= 2 && cat <= 3) return 'small';
  if (cat >= 4 && cat <= 7) return 'large';
  return 'other';
}

export function isEmergency(squawk: string | null, spi: boolean): boolean {
  if (spi) return true;
  if (!squawk) return false;
  return ['7500', '7600', '7700', '7777'].includes(squawk.trim());
}
