'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { OpenSkyState } from '@/api/opensky';

interface SelectedContext {
  selected: OpenSkyState | null;
  select: (a: OpenSkyState | null) => void;
}

const Ctx = createContext<SelectedContext>({ selected: null, select: () => {} });

export function SelectedProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<OpenSkyState | null>(null);
  return <Ctx.Provider value={{ selected, select: setSelected }}>{children}</Ctx.Provider>;
}

export function useSelectedAircraft() {
  return useContext(Ctx);
}
