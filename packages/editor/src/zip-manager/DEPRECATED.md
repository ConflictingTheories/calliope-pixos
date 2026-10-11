# zip-manager — deprecation notice (P3-13)

The `@zip.js/zip.js` FS API (`new FS()`, `zip.root` / `zip.children`
traversal) is **deprecated** for new code.

## Canonical path

`src/core/project/repository.js` — `ZipProjectRepository` (jszip-backed):

- `list(prefix)` / `read(path)` / `write(path, data)` / `delete(path)`
- `exportProject()` — **deterministic**: fixed entry dates
  (`DETERMINISTIC_DATE`), sorted order, SHA-256 hash returned
- `importProject(bytes)`

All migrated tools (image-preview, tile, sprite, script editors) go
through the repository. New code must use it.

## What still uses the old API

`src/zip-manager/services/zip-service.js` (`createZipFileSystem`) and
the shell's `zip.root`/`zip.children` traversal in `app.jsx`. These
stay until the P3-16 shell migration replaces the FS tree model with
the repository — the traversal shape is load-bearing in the file
browser, sibling-file discovery, and legacy (unmigrated) tools.

## Removal plan

1. Migrate remaining tools onto `createMigratedTool` (P3-10 pattern).
2. Replace `app.jsx` zip-tree traversal with `repository.list()`.
3. Delete `src/zip-manager/` and drop `@zip.js/zip.js` from
   `package.json`.

Do not add new imports of `@zip.js/zip.js`.
