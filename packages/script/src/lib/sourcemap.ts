/**
 * Source Map Generator for PixoScript
 *
 * Generates source maps for mapping compiled JavaScript back to original
 * PixoScript source code. Enables debugging and meaningful error messages.
 *
 * Based on the Source Map Revision 3 Proposal:
 * https://sourcemaps.info/spec.html
 */

import { Table } from '../Table.js';
import { LuaError } from '../LuaError.js';

/** VLQ Base64 encoding characters */
const VLQ_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Mapping entry: generated position to source position */
interface Mapping {
  generatedLine: number;
  generatedColumn: number;
  sourceLine: number;
  sourceColumn: number;
  sourceIndex: number;
  nameIndex?: number;
}

/** Source map V3 format */
interface SourceMap {
  version: 3;
  file: string;
  sourceRoot: string;
  sources: string[];
  sourcesContent: (string | null)[];
  names: string[];
  mappings: string;
}

/**
 * Encode a single VLQ value
 */
function encodeVLQ(value: number): string {
  let encoded = '';
  let vlq = value < 0 ? (-value << 1) + 1 : value << 1;

  do {
    let digit = vlq & 0x1f;
    vlq >>>= 5;
    if (vlq > 0) {
      digit |= 0x20;
    }
    encoded += VLQ_CHARS[digit];
  } while (vlq > 0);

  return encoded;
}

/**
 * Decode a VLQ value from a string
 */
function decodeVLQ(encoded: string, index: number): { value: number; rest: number } {
  let value = 0;
  let shift = 0;
  let continuation: boolean;
  let i = index;

  do {
    const char = encoded.charAt(i++);
    const digit = VLQ_CHARS.indexOf(char);
    if (digit === -1) {
      throw new Error(`Invalid VLQ character: ${char}`);
    }
    continuation = (digit & 0x20) !== 0;
    value += (digit & 0x1f) << shift;
    shift += 5;
  } while (continuation);

  const isNegative = (value & 1) === 1;
  value >>>= 1;
  return {
    value: isNegative ? -value : value,
    rest: i,
  };
}

/**
 * SourceMapGenerator class for building source maps
 */
export class SourceMapGenerator {
  private file: string;
  private sourceRoot: string;
  private sources: string[] = [];
  private sourcesContent: (string | null)[] = [];
  private names: string[] = [];
  private mappings: Mapping[] = [];

  constructor(options: { file?: string; sourceRoot?: string } = {}) {
    this.file = options.file || '';
    this.sourceRoot = options.sourceRoot || '';
  }

  /**
   * Add a source file to the source map
   */
  addSource(source: string, content: string | null = null): number {
    let index = this.sources.indexOf(source);
    if (index === -1) {
      index = this.sources.length;
      this.sources.push(source);
      this.sourcesContent.push(content);
    }
    return index;
  }

  /**
   * Add a name (identifier) to the source map
   */
  addName(name: string): number {
    let index = this.names.indexOf(name);
    if (index === -1) {
      index = this.names.length;
      this.names.push(name);
    }
    return index;
  }

  /**
   * Add a mapping from generated code to source code
   */
  addMapping(mapping: {
    generated: { line: number; column: number };
    source: string;
    original: { line: number; column: number };
    name?: string;
  }): void {
    const sourceIndex = this.addSource(mapping.source);

    const entry: Mapping = {
      generatedLine: mapping.generated.line,
      generatedColumn: mapping.generated.column,
      sourceLine: mapping.original.line,
      sourceColumn: mapping.original.column,
      sourceIndex,
    };

    if (mapping.name) {
      entry.nameIndex = this.addName(mapping.name);
    }

    this.mappings.push(entry);
  }

