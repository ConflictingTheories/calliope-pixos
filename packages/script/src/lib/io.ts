/**
 * IO Library for PixoScript
 *
 * Provides basic input/output functionality for scripts.
 * For security, file system access is sandboxed and controlled.
 *
 * Based on Lua 5.3 io library (subset).
 */

import { Table } from '../Table.js';
import { LuaError } from '../LuaError.js';
import { LuaType, coerceArgToString, coerceToString, Config } from '../utils.js';

/**
 * File handle class for IO operations
 */
class FileHandle {
  private name: string;
  private mode: string;
  private content: string;
  private position: number;
  private closed: boolean;
  private lineData: string[];
  private lineIndex: number;

  constructor(name: string, content: string, mode: string = 'r') {
    this.name = name;
    this.content = content;
    this.mode = mode;
    this.position = 0;
    this.closed = false;
    this.lineData = content.split('\n');
    this.lineIndex = 0;
  }

  read(format: LuaType = '*l'): LuaType {
    if (this.closed) {
      throw new LuaError('attempt to use a closed file');
    }

    const fmt = coerceToString(format);

    switch (fmt) {
      case '*a':
      case 'a':
        // Read all remaining content
        const remaining = this.content.slice(this.position);
        this.position = this.content.length;
        return remaining || undefined;

      case '*l':
      case 'l':
        // Read a line (without newline)
        if (this.lineIndex >= this.lineData.length) return undefined;
        const line = this.lineData[this.lineIndex++];
        this.position += line.length + 1;
        return line;

      case '*L':
      case 'L':
        // Read a line (with newline)
        if (this.lineIndex >= this.lineData.length) return undefined;
        const lineWithNL = this.lineData[this.lineIndex++];
        this.position += lineWithNL.length + 1;
        return lineWithNL + '\n';

      case '*n':
      case 'n':
        // Read a number
        const numMatch = this.content.slice(this.position).match(/^\s*[+-]?[\d.]+/);
        if (!numMatch) return undefined;
        this.position += numMatch[0].length;
        return parseFloat(numMatch[0]);

      default:
        // Format is a number - read that many bytes
        const count = parseInt(fmt);
        if (isNaN(count)) {
          throw new LuaError(`bad argument #1 to 'read' (invalid format '${fmt}')`);
        }
        if (count <= 0) return '';
        const chunk = this.content.slice(this.position, this.position + count);
        this.position += chunk.length;
        return chunk || undefined;
    }
  }

  write(...args: LuaType[]): [FileHandle] | [undefined, string] {
    if (this.closed) {
      return [undefined, 'attempt to use a closed file'];
    }
    if (!this.mode.includes('w') && !this.mode.includes('a')) {
      return [undefined, 'Bad file descriptor'];
    }

    for (const arg of args) {
      const str = coerceToString(arg);
      if (this.mode.includes('a')) {
        this.content += str;
        this.position = this.content.length;
      } else {
        const before = this.content.slice(0, this.position);
        const after = this.content.slice(this.position + str.length);
        this.content = before + str + after;
        this.position += str.length;
      }
    }

    this.lineData = this.content.split('\n');
    return [this];
  }

  seek(whence: LuaType = 'cur', offset: LuaType = 0): number | [undefined, string] {
    if (this.closed) {
      return [undefined, 'attempt to use a closed file'];
    }

    const off = typeof offset === 'number' ? offset : 0;
    const w = coerceToString(whence);

    switch (w) {
      case 'set':
        this.position = off;
        break;
      case 'cur':
        this.position += off;
        break;
      case 'end':
        this.position = this.content.length + off;
        break;
      default:
        return [undefined, `bad argument #1 to 'seek' (invalid option '${w}')`];
    }

    this.position = Math.max(0, Math.min(this.position, this.content.length));

    // Recalculate line index
    let chars = 0;
    this.lineIndex = 0;
    for (const line of this.lineData) {
      if (chars >= this.position) break;
      chars += line.length + 1;
      this.lineIndex++;
    }

    return this.position;
  }

  flush(): boolean {
    // In-memory, no-op
    return true;
  }

  close(): boolean {
    this.closed = true;
    return true;
  }

  isClosed(): boolean {
    return this.closed;
  }

  getContent(): string {
    return this.content;
  }

  getName(): string {
    return this.name;
  }

  getLineIterator(): () => string | undefined {
    const self = this;
    return function () {
      return self.read('*l') as string | undefined;
    };
  }
}

/**
 * Create the IO library with configuration
 */
