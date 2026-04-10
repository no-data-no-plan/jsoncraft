/**
 * Tests for ConversionEngine — the core conversion logic for all format converters.
 * Covers JSON, YAML, TOML, CSV conversions in all directions, edge cases, and warnings.
 */
import { describe, it, expect } from 'vitest';
import { ConversionEngine } from '../conversion-engine';

function engine(lang: 'en' | 'es' = 'en') {
  return new ConversionEngine(lang);
}

// ─── JSON → YAML ─────────────────────────────────────────────

describe('JSON → YAML', () => {
  it('converts a basic object', () => {
    const input = '{"name":"Alice","age":30}';
    const { output, warning } = engine().convert(input, 'json', 'yaml');
    expect(output).toContain('name: Alice');
    expect(output).toContain('age: 30');
    expect(warning).toBe('');
  });

  it('converts nested objects', () => {
    const input = JSON.stringify({ server: { host: 'localhost', port: 8080 } });
    const { output } = engine().convert(input, 'json', 'yaml');
    expect(output).toContain('server:');
    expect(output).toContain('  host: localhost');
    expect(output).toContain('  port: 8080');
  });

  it('converts arrays', () => {
    const input = JSON.stringify({ items: ['a', 'b', 'c'] });
    const { output } = engine().convert(input, 'json', 'yaml');
    expect(output).toContain('items:');
    expect(output).toContain('  - a');
    expect(output).toContain('  - b');
  });

  it('converts deeply nested structures', () => {
    const input = JSON.stringify({ a: { b: { c: { d: 'deep' } } } });
    const { output } = engine().convert(input, 'json', 'yaml');
    expect(output).toContain('d: deep');
  });

  it('warns on null values converted to YAML', () => {
    const input = 'null';
    const { output, warning } = engine().convert(input, 'json', 'yaml');
    expect(output.trim()).toBe('null');
    expect(warning).toContain('Null/empty value');
  });

  it('warns on primitive values', () => {
    const input = '"hello"';
    const { output, warning } = engine().convert(input, 'json', 'yaml');
    expect(output.trim()).toBe('hello');
    expect(warning).toContain('Primitive value');
  });
});

// ─── YAML → JSON ─────────────────────────────────────────────