  /**
   * Generate VLQ-encoded mappings string
   */
  private encodeMappings(): string {
    // Sort mappings by generated position
    const sorted = [...this.mappings].sort((a, b) => {
      if (a.generatedLine !== b.generatedLine) {
        return a.generatedLine - b.generatedLine;
      }
      return a.generatedColumn - b.generatedColumn;
    });

    let encoded = '';
    let prevGeneratedLine = 1;
    let prevGeneratedColumn = 0;
    let prevSourceIndex = 0;
    let prevSourceLine = 0;
    let prevSourceColumn = 0;
    let prevNameIndex = 0;

    for (let i = 0; i < sorted.length; i++) {
      const mapping = sorted[i];

      // Add semicolons for line changes
      while (prevGeneratedLine < mapping.generatedLine) {
        encoded += ';';
        prevGeneratedLine++;
        prevGeneratedColumn = 0;
      }

      // Add comma separator for same line
      if (i > 0 && sorted[i - 1].generatedLine === mapping.generatedLine) {
        encoded += ',';
      }

      // Encode generated column (relative)
      encoded += encodeVLQ(mapping.generatedColumn - prevGeneratedColumn);
      prevGeneratedColumn = mapping.generatedColumn;

      // Encode source index (relative)
      encoded += encodeVLQ(mapping.sourceIndex - prevSourceIndex);
      prevSourceIndex = mapping.sourceIndex;

      // Encode source line (relative)
      encoded += encodeVLQ(mapping.sourceLine - prevSourceLine);
      prevSourceLine = mapping.sourceLine;

      // Encode source column (relative)
      encoded += encodeVLQ(mapping.sourceColumn - prevSourceColumn);
      prevSourceColumn = mapping.sourceColumn;

      // Encode name index if present (relative)
      if (mapping.nameIndex !== undefined) {
        encoded += encodeVLQ(mapping.nameIndex - prevNameIndex);
        prevNameIndex = mapping.nameIndex;
      }
    }

    return encoded;
  }

  /**
   * Generate the source map object
   */
  toJSON(): SourceMap {
    return {
      version: 3,
      file: this.file,
      sourceRoot: this.sourceRoot,
      sources: this.sources,
      sourcesContent: this.sourcesContent,
      names: this.names,
      mappings: this.encodeMappings(),
    };
  }

  /**
   * Generate source map as JSON string
   */
  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  /**
   * Generate inline source map data URL
   */
  toDataURL(): string {
    const json = this.toString();
    const base64 = typeof btoa !== 'undefined' ? btoa(json) : Buffer.from(json).toString('base64');
    return `data:application/json;charset=utf-8;base64,${base64}`;
  }

  /**
   * Generate source map comment to append to generated code
   */
  toComment(): string {
    return '//# ' + 'sourceMappingURL=' + this.toDataURL();
  }
}

/**
 * SourceMapConsumer for reading and querying source maps
 */
export class SourceMapConsumer {
  private sourceMap: SourceMap;
  private decodedMappings: Mapping[] = [];

  constructor(sourceMap: SourceMap | string) {
    this.sourceMap = typeof sourceMap === 'string' ? JSON.parse(sourceMap) : sourceMap;
    this.decodeMappings();
  }

  /**
   * Decode the VLQ mappings string
   */
  private decodeMappings(): void {
    const { mappings } = this.sourceMap;
    let generatedLine = 1;
    let prevGeneratedColumn = 0;
    let prevSourceIndex = 0;
    let prevSourceLine = 0;
    let prevSourceColumn = 0;
    let prevNameIndex = 0;

    const segments = mappings.split(';');

    for (const segment of segments) {
      if (segment.length === 0) {
        generatedLine++;
        prevGeneratedColumn = 0;
        continue;
      }

      const parts = segment.split(',');
      for (const part of parts) {
        if (part.length === 0) continue;

        let index = 0;

        // Decode generated column
        const { value: genColDelta, rest: r1 } = decodeVLQ(part, index);
        index = r1;
        prevGeneratedColumn += genColDelta;

        if (index < part.length) {
          // Decode source index
          const { value: srcIdxDelta, rest: r2 } = decodeVLQ(part, index);
          index = r2;
          prevSourceIndex += srcIdxDelta;

          // Decode source line
          const { value: srcLineDelta, rest: r3 } = decodeVLQ(part, index);
          index = r3;
          prevSourceLine += srcLineDelta;

          // Decode source column
          const { value: srcColDelta, rest: r4 } = decodeVLQ(part, index);
          index = r4;
          prevSourceColumn += srcColDelta;

          const mapping: Mapping = {
            generatedLine,
            generatedColumn: prevGeneratedColumn,
            sourceIndex: prevSourceIndex,
            sourceLine: prevSourceLine,
            sourceColumn: prevSourceColumn,
          };

          // Decode name index if present
          if (index < part.length) {
            const { value: nameIdxDelta } = decodeVLQ(part, index);
            prevNameIndex += nameIdxDelta;
            mapping.nameIndex = prevNameIndex;
          }

          this.decodedMappings.push(mapping);
        }
      }

      generatedLine++;
      prevGeneratedColumn = 0;
    }
  }

