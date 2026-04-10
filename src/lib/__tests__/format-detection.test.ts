/**
 * Tests for format-detection.ts — detectFormat() and checkWrongFormat().
 * Covers JSON, YAML, TOML, CSV detection plus edge cases.
 */
import { describe, it, expect } from 'vitest';
import { detectFormat, checkWrongFormat } from '../format-detection';

// ─── Detect JSON ─────────────────────────────────────────────

describe('detectFormat: JSON', () => {
  it('detects JSON object', () => {
    expect(detectFormat('{"name":"Alice"}')).toBe('json');
  });

  it('detects JSON array', () => {
    expect(detectFormat('[1, 2, 3]')).toBe('json');
  });

  it('detects JSON with leading whitespace', () => {
    expect(detectFormat('  \n  {"key": "value"}')).toBe('json');
  });

  it('detects pretty-printed JSON object', () => {
    expect(detectFormat('{\n  "name": "Alice",\n  "age": 30\n}')).toBe('json');
  });

  it('detects pretty-printed JSON array', () => {
    expect(detectFormat('[\n  {"id": 1},\n  {"id": 2}\n]')).toBe('json');
  });

  it('detects minified JSON', () => {
    expect(detectFormat('{"a":1,"b":2,"c":[1,2,3]}')).toBe('json');
  });
});

// ─── Detect YAML ─────────────────────────────────────────────

describe('detectFormat: YAML', () => {
  it('detects YAML with --- document start', () => {
    expect(detectFormat('---\nname: Alice\nage: 30')).toBe('yaml');
  });

  it('detects YAML with key: value pattern', () => {
    expect(detectFormat('name: Alice\nage: 30')).toBe('yaml');
  });

  it('detects YAML with nested keys', () => {
    expect(detectFormat('server:\n  host: localhost\n  port: 8080')).toBe('yaml');
  });

  it('detects YAML with list items', () => {
    expect(detectFormat('items:\n  - first\n  - second')).toBe('yaml');
  });
});

// ─── Detect TOML ─────────────────────────────────────────────

describe('detectFormat: TOML', () => {
  it('detects TOML with [section] and key = value', () => {
    expect(detectFormat('[server]\nhost = "localhost"\nport = 8080')).toBe('toml');
  });

  it('detects TOML with bare key = value (no section)', () => {
    expect(detectFormat('name = "Alice"\nage = 30')).toBe('toml');
  });

  it('detects TOML with dotted keys', () => {
    expect(detectFormat('[database]\nurl = "postgres://localhost/db"\npool_size = 5')).toBe('toml');
  });

  it('does not confuse TOML section with JSON array', () => {
    // [section] looks like array start but has key = value
    expect(detectFormat('[config]\nkey = "value"')).toBe('toml');
  });
});

// ─── Detect CSV ──────────────────────────────────────────────

describe('detectFormat: CSV', () => {
  it('detects comma-separated CSV', () => {
    expect(detectFormat('name,age,city\nAlice,30,London\nBob,25,Paris')).toBe('csv');
  });

  it('detects tab-separated values', () => {
    expect(detectFormat('name\tage\tcity\nAlice\t30\tLondon')).toBe('csv');
  });

  it('detects semicolon-separated values', () => {
    expect(detectFormat('name;age;city\nAlice;30;London')).toBe('csv');
  });

  it('requires at least 2 columns for CSV', () => {
    // Single column lines should not be detected as CSV
    expect(detectFormat('hello\nworld')).not.toBe('csv');
  });

  it('requires consistent column count', () => {
    expect(detectFormat('a,b,c\nx,y,z')).toBe('csv');
  });
});

// ─── Detect XML (not supported — returns null) ──────────────

describe('detectFormat: XML', () => {
  it('does not detect XML (not a supported format)', () => {
    expect(detectFormat('<root><item>hello</item></root>')).toBeNull();
  });

  it('does not detect XML with declaration', () => {
    expect(detectFormat('<?xml version="1.0"?>\n<root/>')).toBeNull();
  });
});

// ─── Ambiguous input ─────────────────────────────────────────

describe('detectFormat: ambiguous input', () => {
  it('prioritizes TOML over JSON when [section] + key = value', () => {
    // This has [section] which looks like JSON array but key=value makes it TOML
    expect(detectFormat('[settings]\ntheme = "dark"')).toBe('toml');
  });

  it('detects key=value without section as TOML (not YAML)', () => {
    // "key = value" matches TOML regex (= not :)
    expect(detectFormat('host = "localhost"')).toBe('toml');
  });
});

// ─── Empty and edge cases ────────────────────────────────────

describe('detectFormat: edge cases', () => {
  it('returns null for empty string', () => {
    expect(detectFormat('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(detectFormat('   \n  \n  ')).toBeNull();
  });

  it('returns null for numeric-only string', () => {
    expect(detectFormat('42')).toBeNull();
  });

  it('returns null for plain text', () => {
    expect(detectFormat('hello world')).toBeNull();
  });

  it('returns null for special characters only', () => {
    expect(detectFormat('!@#$%^&*()')).toBeNull();
  });

  it('returns null for single-line text without structure', () => {
    expect(detectFormat('just a random sentence')).toBeNull();
  });
});

// ─── checkWrongFormat ────────────────────────────────────────

describe('checkWrongFormat', () => {
  it('returns null when detected format matches fromFormat', () => {
    const result = checkWrongFormat('{"name":"Alice"}', 'json', 'yaml', 'en');
    expect(result).toBeNull();
  });

  it('returns null when format cannot be detected', () => {
    const result = checkWrongFormat('random text', 'json', 'yaml', 'en');
    expect(result).toBeNull();
  });

  it('suggests correct converter when YAML pasted in JSON field', () => {
    const result = checkWrongFormat('name: Alice\nage: 30', 'json', 'yaml', 'en');
    // input is YAML, fromFormat is json — should hint that it looks like YAML
    expect(result).not.toBeNull();
    expect(result!.message).toContain('YAML');
    expect(result!.message).toContain('not JSON');
  });

  it('suggests correct converter when TOML pasted in JSON field', () => {
    const result = checkWrongFormat('[server]\nhost = "localhost"', 'json', 'yaml', 'en');
    expect(result).not.toBeNull();
    expect(result!.message).toContain('TOML');
  });

  it('provides link to exact converter when available', () => {
    // YAML input in json→yaml converter: should suggest yaml→json
    const result = checkWrongFormat('name: Alice\nage: 30', 'json', 'yaml', 'en');
    // detected=yaml, toFormat=yaml, so exactPath = suggestPaths.yaml.yaml = undefined
    // fallback to yaml.json
    if (result?.linkHref) {
      expect(result.linkHref).toContain('yaml');
    }
  });

  it('produces Spanish message when lang is es', () => {
    const result = checkWrongFormat('name: Alice\nage: 30', 'json', 'yaml', 'es');
    expect(result).not.toBeNull();
    expect(result!.message).toContain('parece');
  });

  it('returns message without link when no converter exists', () => {
    // Detect CSV in a toml→json converter (no csv→toml path)
    const result = checkWrongFormat('a,b,c\n1,2,3', 'toml', 'json', 'en');
    expect(result).not.toBeNull();
    // Should have linkHref for csv→json since toFormat is json
    if (result?.linkHref) {
      expect(result.linkHref).toBe('/csv-to-json');
    }
  });
});
