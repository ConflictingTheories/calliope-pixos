# Editor performance harness (P3-11)

Regression-level performance tests for the editor.  Budgets in
`budgets.js` are generous wall-clock ceilings — a failure means a
real regression, not machine variance.

Run from the repo root:

```
npx vitest run packages/editor/tests/performance
```

## What is measured

| Budget key              | Operation                                        |
|-------------------------|--------------------------------------------------|
| `map.document.roundTrip`| parse/normalize/validate/serialize a 128×128 map trio |
| `map.pick.10k`          | 10,000 O(1) inverse-transform cell picks         |
| `map.chunks.10kDirty`   | 10,000 dirty-cell updates + chunk rebuild        |
| `commands.10k`          | 10,000 command executions + 100 undo/redo        |
| `history.50k`           | 50 strokes × 1,000 cells through the stroke accumulator |
| `journal.5k`            | 5,000 recovery-journal batches (memory backend)  |
| `cutscene.500nodes`     | full 60 Hz playthrough of a 500-node cutscene    |
| `export.200files`       | deterministic 200-file package export, twice, hash-compared |

The export test also asserts determinism: two exports of the same
project must produce identical SHA-256 hashes (P3-15).