  /**
   * Find the original position for a generated position
   */
  originalPositionFor(generated: { line: number; column: number }): {
    source: string | null;
    line: number | null;
    column: number | null;
    name: string | null;
  } {
    // Find the mapping for this position
    const mapping = this.decodedMappings.find(
      m => m.generatedLine === generated.line && m.generatedColumn <= generated.column
    );

    if (!mapping) {
      return { source: null, line: null, column: null, name: null };
    }

    return {
      source: this.sourceMap.sources[mapping.sourceIndex] || null,
      line: mapping.sourceLine,
      column: mapping.sourceColumn,
      name: mapping.nameIndex !== undefined ? this.sourceMap.names[mapping.nameIndex] : null,
    };
  }

  /**
   * Find the generated position for an original position
   */
  generatedPositionFor(original: { source: string; line: number; column: number }): {
    line: number | null;
    column: number | null;
  } {
    const sourceIndex = this.sourceMap.sources.indexOf(original.source);
    if (sourceIndex === -1) {
      return { line: null, column: null };
    }

    const mapping = this.decodedMappings.find(
      m =>
        m.sourceIndex === sourceIndex &&
        m.sourceLine === original.line &&
        m.sourceColumn <= original.column
    );

    if (!mapping) {
      return { line: null, column: null };
    }

    return {
      line: mapping.generatedLine,
      column: mapping.generatedColumn,
    };
  }

  /**
   * Get all sources
   */
  get sources(): string[] {
    return this.sourceMap.sources;
  }

  /**
   * Get source content for a source file
   */
  sourceContentFor(source: string): string | null {
    const index = this.sourceMap.sources.indexOf(source);
    if (index === -1) return null;
    return this.sourceMap.sourcesContent[index] || null;
  }
}

/**
 * PixoScript library table for source map support
 */
export const libSourceMap: Table = new Table();

// Create SourceMapGenerator through the library
libSourceMap.rawset('generator', (file?: string, sourceRoot?: string) => {
  const gen = new SourceMapGenerator({ file, sourceRoot });

  const table = new Table();

  table.rawset('addSource', (source: string, content?: string) =>
    gen.addSource(source, content || null)
  );

  table.rawset('addName', (name: string) => gen.addName(name));

  table.rawset(
    'addMapping',
    (
      genLine: number,
      genCol: number,
      source: string,
      origLine: number,
      origCol: number,
      name?: string
    ) => {
      gen.addMapping({
        generated: { line: genLine, column: genCol },
        source,
        original: { line: origLine, column: origCol },
        name,
      });
    }
  );

  table.rawset('toJSON', () => {
    const json = gen.toJSON();
    const result = new Table();
    result.rawset('version', json.version);
    result.rawset('file', json.file);
    result.rawset('sourceRoot', json.sourceRoot);
    result.rawset('mappings', json.mappings);

    const sources = new Table();
    json.sources.forEach((s, i) => sources.rawset(i + 1, s));
    result.rawset('sources', sources);

    const names = new Table();
    json.names.forEach((n, i) => names.rawset(i + 1, n));
    result.rawset('names', names);

    return result;
  });

  table.rawset('toString', () => gen.toString());
  table.rawset('toDataURL', () => gen.toDataURL());
  table.rawset('toComment', () => gen.toComment());

  return table;
});

// Create SourceMapConsumer through the library
libSourceMap.rawset('consumer', (sourceMapJSON: string) => {
  const consumer = new SourceMapConsumer(sourceMapJSON);

  const table = new Table();

  table.rawset('originalPositionFor', (line: number, column: number) => {
    const pos = consumer.originalPositionFor({ line, column });
    const result = new Table();
    result.rawset('source', pos.source);
    result.rawset('line', pos.line);
    result.rawset('column', pos.column);
    result.rawset('name', pos.name);
    return result;
  });

  table.rawset('generatedPositionFor', (source: string, line: number, column: number) => {
    const pos = consumer.generatedPositionFor({ source, line, column });
    const result = new Table();
    result.rawset('line', pos.line);
    result.rawset('column', pos.column);
    return result;
  });

  table.rawset('sourceContentFor', (source: string) => consumer.sourceContentFor(source));

  const sources = new Table();
  consumer.sources.forEach((s, i) => sources.rawset(i + 1, s));
  table.rawset('sources', sources);

  return table;
});

// VLQ encoding utilities exposed for testing
libSourceMap.rawset('encodeVLQ', encodeVLQ);
libSourceMap.rawset('decodeVLQ', (encoded: string, index?: number) => {
  const { value, rest } = decodeVLQ(encoded, index || 0);
  const result = new Table();
  result.rawset('value', value);
  result.rawset('rest', rest);
  return result;
});
