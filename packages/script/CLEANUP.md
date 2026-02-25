# CLEANUP.md

## File & Structure References

- `src/lib/math.ts`: Remove deprecated Lua math functions and update to modern equivalents.
- `src/lib/os.ts`, `lib/string.ts`: Implement missing features and remove outdated comments.
- `src/lib/table.ts`: Refactor remove logic and audit for obsolete list handling.

## Concepts

- Remove deprecated syntax and legacy Lua compatibility features.
- Refactor parser and scope management for clarity and performance.
- Audit built-in library functions for completeness and modern standards.