describe('YAML → JSON', () => {
  it('converts basic key-value YAML', () => {
    const input = 'name: Alice\nage: 30';
    const { output } = engine().convert(input, 'yaml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.name).toBe('Alice');
    expect(parsed.age).toBe(30);
  });

  it('converts nested YAML', () => {
    const input = 'server:\n  host: localhost\n  port: 8080';
    const { output } = engine().convert(input, 'yaml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.server.host).toBe('localhost');
    expect(parsed.server.port).toBe(8080);
  });

  it('converts YAML arrays', () => {
    const input = 'items:\n  - a\n  - b\n  - c';
    const { output } = engine().convert(input, 'yaml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.items).toEqual(['a', 'b', 'c']);
  });

  it('handles multi-document YAML', () => {
    const input = 'name: Alice\n---\nname: Bob';
    const { output, warning } = engine().convert(input, 'yaml', 'json');
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(warning).toContain('Multi-document YAML');
  });

  it('warns on primitive YAML value', () => {
    const input = '42';
    const { output, warning } = engine().convert(input, 'yaml', 'json');
    expect(output.trim()).toBe('42');
    expect(warning).toContain('primitive');
  });
});

// ─── JSON → TOML ─────────────────────────────────────────────

describe('JSON → TOML', () => {
  it('converts a basic object', () => {
    const input = JSON.stringify({ name: 'Alice', age: 30 });
    const { output } = engine().convert(input, 'json', 'toml');
    expect(output).toContain('name = "Alice"');
    expect(output).toContain('age = 30');
  });

  it('converts nested objects to TOML sections', () => {
    const input = JSON.stringify({ server: { host: 'localhost', port: 8080 } });
    const { output } = engine().convert(input, 'json', 'toml');
    expect(output).toContain('[server]');
    expect(output).toContain('host = "localhost"');
    expect(output).toContain('port = 8080');
  });

  it('wraps root arrays in items key', () => {
    const input = JSON.stringify([1, 2, 3]);
    const { output, warning } = engine().convert(input, 'json', 'toml');
    expect(output).toContain('items');
    expect(warning).toContain("'items'");
  });

  it('replaces null values with empty string and warns', () => {
    const input = JSON.stringify({ key: null });
    const { output, warning } = engine().convert(input, 'json', 'toml');
    expect(output).toContain('key = ""');
    expect(warning).toContain('null replaced');
  });

  it('handles multiple null values with truncated warnings', () => {
    const input = JSON.stringify({ a: null, b: null, c: null, d: null, e: null });
    const { warning } = engine().convert(input, 'json', 'toml');
    expect(warning).toContain('...and more null values');
  });

  it('wraps primitive values', () => {
    const input = '42';
    const { output, warning } = engine().convert(input, 'json', 'toml');
    expect(output).toContain('value');
    expect(warning).toContain('Primitive');
  });

  it('handles null input to TOML', () => {
    const input = 'null';
    const { output, warning } = engine().convert(input, 'json', 'toml');
    expect(output).toContain('value = ""');
    expect(warning).toContain('Null value');
  });

  it('converts mixed-type arrays to strings with warning', () => {
    const input = JSON.stringify({ items: [1, 'two', true] });
    const { warning } = engine().convert(input, 'json', 'toml');
    expect(warning).toContain('Mixed-type array');
  });
});

// ─── TOML → JSON ─────────────────────────────────────────────

describe('TOML → JSON', () => {
  it('converts basic TOML', () => {
    const input = 'name = "Alice"\nage = 30';
    const { output } = engine().convert(input, 'toml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.name).toBe('Alice');
    expect(parsed.age).toBe(30);
  });

  it('converts TOML sections to nested objects', () => {
    const input = '[server]\nhost = "localhost"\nport = 8080';
    const { output } = engine().convert(input, 'toml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.server.host).toBe('localhost');
    expect(parsed.server.port).toBe(8080);
  });

  it('converts TOML arrays', () => {
    const input = 'features = ["auth", "logging"]';
    const { output } = engine().convert(input, 'toml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.features).toEqual(['auth', 'logging']);
  });

  it('handles boolean values', () => {
    const input = 'active = true\ndeleted = false';
    const { output } = engine().convert(input, 'toml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.active).toBe(true);
    expect(parsed.deleted).toBe(false);
  });
});

// ─── JSON → CSV ──────────────────────────────────────────────

describe('JSON → CSV', () => {
  it('converts flat array of objects', () => {
    const input = JSON.stringify([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    const { output } = engine().convert(input, 'json', 'csv');
    expect(output).toContain('name');
    expect(output).toContain('age');
    expect(output).toContain('Alice');
    expect(output).toContain('Bob');
    // Should have header row + 2 data rows
    const lines = output.trim().split('\n');
    expect(lines.length).toBe(3);
  });

  it('flattens nested objects with dot notation', () => {
    const input = JSON.stringify([
      { name: 'Alice', address: { city: 'London', zip: 'W1' } },
    ]);
    const { output, warning } = engine().convert(input, 'json', 'csv');
    expect(output).toContain('address.city');
    expect(output).toContain('address.zip');
    expect(warning).toContain('Nested objects flattened');
  });

  it('warns on single object (not array)', () => {
    const input = JSON.stringify({ name: 'Alice', age: 30 });
    const { output, warning } = engine().convert(input, 'json', 'csv');
    expect(output).toContain('Alice');
    expect(warning).toContain('Single object converted to one-row CSV');
  });

  it('handles empty array', () => {
    const input = '[]';
    const { output, warning } = engine().convert(input, 'json', 'csv');
    expect(output).toBe('');
    expect(warning).toContain('Empty array');
  });

  it('converts array of primitives to single-column CSV', () => {
    const input = JSON.stringify([1, 2, 3]);
    const { output, warning } = engine().convert(input, 'json', 'csv');
    expect(output).toContain('value');
    expect(warning).toContain('Array of primitives');
  });

  it('handles array of arrays', () => {
    const input = JSON.stringify([['name', 'age'], ['Alice', 30], ['Bob', 25]]);
    const { output, warning } = engine().convert(input, 'json', 'csv');
    expect(output).toContain('Alice');
    expect(output).toContain('Bob');
    expect(warning).toContain('Array of arrays');
  });

  it('wraps primitive value as single-cell CSV', () => {
    const input = '"hello"';
    const { output, warning } = engine().convert(input, 'json', 'csv');
    expect(output).toContain('value');
    expect(output).toContain('hello');
    expect(warning).toContain('Primitive value wrapped');
  });

  it('extracts array from wrapper object', () => {
    const input = JSON.stringify({
      data: [{ name: 'Alice' }, { name: 'Bob' }]
    });
    const { output, warning } = engine().convert(input, 'json', 'csv');
    expect(output).toContain('Alice');
    expect(output).toContain('Bob');
    expect(warning).toContain('Array extracted');
  });
});

// ─── CSV → JSON ──────────────────────────────────────────────

describe('CSV → JSON', () => {
  it('converts basic CSV with headers', () => {
    const input = 'name,age\nAlice,30\nBob,25';
    const { output } = engine().convert(input, 'csv', 'json');
    const parsed = JSON.parse(output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('Alice');
    expect(parsed[0].age).toBe(30);
  });

  it('detects tab-separated values', () => {
    const input = 'name\tage\nAlice\t30';
    const { output, warning } = engine().convert(input, 'csv', 'json');
    const parsed = JSON.parse(output);
    expect(parsed[0].name).toBe('Alice');
    expect(warning).toContain('Tab-separated');
  });

  it('detects semicolon-separated values', () => {
    const input = 'name;age\nAlice;30';
    const { output, warning } = engine().convert(input, 'csv', 'json');
    const parsed = JSON.parse(output);
    expect(parsed[0].name).toBe('Alice');
    expect(warning).toContain('Semicolon-separated');
  });

  it('converts numeric types automatically', () => {
    const input = 'val\n42\n3.14\ntrue';
    const { output } = engine().convert(input, 'csv', 'json');
    const parsed = JSON.parse(output);
    expect(parsed[0].val).toBe(42);
    expect(parsed[1].val).toBe(3.14);
    expect(parsed[2].val).toBe(true);
  });

  it('handles numeric-only headers', () => {
    const input = '1,2,3\n4,5,6';
    const { output, warning } = engine().convert(input, 'csv', 'json');
    const parsed = JSON.parse(output);
    expect(parsed[0]).toHaveProperty('col1');
    expect(warning).toContain('numeric');
  });
});

// ─── Invalid input handling ──────────────────────────────────

describe('Invalid input handling', () => {
  it('throws on malformed JSON', () => {
    expect(() => engine().convert('{bad json}', 'json', 'yaml')).toThrow();
  });

  it('throws on malformed TOML', () => {
    expect(() => engine().convert('[invalid\nno closing', 'toml', 'json')).toThrow();
  });

  it('throws on completely unparseable YAML used as JSON', () => {
    expect(() => engine().convert('not: [valid: json', 'json', 'yaml')).toThrow();
  });

  it('throws on unsupported input format', () => {
    expect(() => engine().convert('data', 'xml' as any, 'json')).toThrow('Unsupported input format');
  });

  it('throws on unsupported output format', () => {
    expect(() => engine().convert('{}', 'json', 'xml' as any)).toThrow('Unsupported output format');
  });
});

// ─── Empty input handling ────────────────────────────────────

describe('Empty input handling', () => {
  it('returns empty output for empty string', () => {
    const { output, warning } = engine().convert('', 'json', 'yaml');
    expect(output).toBe('');
    expect(warning).toBe('');
  });

  it('returns empty output for whitespace-only string', () => {
    const { output, warning } = engine().convert('   \n  \n  ', 'json', 'yaml');
    expect(output).toBe('');
    expect(warning).toBe('');
  });

  it('returns empty output for tabs-only string', () => {
    const { output } = engine().convert('\t\t', 'json', 'yaml');
    expect(output).toBe('');
  });
});

// ─── Warning generation (data loss) ─────────────────────────

describe('Warning generation', () => {
  it('warns when complex JSON is converted to CSV (nested flattening)', () => {
    const input = JSON.stringify([
      { user: { name: 'Alice', address: { city: 'London' } }, score: 10 },
    ]);
    const { warning } = engine().convert(input, 'json', 'csv');
    expect(warning).toContain('Nested objects flattened');
  });

  it('warns when root array is wrapped for TOML', () => {
    const input = JSON.stringify(['a', 'b', 'c']);
    const { warning } = engine().convert(input, 'json', 'toml');
    expect(warning).toContain("'items'");
  });

  it('warns on null values in TOML output', () => {
    const input = JSON.stringify({ a: null, b: 'ok' });
    const { warning } = engine().convert(input, 'json', 'toml');
    expect(warning).toContain('null replaced');
  });

  it('warns on multi-document YAML merge', () => {
    const input = 'a: 1\n---\nb: 2';
    const { warning } = engine().convert(input, 'yaml', 'json');
    expect(warning).toContain('Multi-document');
  });
});

// ─── Spanish (ES) locale warnings ───────────────────────────

describe('Spanish locale warnings', () => {
  it('produces ES warning for null TOML values', () => {
    const input = JSON.stringify({ key: null });
    const { warning } = engine('es').convert(input, 'json', 'toml');
    expect(warning).toContain('null reemplazado');
  });

  it('produces ES warning for root array in TOML', () => {
    const input = JSON.stringify([1, 2]);
    const { warning } = engine('es').convert(input, 'json', 'toml');
    expect(warning).toContain('Array raíz envuelto');
  });

  it('produces ES warning for multi-document YAML', () => {
    const input = 'a: 1\n---\nb: 2';
    const { warning } = engine('es').convert(input, 'yaml', 'json');
    expect(warning).toContain('YAML multi-documento');
  });

  it('produces ES warning for tab-separated CSV', () => {
    const input = 'name\tage\nAlice\t30';
    const { warning } = engine('es').convert(input, 'csv', 'json');
    expect(warning).toContain('tabulación');
  });
});

// ─── Roundtrip fidelity ──────────────────────────────────────

describe('Roundtrip fidelity', () => {
  it('JSON → YAML → JSON preserves data', () => {
    const original = { name: 'Alice', items: [1, 2, 3], nested: { a: true } };
    const e = engine();
    const yamlResult = e.convert(JSON.stringify(original), 'json', 'yaml');
    const jsonResult = new ConversionEngine().convert(yamlResult.output, 'yaml', 'json');
    expect(JSON.parse(jsonResult.output)).toEqual(original);
  });

  it('JSON → TOML → JSON preserves simple data', () => {
    const original = { name: 'Alice', port: 8080, active: true };
    const e = engine();
    const tomlResult = e.convert(JSON.stringify(original), 'json', 'toml');
    const jsonResult = new ConversionEngine().convert(tomlResult.output, 'toml', 'json');
    expect(JSON.parse(jsonResult.output)).toEqual(original);
  });

  it('JSON → CSV → JSON preserves flat array', () => {
    const original = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const e = engine();
    const csvResult = e.convert(JSON.stringify(original), 'json', 'csv');
    const jsonResult = new ConversionEngine().convert(csvResult.output, 'csv', 'json');
    expect(JSON.parse(jsonResult.output)).toEqual(original);
  });
});

// ─── BOM handling ────────────────────────────────────────────

describe('BOM handling', () => {
  it('strips BOM before parsing JSON', () => {
    const input = '\uFEFF{"name":"Alice"}';
    const { output } = engine().convert(input, 'json', 'yaml');
    expect(output).toContain('name: Alice');
  });

  it('strips BOM before parsing YAML', () => {
    const input = '\uFEFFname: Alice';
    const { output } = engine().convert(input, 'yaml', 'json');
    const parsed = JSON.parse(output);
    expect(parsed.name).toBe('Alice');
  });
});

// ─── Lang override via convert() parameter ───────────────────

describe('Lang override', () => {
  it('uses lang parameter from convert() over constructor', () => {
    const e = engine('en');
    const input = JSON.stringify({ key: null });
    const { warning } = e.convert(input, 'json', 'toml', 'es');
    expect(warning).toContain('null reemplazado');
  });
});
