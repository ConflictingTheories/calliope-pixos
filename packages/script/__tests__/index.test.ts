import { createEnv } from '../src/index.js';

describe('PixoScript', () => {
  test('createEnv returns environment with parse method', () => {
    const env = createEnv();
    expect(typeof env.parse).toBe('function');
    expect(typeof env.parseFile).toBe('function');
    expect(typeof env.loadLib).toBe('function');
  });

  test('parse and execute simple script', () => {
    const env = createEnv();
    const script = 'return 42';
    const parsed = env.parse(script);
    expect(typeof parsed.exec).toBe('function');
    const result = parsed.exec();
    expect(result).toBe(42);
  });

  test('parse and execute arithmetic', () => {
    const env = createEnv();
    const script = 'return 2 + 3 * 4';
    const result = env.parse(script).exec();
    expect(result).toBe(14);
  });

  test('parse and execute string concatenation', () => {
    const env = createEnv();
    const script = 'return "hello" .. " " .. "world"';
    const result = env.parse(script).exec();
    expect(result).toBe('hello world');
  });

  test('parse and execute function call', () => {
    const env = createEnv();
    const script = `
      function add(a, b)
        return a + b
      end
      return add(5, 3)
    `;
    const result = env.parse(script).exec();
    expect(result).toBe(8);
  });

  test('parse and execute table access', () => {
    const env = createEnv();
    const script = `
      local t = {x = 10, y = 20}
      return t.x + t.y
    `;
    const result = env.parse(script).exec();
    expect(result).toBe(30);
  });

  test('parse and execute conditional', () => {
    const env = createEnv();
    const script = `
      if 5 > 3 then
        return "greater"
      else
        return "less"
      end
    `;
    const result = env.parse(script).exec();
    expect(result).toBe('greater');
  });
});