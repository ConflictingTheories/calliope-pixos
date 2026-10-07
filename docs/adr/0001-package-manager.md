# ADR 0001 — Standardize on npm workspaces

**Status:** accepted
**Date:** 2026-10-06
**Deciders:** Kyle Derby MacInnis

## Context

The monorepo declared yarn workspaces (`packages/*`) with a yarn v1 lockfile, but
every script shell-out used bare `yarn` commands and the repo had been idle 8 months.
npm is the default toolchain on CI images and contributor machines; maintaining two
mental models (yarn for install, npm n/a) added friction. P0-01 required one
package manager and one lockfile policy.

## Decision

- **npm** is the package manager: `packageManager: npm@10.9.2`, `engines: node >= 20, npm >= 10`.
- All root scripts use npm workspace commands (`npm run <script> -w <pkg>`).
- `package-lock.json` is the canonical lockfile. `yarn.lock` remains tracked only
  until the first `npm install` generates `package-lock.json`, at which point
  `yarn.lock` is removed (it is not deleted in this change because no
  `package-lock.json` can be produced in a static-only environment).

## Consequences

- `npm ci && npm run build` is the fresh-clone path; CI pins Node 20.
- Contributors must not add yarn-specific configuration.

## Alternatives considered

- **Stay on yarn v1:** rejected — v1 is legacy, and the drift risk after 8 idle months
  favored the toolchain with the widest default availability.
- **pnpm:** rejected — migration cost higher, no demonstrated need for its
  strictness yet; revisit if install times become a bottleneck.

## Links

- Related tickets: P0-01, P0-02, P0-03
