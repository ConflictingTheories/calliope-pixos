/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – core perf tests (P3-11)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Command throughput, history coalescing, journal append,
 * cutscene clock playthrough, and deterministic export.
 */

import { describe, it } from 'vitest';
import { CommandBus } from '../../src/core/commands/commandBus.js';
import { CommandHistory, createStrokeAccumulator } from '../../src/core/commands/history.js';
import { RecoveryJournal, createMemoryBackend } from '../../src/core/recovery/journal.js';
import { TimelineClock } from '../../src/cutscene-tool/player/timelineClock.js';
import { ZipProjectRepository } from '../../src/core/project/repository.js';
import { expectWithinBudget } from './budgets.js';

describe('core performance', () => {
  it('executes 10k commands with undo/redo within budget', () => {
    expectWithinBudget('commands.10k', () => {
      const bus = new CommandBus({ /* minimal ProjectStore mock */ });
      let counter = 0;
      for (let i = 0; i < 10000; i++) {
        bus.execute({
          name: `perf.paint.${i}`,
          do: () => { counter += 1; },
          undo: () => { counter -= 1; },
        });
      }
      for (let i = 0; i < 100; i++) bus.undo();
      for (let i = 0; i < 100; i++) bus.redo();
      if (counter !== 10000) throw new Error('counter drift');
    });
  });

  it('records 50k coalesced stroke ops within budget', () => {
    expectWithinBudget('history.50k', () => {
      const history = new CommandHistory({ byteCap: 64 * 1024 * 1024 });
      const grid = new Map();
      const key = c => `${c.layer}:${c.x},${c.y}`;
      const applyCell = list => list.forEach(c => grid.set(key(c), c.after));
      const unapplyCell = list => list.forEach(c => grid.set(key(c), c.before));
      for (let stroke = 0; stroke < 50; stroke++) {
        const acc = createStrokeAccumulator();
        for (let i = 0; i < 1000; i++) {
          acc.add([{ x: (stroke * 997 + i) % 128, y: i % 128, layer: 0, before: 0, after: 1 }]);
        }
        history.push(acc.toCommand(`stroke ${stroke}`, applyCell, applyCell));
      }
    });
  });

  it('journals 5k command batches within budget', async () => {
    await expectWithinBudget('journal.5k', async () => {
      const journal = new RecoveryJournal(createMemoryBackend());
      for (let i = 0; i < 5000; i++) {
        await journal.journalBatch('perf', [{ name: 'paint', documents: ['map.json'] }], i);
      }
    });
  });

  it('plays a 500-node cutscene at 60Hz within budget', () => {
    const nodes = Array.from({ length: 500 }, (_, i) => ({
      id: `n${i}`,
      type: 'dialogue',
      duration: 1,
    }));
    expectWithinBudget('cutscene.500nodes', () => {
      const clock = new TimelineClock(nodes, { tickHz: 60 });
      clock.play();
      const step = 1 / 60;
      for (let t = 0; t < 500; t += step) clock.advance(step);
    });
  });

  it('builds a deterministic 200-file export twice within budget', async () => {
    const repo = new ZipProjectRepository();
    for (let i = 0; i < 200; i++) {
      await repo.write(`assets/file${i}.txt`, `content ${i}`.repeat(10));
    }
    await expectWithinBudget('export.200files', async () => {
      const a = await repo.exportProject();
      const b = await repo.exportProject();
      if (a.hash !== b.hash) throw new Error('non-deterministic export');
    });
  });
});
