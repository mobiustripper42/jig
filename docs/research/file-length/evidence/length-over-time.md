# Source-file length at dated points (ref origin/main, first-parent for dated points)

| repo | point | commit | date | files | median | p90 | max | >200 | >400 | total lines |
|---|---|---|---|---|---|---|---|---|---|---|
| centerline | 2026-09-19 | 59f05b5a | 2026-09-19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| centerline | 59f05b5 | 59f05b5a | 2026-09-19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| centerline | 2026-09-27 | 23c8787a | 2026-09-27 | 86 | 40.5 | 154 | 349 | 5 | 0 | 5754 |
| centerline | 91c7378 | 91c73787 | 2026-10-04 | 108 | 48 | 167 | 362 | 9 | 0 | 7728 |
| centerline | 2026-10-15 | 3d055180 | 2026-10-15 | 142 | 55.5 | 172 | 506 | 11 | 1 | 10958 |
| centerline | 2026-10-25 | 99826819 | 2026-10-25 | 152 | 55.5 | 173 | 628 | 13 | 2 | 12039 |
| centerline | 2026-11-01 | 60a516cc | 2026-11-01 | 158 | 56.5 | 172 | 693 | 14 | 3 | 13506 |
| centerline | origin/main | 500504dd | 2026-11-08 | 158 | 56.5 | 179 | 679 | 15 | 3 | 13378 |
| soundings | 2026-05-15 | fb100761 | 2026-05-15 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| soundings | 2e8f2d4 | 2e8f2d47 | 2026-06-13 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| soundings | 2026-07-15 | 41650d09 | 2026-07-15 | 14 | 55.5 | 184 | 259 | 1 | 0 | 1212 |
| soundings | 2026-08-15 | 4e94a915 | 2026-08-15 | 35 | 44 | 154 | 259 | 1 | 0 | 2377 |
| soundings | 2026-09-15 | 1814250e | 2026-09-15 | 79 | 82 | 208 | 435 | 10 | 1 | 8060 |
| soundings | origin/main | a879fb69 | 2026-10-08 | 79 | 82 | 208 | 435 | 10 | 1 | 8060 |
| muster | 2026-06-30 | 6bc844a2 | 2026-06-30 | 155 | 101 | 311 | 1002 | 32 | 7 | 21827 |
| muster | 167c34c2 | 167c34c2 | 2026-07-12 | 221 | 88 | 318 | 1307 | 40 | 13 | 30935 |
| muster | 692ebf75 | 692ebf75 | 2026-07-24 | 235 | 88 | 316 | 1366 | 44 | 13 | 33279 |
| muster | 2026-08-31 | 39b3f96a | 2026-08-31 | 371 | 113 | 345 | 2623 | 99 | 27 | 65795 |
| muster | 2026-09-30 | e0f02299 | 2026-09-30 | 405 | 121 | 356 | 3208 | 111 | 33 | 77118 |
| muster | 2026-10-31 | f6ba4e55 | 2026-10-31 | 446 | 121.5 | 348 | 3236 | 118 | 37 | 84058 |
| muster | origin/main | 906eadb9 | 2026-11-20 | 454 | 122.5 | 348 | 3380 | 120 | 37 | 85900 |
| haul | 2026-10-31 | da10b04b | 2026-10-31 | 44 | 47 | 107 | 306 | 1 | 0 | 2565 |
| haul | 2026-11-07 | 6bca081e | 2026-11-07 | 128 | 38 | 164 | 1109 | 7 | 4 | 10374 |
| haul | 2026-11-14 | b495d153 | 2026-11-14 | 206 | 50.5 | 208 | 1574 | 22 | 9 | 20868 |
| haul | origin/main | e79d837f | 2026-11-20 | 220 | 51.5 | 208 | 1732 | 24 | 10 | 22900 |
| sailbook | 2026-04-15 | b6fa102d | 2026-04-15 | 98 | 66 | 198 | 303 | 10 | 0 | 8610 |
| sailbook | 2026-05-01 | 7c086304 | 2026-05-01 | 150 | 70 | 205 | 653 | 16 | 1 | 14522 |
| sailbook | 2026-05-15 | 88ce2a16 | 2026-05-15 | 160 | 76.5 | 217 | 653 | 18 | 1 | 16159 |
| sailbook | 2026-06-01 | 88ce2a16 | 2026-06-01 | 160 | 76.5 | 217 | 653 | 18 | 1 | 16159 |
| sailbook | 2026-06-15 | 88ce2a16 | 2026-06-15 | 160 | 76.5 | 217 | 653 | 18 | 1 | 16159 |
| sailbook | 2026-07-01 | 9ad27acf | 2026-07-01 | 164 | 74.5 | 223 | 674 | 20 | 2 | 16706 |
| sailbook | origin/main | 1becdf41 | 2026-07-24 | 172 | 76.5 | 219 | 674 | 20 | 3 | 17581 |

# Exclusions at origin/main (files with a code extension, by reason)

- centerline: 158 source files kept; excluded configuration: 5, docs or workflow: 4, jig-canonical (synced from jig): 11, test: 94, test support (fixture, fake, mock): 2
- soundings: 79 source files kept; excluded test: 44, vendored: 1
  - generated or vendored: firmware/src/core/ed25519.cpp
- muster: 454 source files kept; excluded configuration: 6, docs or workflow: 27, jig-canonical (synced from jig): 12, test: 285, test support (fixture, fake, mock): 7
- haul: 220 source files kept; excluded configuration: 6, docs or workflow: 2, jig-canonical (synced from jig): 11, test: 190, test support (fixture, fake, mock): 7
- sailbook: 172 source files kept; excluded configuration: 4, generated (Supabase type output): 1, test: 79, test support (fixture, fake, mock): 1
  - generated or vendored: src/lib/supabase/types.ts

# centerline: files present at both 91c7378 and origin/main

- present at both: 107; grew: 49; shrank: 3; unchanged: 55
- only at 91c7378 (deleted or renamed since): 1; only at origin/main (new or renamed): 51
- crossed above 200: 2; fell to 200 or under: 0; crossed above 400: 3
- new files over 200 at origin/main: 5

| file | lines at 91c7378 | lines at origin/main | change |
|---|---|---|---|
| `mobile/App.tsx` | 337 | 679 | +342 |
| `app/map/streets-map.tsx` | 362 | 540 | +178 |
| `db/coverage.ts` | 266 | 538 | +272 |
| `mobile/useRecording.ts` | absent | 394 |  |
| `db/add-area.ts` | absent | 313 |  |
| `db/import-gpx.ts` | 268 | 312 | +44 |
| `src/gpx/parse-gpx.ts` | 286 | 293 | +7 |
| `db/cut-area.ts` | absent | 291 |  |
| `db/match.ts` | 169 | 263 | +94 |
| `app/import/track-list.tsx` | 124 | 258 | +134 |
| `db/load-streets.ts` | 213 | 242 | +29 |
| `db/area-stats.ts` | 213 | 221 | +8 |
| `mobile/RecordingPanels.tsx` | absent | 218 |  |
| `src/match/valhalla.ts` | 208 | 212 | +4 |
| `app/areas/areas-panel.tsx` | absent | 207 |  |
| `mobile/RecorderBench.tsx` | 205 | absent |  |
