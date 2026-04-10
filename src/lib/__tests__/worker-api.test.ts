/**
 * Tests for worker-api.ts — only the pure functions are testable.
 *
 * The Worker-based functions (convertInWorker, parseInWorker, diffInWorker,
 * jsonpathInWorker) rely on the Web Worker API (new Worker(), postMessage,
 * onmessage) which is not available in Node/Vitest without heavy mocking.
 * The timeout/termination logic is tightly coupled to the Worker instance
 * and cannot be meaningfully unit tested without an actual browser environment.
 *
 * Only shouldUseWorker() is a pure function suitable for unit testing.
 */
import { describe, it, expect } from 'vitest';
import { shouldUseWorker } from '../worker-api';

describe('shouldUseWorker', () => {
  it('returns false for small inputs', () => {
    expect(shouldUseWorker('hello')).toBe(false);
    expect(shouldUseWorker('x'.repeat(1000))).toBe(false);
  });

  it('returns false for exactly 512KB', () => {
    expect(shouldUseWorker('x'.repeat(512 * 1024))).toBe(false);
  });

  it('returns true for > 512KB', () => {
    expect(shouldUseWorker('x'.repeat(512 * 1024 + 1))).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(shouldUseWorker('')).toBe(false);
  });

  it('returns true for 1MB input', () => {
    expect(shouldUseWorker('x'.repeat(1024 * 1024))).toBe(true);
  });
});
