/**
 * Tests for fileutils.ts — shared utilities across all 23 tools.
 * stripBom, isLargeInput, friendlyError, debounce.
 */
import { describe, it, expect } from 'vitest';
import { stripBom, isLargeInput, friendlyError } from '../fileutils';

describe('stripBom', () => {
  it('strips UTF-8 BOM from start of string', () => {
    expect(stripBom('\uFEFF{"hello":"world"}')).toBe('{"hello":"world"}');
  });

  it('returns string unchanged if no BOM', () => {
    expect(stripBom('{"hello":"world"}')).toBe('{"hello":"world"}');
  });

  it('handles empty string', () => {
    expect(stripBom('')).toBe('');
  });

  it('handles BOM-only string', () => {
    expect(stripBom('\uFEFF')).toBe('');
  });

  it('does not strip BOM in middle of string', () => {
    const s = 'abc\uFEFFdef';
    expect(stripBom(s)).toBe(s);
  });
});

describe('isLargeInput', () => {
  it('returns false for small strings', () => {
    expect(isLargeInput('hello')).toBe(false);
    expect(isLargeInput('x'.repeat(1000))).toBe(false);
  });

  it('returns false for exactly 5MB', () => {
    expect(isLargeInput('x'.repeat(5 * 1024 * 1024))).toBe(false);
  });

  it('returns true for > 5MB', () => {
    expect(isLargeInput('x'.repeat(5 * 1024 * 1024 + 1))).toBe(true);
  });
});

describe('friendlyError', () => {
  // Chrome/V8 modern format
  it('parses Chrome JSON error with line and column', () => {
    expect(friendlyError('Unexpected token at position 42 (line 3 column 5)'))
      .toBe('Syntax error at line 3, column 5');
  });

  it('parses Chrome JSON error with position only', () => {
    expect(friendlyError('Unexpected token at position 42'))
      .toBe('Syntax error at position 42');
  });

  // Chrome expected token format (first regex catches "at position N")
  it('parses Chrome "Expected" error via position regex', () => {
    expect(friendlyError("Expected ',' or ']' after array element in JSON at position 15"))
      .toBe("Syntax error at position 15");
  });

  // Unexpected token
  it('parses unexpected token with line', () => {
    expect(friendlyError('Unexpected token } in JSON at line 5'))
      .toBe('Unexpected character "}" (line 5)');
  });

  // Unexpected end
  it('parses unexpected end of JSON', () => {
    expect(friendlyError('Unexpected end of JSON input'))
      .toBe('Unexpected end of input — missing closing bracket, brace, or quote?');
  });

  // YAML errors
  it('parses YAML error format', () => {
    expect(friendlyError('bad indentation at line 4, column 2'))
      .toBe('YAML error at line 4, column 2');
  });

  // TOML errors
  it('parses TOML error without line number', () => {
    expect(friendlyError('Invalid TOML document: Unexpected character'))
      .toBe('TOML error: Unexpected character');
  });

  it('parses TOML error with line number', () => {
    expect(friendlyError('Invalid TOML document: bad key at line 5'))
      .toBe('TOML error: bad key (line 5)');
  });

  // Truncation
  it('truncates very long error messages', () => {
    const long = 'x'.repeat(200);
    const result = friendlyError(long);
    expect(result.length).toBeLessThanOrEqual(120);
    expect(result).toContain('...');
  });

  // Passthrough
  it('returns short messages as-is', () => {
    expect(friendlyError('Something failed')).toBe('Something failed');
  });
});
