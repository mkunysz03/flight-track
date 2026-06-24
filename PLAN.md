# Flight Track — Plan Implementacji

## Stack technologiczny

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Mapa:** Leaflet + react-leaflet + OpenStreetMap tiles
- **Styl:** Tailwind CSS v4
- **API data:** OpenSky Network (podstawowe) + airplanes.live (militarne + backup)
- **Cache backend:** Next.js API Routes z pamięcią podręczną w serwerze
- **Deploy:** Vercel (free tier)

---

## Etap 1 — Projekt + Podstawowa mapa

### Zadania
1. Inicjalizacja projektu Next.js z TypeScript i Tailwind
2. Instalacja zależności: `leaflet`, `react-leaflet`, `@types/leaflet`
3. Komponent `Map.tsx` — pełnoekranowa mapa Leaflet z OSM tiles
4. Podstawowy layout: mapa na cały ekran + pasek narzędzi górny
5. Obsługa dark mode (Tailwind)

### Pliki
- `src/app/layout.tsx` — root layout
- `src/app/page.tsx` — strona główna
- `src/components/Map.tsx` — mapa
- `src/components/Toolbar.tsx` — górny pasek
- `src/lib/map-config.ts` — konfiguracja mapy (domyślny zoom, center)

### Efekt końcowy
Działa mapa OSM na pełnym ekranie, responsywna, z podstawowym UI.

---

## Etap 2 — Integracja OpenSky Network

### Zadania
1. Rejestracja konta na `opensky-network.org`, utworzenie API klienta OAuth2
2. API Route `src/app/api/opensky/route.ts` — proxy do OpenSky z cache
3. Hook `src/hooks/useAircraftData.ts` — fetch danych co 10-15s
4. Komponent `AircraftMarkers.tsx` — renderowanie samolotów na mapie
5. Ikonki samolotów (SVG) z rotacją względem heading
6. Klasteryzacja markerów przy zoom-out (np. Leaflet.markercluster)
7. Podświetlanie samolotów wojskowych innym kolorem

### Pliki
- `src/api/opensky.ts` — klient OpenSky API
- `src/app/api/opensky/route.ts` — backend proxy z cache
- `src/hooks/useAircraftData.ts` — cykliczny fetch
- `src/components/AircraftMarkers.tsx` — warstwa markerów
- `src/types/aircraft.ts` — typy danych

### Detale cache
- Backend trzyma w `Map<timestamp, data>` ostatnią odpowiedź
- Odświeżanie co 10-12s
- Każdy user dostaje tę samą cached odpowiedź
- Zapobiega przekroczeniu limitu OpenSky (4000 req/dzień)

### Efekt końcowy
Na mapie widoczne są samoloty z nazwą, rotacją, kolorem (cywilny/wojskowy).

---

## Etap 3 — Panel detali samolotu

### Zadania
1. Po kliknięciu w marker → otwiera się `AircraftDetailPanel`
2. Panel boczny (lub modal na mobile) z danymi:
   - Linia lotnicza / operator
   - Numer lotu (callsign)
   - Typ maszyny + zdjęcie (placeholder lub JetPhotos)
   - Aktualna: wysokość, prędkość, kurs, pozycja
   - Skąd → dokąd (jeśli dostępne w danych)
   - Status: w powietrzu / na ziemi
3. Przycisk "Śledź" — pinowanie samolotu
4. Przycisk "Pokaż trasę" — rysowanie śladu lotu na mapie

### Pliki
- `src/components/AircraftDetailPanel.tsx`
- `src/components/FlightPath.tsx` — rysowanie trasy na mapie
- `src/hooks/useSelectedAircraft.ts` — stan wybranego samolotu

### Efekt końcowy
Kliknięcie w samolot pokazuje pełne info w panelu bocznym.

---

## Etap 4 — Warstwa wojskowa z airplanes.live

### Zadania
1. API Route `src/app/api/military/route.ts` — proxy do airplanes.live
2. Hook `useMilitaryAircraft.ts` — fetch danych wojskowych
3. Osobna warstwa `MilitaryMarkers.tsx` z innym stylem (np. czerwone/khaki ikonki)
4. Możliwość włączania/wyłączania warstwy wojskowej w Toolbar
5. Deduplikacja: jeśli samolot jest już w OpenSky, nie duplikuj go

### Pliki
- `src/api/airplaneslive.ts` — klient airplanes.live API
- `src/app/api/military/route.ts` — backend proxy
- `src/hooks/useMilitaryAircraft.ts`
- `src/components/MilitaryMarkers.tsx`
- `src/components/LayerToggle.tsx`

