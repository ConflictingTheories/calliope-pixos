# Refactor Plan TODO

## Phase 1: Editor doc comments and types
- Add JSDoc comments for functions and React components in editor/src/
- Add or enhance type annotations using JSDoc or PropTypes
- Enforce ESLint code style rules for naming and formatting

## Phase 2: Pixoscript doc comments and typings
- Add comprehensive JSDoc comments matching existing TS typings in pixoscript/src/
- Maintain strict TS compiler compliance

## Phase 3: Pixospritz core alignment
- Review and align minor doc comment/style inconsistencies in pixospritz/src/

## Phase 4: Config files update
- Optionally update editor/.eslintrc.json for doc comment linting rules and naming conventions
- Optionally add Prettier config file for consistent formatting

## Phase 5: Testing and validation
- Run full ESLint with updated rules
- Run full TS build for pixoscript
- Conduct thorough manual testing across all affected areas for doc, types, naming, formatting, and modularity

---

# Next Step
Proceed with Phase 1: enhance editor/src/ doc comments, typing, and styling.
