/**
 * Convert the parts produced by `diffJson` (or any line-oriented diff from
 * the `diff` package) into an aligned array of rows for a side-by-side view.
 *
 * Each row carries a left/right cell with its own line number and kind:
 *   context     — line present unchanged on both sides (numbers on both)
 *   removed     — line on the left, blank on the right
 *   added       — line on the right, blank on the left
 *   placeholder — empty cell paired with content on the other side
 *
 * Consecutive removed + added parts are paired line-by-line so a value
 * change shows the old and new value on the same row. When one side is
 * longer, the surplus is filled with placeholders so vertical alignment
 * never drifts.
 *
 * The renderer can iterate the rows in order and never has to re-think
 * line numbering — `lineNumber` is `null` for placeholders only.
 */

export interface DiffPart {
  added?: boolean;
  removed?: boolean;
  value: string;
}

export type CellKind = "context" | "removed" | "added" | "placeholder";

export interface DiffCell {
  /** 1-based line number on this side, or null for placeholders. */
  lineNumber: number | null;
  text: string;
  kind: CellKind;
}

export interface DiffRow {
  left: DiffCell;
  right: DiffCell;
}

export interface AlignSummary {
  rows: DiffRow[];
  /** Net counts (post-pairing) so the summary line stays accurate. */
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

const PLACEHOLDER: DiffCell = { lineNumber: null, text: "", kind: "placeholder" };

/**
 * Split a part's `value` into individual lines, dropping the trailing empty
 * string that `String.split('\n')` produces when the value ends in a newline
 * (the trailing newline terminates the previous line; it does not start a
 * new one).
 */
function splitLines(value: string): string[] {
  if (value === "") return [];
  const lines = value.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function alignDiff(parts: DiffPart[]): AlignSummary {
  const rows: DiffRow[] = [];
  let leftN = 1;
  let rightN = 1;
  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;
  let pendingRemoved: string[] = [];

  const flushRemoved = () => {
    for (const line of pendingRemoved) {
      rows.push({
        left: { lineNumber: leftN++, text: line, kind: "removed" },
        right: PLACEHOLDER,
      });
      removed += 1;
    }
    pendingRemoved = [];
  };

  for (const part of parts) {
    const lines = splitLines(part.value);
    if (part.removed) {
      pendingRemoved.push(...lines);
      continue;
    }
    if (part.added) {
      if (pendingRemoved.length > 0) {
        // Pair removed + added line-by-line so a value change shows old + new
        // on the same row. Surplus on either side becomes plain remove/add
        // rows with placeholders so the visual alignment stays consistent.
        const pairLen = Math.min(pendingRemoved.length, lines.length);
        for (let i = 0; i < pairLen; i++) {
          rows.push({
            left: { lineNumber: leftN++, text: pendingRemoved[i], kind: "removed" },
            right: { lineNumber: rightN++, text: lines[i], kind: "added" },
          });
          changed += 1;
        }
        for (let i = pairLen; i < pendingRemoved.length; i++) {
          rows.push({
            left: { lineNumber: leftN++, text: pendingRemoved[i], kind: "removed" },
            right: PLACEHOLDER,
          });
          removed += 1;
        }
        for (let i = pairLen; i < lines.length; i++) {
          rows.push({
            left: PLACEHOLDER,
            right: { lineNumber: rightN++, text: lines[i], kind: "added" },
          });
          added += 1;
        }
        pendingRemoved = [];
        continue;
      }
      for (const line of lines) {
        rows.push({
          left: PLACEHOLDER,
          right: { lineNumber: rightN++, text: line, kind: "added" },
        });
        added += 1;
      }
      continue;
    }
    // Common (context) part — flush any pending removals first so they
    // appear in the right order, then emit the shared lines on both sides.
    flushRemoved();
    for (const line of lines) {
      rows.push({
        left: { lineNumber: leftN++, text: line, kind: "context" },
        right: { lineNumber: rightN++, text: line, kind: "context" },
      });
      unchanged += 1;
    }
  }
  flushRemoved();

  return { rows, added, removed, changed, unchanged };
}