### Efekt końcowy
Opcjonalna warstwa pokazująca samoloty wojskowe z airplanes.live, oznaczona inaczej.

---

## Etap 5 — Wyszukiwanie i filtrowanie

### Zadania
1. Search bar w Toolbar — szukanie po:
   - Callsign (np. "LOT123")
   - ICAO hex (np. "3c6444")
   - Rejestracja (np. "SP-LAA")
2. Filtrowanie widocznych samolotów:
   - Wysokość (zakres suwakiem)
   - Prędkość (zakres)
   - Tylko wojskowe / tylko cywilne
   - Tylko w powietrzu / na ziemi
3. Wyniki wyszukiwania jako lista pod paskiem
4. Kliknięcie wyniku → wycentrowanie mapy i zaznaczenie samolotu

### Pliki
- `src/components/SearchBar.tsx`
- `src/components/FilterPanel.tsx`
- `src/hooks/useFilters.ts`

### Efekt końcowy
Można wyszukać dowolny lot i filtrować co widać na mapie.

---

## Etap 6 — Playback / Historia lotów

### Zadania
1. OpenSky API `/flights/all` z przedziałem czasowym (max 1h wstecz dla darmowego)
2. Pasek czasu na dole — przeciąganie po timeline
3. Przy przewijaniu: fetch historycznej pozycji, pokaż na mapie
4. Przycisk "Odtwórz" — automatyczne przewijanie (przyspieszone)
5. Zapis śladu lotu dla pojedynczego samolotu (polyline na mapie)

### Pliki
- `src/api/opensky-history.ts`
- `src/components/PlaybackBar.tsx`
- `src/components/Timeline.tsx`
- `src/hooks/usePlayback.ts`

### Efekt końcowy
Można cofnąć się w czasie do 1h i zobaczyć gdzie leciały samoloty.

---

## Etap 7 — Statystyki i lista lotów

### Zadania
1. Licznik na toolbar: "X samolotów na mapie, Y wojskowych"
2. Lista lotów (drawer boczny) — tabela z sortowaniem
3. Kolumny: callsign, typ, wysokość, prędkość, kurs, kraj
4. Kliknięcie w wiersz → wycentrowanie na mapie
5. Eksport do JSON bieżących danych

### Pliki
- `src/components/FlightList.tsx`
- `src/components/StatsBar.tsx`
- `src/hooks/useStats.ts`

### Efekt końcowy
Pełna lista lotów + statystyki w czasie rzeczywistym.

---

## Etap 8 — Optymalizacje i UX

### Zadania
1. Responsywność (mobile — mapa fullscreen, panele jako modale)
2. PWA (manifest + service worker)
3. Lazy loading komponentów (Next.js dynamic import)
4. Debounce fetch przy zmianie zoom/bounds
5. Animacje markerów (płynne przemieszczanie się)
6. Błąd API — fallback do drugiego źródła
7. Loader / skeleton podczas ładowania

### Pliki
- `public/manifest.json`
- `src/app/layout.tsx` (PWA meta)
- Poprawki w istniejących komponentach

### Efekt końcowy
Aplikacja działa szybko, responsywnie i ładnie na każdym urządzeniu.

---

## Etap 9 (opcjonalny) — Rozszerzenia

### Pomysły na przyszłość
- Warstwa pogodowa (windy, chmury z OpenWeatherMap)
- Alerty podejścia (powiadomienie gdy samolot w X km)
- Udostępnianie pozycji (link do konkretnego lotu)
- Integracja zdjęć z JetPhotos
- AR view (kamera + WebGL overlay)

---

## Linki do dokumentacji API

- **OpenSky Network REST API:** https://openskynetwork.github.io/opensky-api/rest.html
- **airplanes.live REST API Guide:** https://airplanes.live/api-guide/
- **airplanes.live Data Field Descriptions:** https://airplanes.live/rest-api-adsb-data-field-descriptions/
- **OpenStreetMap API v0.6:** https://wiki.openstreetmap.org/wiki/API_v0.6

## API Keys

| API | Wymagany klucz? | Status |
|---|---|---|
| **OpenSky Network** | Tak — OAuth2 (4000 kredytów/dzień) | ✅ Mam credentials |
| **airplanes.live** | ❌ Nie — działa bez auth | ✅ Gotowe |
| **OpenStreetMap tiles** | ❌ Nie — darmowe | ✅ Gotowe |