export function getLibIO(cfg: Config): Table {
  const libIO = new Table();

  // Virtual file system (in-memory)
  const virtualFS = new Map<string, string>();

  // Current input/output handles
  let stdin: FileHandle = new FileHandle('stdin', cfg.stdin || '', 'r');
  let stdout: { write: (...args: LuaType[]) => void } = {
    write: (...args) => {
      const output = args.map(a => coerceToString(a)).join('');
      if (cfg.stdout) {
        cfg.stdout(output);
      }
    },
  };
  let stderr = stdout; // Reuse stdout for stderr
  let currentInput: FileHandle = stdin;
  let currentOutput = stdout;

  /**
   * Open a file (from virtual FS or config loader)
   */
  function open(filename: LuaType, mode: LuaType = 'r'): [Table] | [undefined, string, number] {
    const name = coerceArgToString(filename, 'open', 1);
    const m = coerceArgToString(mode, 'open', 2);

    let content = '';

    // Check virtual FS first
    if (virtualFS.has(name)) {
      content = virtualFS.get(name)!;
    } else if (cfg.loadFile && cfg.fileExists) {
      // Try to load from config
      if (cfg.fileExists(name)) {
        content = cfg.loadFile(name);
      } else if (!m.includes('w') && !m.includes('a')) {
        return [undefined, `${name}: No such file or directory`, 2];
      }
    } else if (!m.includes('w') && !m.includes('a')) {
      return [undefined, `${name}: No such file or directory`, 2];
    }

    const handle = new FileHandle(name, content, m);

    // Create file table
    const fileTable = new Table();

    fileTable.rawset('read', (...args: LuaType[]) => handle.read(args[0]));
    fileTable.rawset('write', (...args: LuaType[]) => handle.write(...args));
    fileTable.rawset('seek', (whence?: LuaType, offset?: LuaType) => handle.seek(whence, offset));
    fileTable.rawset('flush', () => handle.flush());
    fileTable.rawset('close', () => {
      // Save content to virtual FS if writable
      if (m.includes('w') || m.includes('a')) {
        virtualFS.set(name, handle.getContent());
      }
      return handle.close();
    });
    fileTable.rawset('lines', () => handle.getLineIterator());

    return [fileTable];
  }

  libIO.rawset('open', open);

  /**
   * Close a file
   */
  libIO.rawset('close', (file?: Table) => {
    if (file) {
      const closeFn = file.get('close') as Function;
      if (closeFn) return closeFn();
    }
    return true;
  });

  /**
   * Read from current input (or specified file)
   */
  libIO.rawset('read', (...args: LuaType[]) => {
    if (args.length === 0) {
      return currentInput.read('*l');
    }
    return currentInput.read(args[0]);
  });

  /**
   * Write to current output
   */
  libIO.rawset('write', (...args: LuaType[]) => {
    currentOutput.write(...args);
    return true;
  });

  /**
   * Set/get current input file
   */
  libIO.rawset('input', (file?: LuaType) => {
    if (file === undefined) {
      // Return current input as table
      const t = new Table();
      t.rawset('read', (...args: LuaType[]) => currentInput.read(args[0]));
      t.rawset('lines', () => currentInput.getLineIterator());
      return t;
    }

    if (typeof file === 'string') {
      const [handle, err] = open(file, 'r');
      if (!handle) throw new LuaError(err || 'cannot open file');
      currentInput = new FileHandle(file, '', 'r');
    }
    return undefined;
  });

  /**
   * Set/get current output file
   */
  libIO.rawset('output', (file?: LuaType) => {
    if (file === undefined) {
      const t = new Table();
      t.rawset('write', (...args: LuaType[]) => {
        currentOutput.write(...args);
        return t;
      });
      return t;
    }

    if (typeof file === 'string') {
      const [handle, err] = open(file, 'w');
      if (!handle) throw new LuaError(err || 'cannot open file');
      // currentOutput = handle
    }
    return undefined;
  });

  /**
   * Flush output
   */
  libIO.rawset('flush', () => true);

  /**
   * Return an iterator for lines in a file
   */
  libIO.rawset('lines', (filename?: LuaType, ...formats: LuaType[]) => {
    if (filename === undefined) {
      return currentInput.getLineIterator();
    }

    const name = coerceArgToString(filename, 'lines', 1);
    const [handle, err] = open(name, 'r');
    if (!handle) {
      throw new LuaError(err || `cannot open file '${name}'`);
    }

    const readFn = handle.get('read') as Function;
    const closeFn = handle.get('close') as Function;
    const fmt = formats.length > 0 ? formats[0] : '*l';

    return function () {
      const result = readFn(fmt);
      if (result === undefined) {
        closeFn();
        return undefined;
      }
      return result;
    };
  });

  /**
   * Get file type
   */
  libIO.rawset('type', (file: LuaType) => {
    if (!(file instanceof Table)) return undefined;
    const closeFn = file.get('close');
    if (!closeFn) return undefined;
    // We can't really tell if closed without tracking state
    return 'file';
  });

  /**
   * Create a temporary file (virtual)
   */
  libIO.rawset('tmpfile', () => {
    const name = `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    virtualFS.set(name, '');
    return open(name, 'w+')[0];
  });

  /**
   * Print formatted string
   */
  libIO.rawset('popen', () => {
    throw new LuaError('io.popen is not supported for security reasons');
  });

  return libIO;
}
