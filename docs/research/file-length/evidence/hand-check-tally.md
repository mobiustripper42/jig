# Hand-check: selection and tally

## Selection

| repo | fix pairs (fix commit x source file) | picked, evenly spaced | 200+ line pairs not picked | 200+ supplement |
|---|---|---|---|---|
| centerline | 44 | 20 | 10 | 5 |
| soundings | 30 | 20 | 3 | 3 |
| muster | 697 | 20 | 440 | 5 |
| haul | 186 | 20 | 52 | 5 |
| sailbook | 306 | 20 | 83 | 5 |

## Tally (from hand-check/*-judged.tsv joined to hand-check/*-pairs.tsv)

| repo | part | band | pairs | hit: defect or revert | hit: cleanup or comment | miss: not a fix | miss: incidental | hit rate | defect-only rate |
|---|---|---|---|---|---|---|---|---|---|
| centerline | main (evenly spaced) | all | 20 | 11 | 7 | 0 | 2 | 0.90 | 0.55 |
| centerline | main + supplement | <200 | 11 | 7 | 2 | 0 | 2 | 0.82 | 0.64 |
| centerline | main + supplement | 200-400 | 4 | 3 | 1 | 0 | 0 | 1.00 | 0.75 |
| centerline | main + supplement | >400 | 10 | 5 | 5 | 0 | 0 | 1.00 | 0.50 |
| soundings | main (evenly spaced) | all | 20 | 7 | 11 | 0 | 2 | 0.90 | 0.35 |
| soundings | main + supplement | <200 | 15 | 6 | 9 | 0 | 0 | 1.00 | 0.40 |
| soundings | main + supplement | 200-400 | 8 | 3 | 3 | 0 | 2 | 0.75 | 0.38 |
| muster | main (evenly spaced) | all | 20 | 13 | 5 | 1 | 1 | 0.90 | 0.65 |
| muster | main + supplement | <200 | 5 | 4 | 1 | 0 | 0 | 1.00 | 0.80 |
| muster | main + supplement | 200-400 | 10 | 7 | 2 | 1 | 0 | 0.90 | 0.70 |
| muster | main + supplement | >400 | 10 | 7 | 2 | 0 | 1 | 0.90 | 0.70 |
| haul | main (evenly spaced) | all | 20 | 11 | 7 | 0 | 2 | 0.90 | 0.55 |
| haul | main + supplement | <200 | 12 | 7 | 4 | 0 | 1 | 0.92 | 0.58 |
| haul | main + supplement | 200-400 | 8 | 5 | 3 | 0 | 0 | 1.00 | 0.62 |
| haul | main + supplement | >400 | 5 | 3 | 1 | 0 | 1 | 0.80 | 0.60 |
| sailbook | main (evenly spaced) | all | 20 | 10 | 2 | 2 | 6 | 0.60 | 0.50 |
| sailbook | main + supplement | <200 | 13 | 6 | 2 | 1 | 4 | 0.62 | 0.46 |
| sailbook | main + supplement | 200-400 | 9 | 4 | 1 | 1 | 3 | 0.56 | 0.44 |
| sailbook | main + supplement | >400 | 3 | 1 | 0 | 1 | 1 | 0.33 | 0.33 |

| all repos, main + supplement | pairs | hit (any) | hit rate | defect-only hits | defect-only rate |
|---|---|---|---|---|---|
| <200 | 56 | 48 | 0.86 | 30 | 0.54 |
| 200-400 | 39 | 32 | 0.82 | 22 | 0.56 |
| >400 | 28 | 24 | 0.86 | 16 | 0.57 |
