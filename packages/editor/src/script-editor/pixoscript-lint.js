/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – PixoScript Linter
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (UX Phase 2, backlog 2.10 / finding A5.1) Lightweight
 * pixoscript diagnostics for Monaco.  This is not a full
 * language server — it catches the common, cheap-to-detect
 * mistakes so errors surface in the editor instead of only
 * at play time:
 *
 *  - unbalanced (), [], {} (checked at end of file)
 *  - unbalanced Lua block keywords (function/if/for/while/do vs end)
 *  - unknown pixos.* API calls (checked against PIXOS_API)
 *
 * Conservative by design: no diagnostic is emitted unless the
 * linter is confident, to avoid training users to ignore the
 * markers.
 */

import { PIXOS_API } from '../shared/pixoscript-language.js';

const KNOWN_APIS = new Set(Object.keys(PIXOS_API || {}));

/** Block openers in Lua-family syntax (pixoscript is Lua-based). */
const BLOCK_OPENERS = /\b(function|if\b.*\bthen|for\b.*\bdo|while\b.*\bdo|do)\b/g;
const BLOCK_CLOSER = /\bend\b/g;

/**
 * Strip strings and comments so structural checks don't trip on
 * `-- end` inside a comment or `"("` inside a string.
 * Best-effort: handles -- comments, --[[ ]] blocks, '...' "..." strings.
 */
function stripNoise(src) {
  return src
    .replace(/--\[\[[\s\S]*?\]\]/g, m => ' '.repeat(m.length))
    .replace(/--[^\n]*/g, m => ' '.repeat(m.length))
    .replace(/"(?:[^"\\]|\\.)*"/g, m => ' '.repeat(m.length))
    .replace(/'(?:[^'\\]|\\.)*'/g, m => ' '.repeat(m.length));
}

/**
 * @param {string} source
 * @returns {Array<{line:number, column:number, endLine:number, endColumn:number,
 *                   severity:'error'|'warning', message:string, code:string}>}
 */
export function lintPixoScript(source) {
  const diagnostics = [];
  if (!source || !source.trim()) return diagnostics;

  const lines = source.split('\n');
  const clean = stripNoise(source);
  const cleanLines = clean.split('\n');

  // 1. Bracket balance (whole file).
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const closers = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  cleanLines.forEach((line, i) => {
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (pairs[ch]) stack.push({ ch, line: i + 1, column: c + 1 });
      else if (closers[ch]) {
        const top = stack[stack.length - 1];
        if (top && pairs[top.ch] === ch) stack.pop();
        else {
          diagnostics.push({
            line: i + 1, column: c + 1, endLine: i + 1, endColumn: c + 2,
            severity: 'error',
            message: `Unmatched closing '${ch}' — no opening '${closers[ch]}'`,
            code: 'pxs/unmatched-closer',
          });
        }
      }
    }
  });
  for (const unclosed of stack) {
    diagnostics.push({
      line: unclosed.line, column: unclosed.column,
      endLine: unclosed.line, endColumn: unclosed.column + 1,
      severity: 'error',
      message: `Unclosed '${unclosed.ch}' — missing '${pairs[unclosed.ch]}'`,
      code: 'pxs/unclosed-bracket',
    });
  }

  // 2. Block keyword balance (function/if/for/while/do vs end).
  // Only counts when brackets are clean, to avoid cascade noise.
  if (stack.length === 0) {
    let opens = 0;
    let closes = 0;
    for (const line of cleanLines) {
      const o = line.match(BLOCK_OPENERS);
      if (o) opens += o.length;
      const cl = line.match(BLOCK_CLOSER);
      if (cl) closes += cl.length;
    }
    if (opens > closes) {
      diagnostics.push({
        line: lines.length, column: 1, endLine: lines.length, endColumn: 2,
        severity: 'error',
        message: `Missing ${opens - closes} 'end'${opens - closes === 1 ? '' : 's'} for block opener(s)`,
        code: 'pxs/missing-end',
      });
    } else if (closes > opens) {
      diagnostics.push({
        line: lines.length, column: 1, endLine: lines.length, endColumn: 2,
        severity: 'error',
        message: `Extra 'end' — no matching block opener`,
        code: 'pxs/extra-end',
      });
    }
  }

  // 3. Unknown pixos.* API calls.
  const apiRe = /\bpixos\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
  cleanLines.forEach((line, i) => {
    let m;
    while ((m = apiRe.exec(line)) !== null) {
      const full = `pixos.${m[1]}`;
      if (!KNOWN_APIS.has(full)) {
        // Suggest close matches (cheap edit-distance-free prefix check).
        const suggestion = [...KNOWN_APIS].find(k => k === full || k.startsWith(full + '_'));
        diagnostics.push({
          line: i + 1, column: m.index + 1,
          endLine: i + 1, endColumn: m.index + 1 + full.length,
          severity: 'warning',
          message: suggestion
            ? `Unknown API '${full}' — did you mean '${suggestion}'?`
            : `Unknown API '${full}' — not in the pixoscript API`,
          code: 'pxs/unknown-api',
        });
      }
    }
  });

  return diagnostics;
}

/**
 * Convert linter diagnostics to Monaco marker format.
 * @param {Array} diagnostics from lintPixoScript
 * @param {object} monacoInstance the monaco module
 */
export function toMonacoMarkers(diagnostics, monacoInstance) {
  const Severity = monacoInstance.MarkerSeverity;
  return diagnostics.map(d => ({
    startLineNumber: d.line,
    startColumn: d.column,
    endLineNumber: d.endLine,
    endColumn: d.endColumn,
    message: d.message,
    severity: d.severity === 'error' ? Severity.Error : Severity.Warning,
    code: d.code,
    source: 'pixolint',
  }));
}
