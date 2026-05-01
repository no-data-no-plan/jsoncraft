import { describe, it, expect } from "vitest";
import { alignDiff, type DiffPart } from "./diff-align";

function part(value: string, kind: "common" | "added" | "removed" = "common"): DiffPart {
  if (kind === "added") return { added: true, value };
  if (kind === "removed") return { removed: true, value };
  return { value };
}

describe("alignDiff — primitives", () => {
  it("treats an empty input as an empty alignment", () => {
    const r = alignDiff([]);
    expect(r.rows).toHaveLength(0);
    expect(r.added).toBe(0);
    expect(r.removed).toBe(0);
  });

  it("renders an unchanged file as all-context rows on both sides", () => {
    const r = alignDiff([part("a\nb\nc\n")]);
    expect(r.rows).toHaveLength(3);
    expect(r.unchanged).toBe(3);
    expect(r.rows.every((row) => row.left.kind === "context" && row.right.kind === "context")).toBe(true);
    expect(r.rows[0].left.lineNumber).toBe(1);
    expect(r.rows[0].right.lineNumber).toBe(1);
    expect(r.rows[2].left.lineNumber).toBe(3);
    expect(r.rows[2].right.lineNumber).toBe(3);
  });
});

describe("alignDiff — pure additions and removals", () => {
  it("emits placeholders on the opposite side for additions", () => {
    const r = alignDiff([part("a\n"), part("b\n", "added")]);
    expect(r.added).toBe(1);
    expect(r.rows[1].left.kind).toBe("placeholder");
    expect(r.rows[1].right.kind).toBe("added");
    expect(r.rows[1].right.lineNumber).toBe(2);
  });

  it("emits placeholders on the opposite side for removals", () => {
    const r = alignDiff([part("a\n"), part("b\n", "removed")]);
    expect(r.removed).toBe(1);
    expect(r.rows[1].left.kind).toBe("removed");
    expect(r.rows[1].right.kind).toBe("placeholder");
    expect(r.rows[1].left.lineNumber).toBe(2);
  });
});

describe("alignDiff — paired changes", () => {
  it("pairs removed+added line-by-line on the same row", () => {
    const r = alignDiff([
      part('  "version": "1.0.0",\n', "removed"),
      part('  "version": "2.0.0",\n', "added"),
    ]);
    expect(r.rows).toHaveLength(1);
    expect(r.changed).toBe(1);
    const row = r.rows[0];
    expect(row.left.kind).toBe("removed");
    expect(row.right.kind).toBe("added");
    expect(row.left.text).toBe('  "version": "1.0.0",');
    expect(row.right.text).toBe('  "version": "2.0.0",');
    expect(row.left.lineNumber).toBe(1);
    expect(row.right.lineNumber).toBe(1);
  });

  it("when removed is longer, leftover removals become placeholders on the right", () => {
    const r = alignDiff([
      part("a\nb\nc\n", "removed"),
      part("x\n", "added"),
    ]);
    // 1 paired (a/x), 2 surplus removed (b, c) with placeholders.
    expect(r.changed).toBe(1);
    expect(r.removed).toBe(2);
    expect(r.added).toBe(0);
    expect(r.rows[0].left.text).toBe("a");
    expect(r.rows[0].right.text).toBe("x");
    expect(r.rows[1].right.kind).toBe("placeholder");
    expect(r.rows[2].right.kind).toBe("placeholder");
  });

  it("when added is longer, leftover additions become placeholders on the left", () => {
    const r = alignDiff([
      part("a\n", "removed"),
      part("x\ny\nz\n", "added"),
    ]);
    expect(r.changed).toBe(1);
    expect(r.removed).toBe(0);
    expect(r.added).toBe(2);
    expect(r.rows[1].left.kind).toBe("placeholder");
    expect(r.rows[2].left.kind).toBe("placeholder");
  });

  it("does not pair across an intervening context part", () => {
    const r = alignDiff([
      part("a\n", "removed"),
      part("b\n"),
      part("c\n", "added"),
    ]);
    // a → removed only; b → context; c → added only.
    expect(r.removed).toBe(1);
    expect(r.unchanged).toBe(1);
    expect(r.added).toBe(1);
    expect(r.changed).toBe(0);
    expect(r.rows).toHaveLength(3);
  });
});

describe("alignDiff — line numbers stay consistent across sides", () => {
  it("increments per-side independently regardless of the other side", () => {
    const r = alignDiff([
      part("a\n"),
      part("b\n", "removed"),
      part("c\n"),
      part("d\n", "added"),
      part("e\n"),
    ]);
    // Left line numbers: a=1, b=2, c=3, e=4 — and the placeholder for "d" has none.
    // Right line numbers: a=1, c=2, d=3, e=4.
    const left = r.rows.map((row) => row.left.lineNumber);
    const right = r.rows.map((row) => row.right.lineNumber);
    expect(left).toEqual([1, 2, 3, null, 4]);
    expect(right).toEqual([1, null, 2, 3, 4]);
  });
});

describe("alignDiff — JSON-like value change scenario", () => {
  it("aligns the changed line cleanly with surrounding context", () => {
    // Mirrors what diffJson produces for a single value change in the middle.
    const r = alignDiff([
      part('{\n  "name": "JSONCraft",\n'),
      part('  "version": "1.0.0",\n', "removed"),
      part('  "version": "2.0.0",\n', "added"),
      part('  "features": ["format"]\n}\n'),
    ]);
    expect(r.changed).toBe(1);
    expect(r.unchanged).toBe(4);
    // Find the changed row and verify both sides line up.
    const changedRow = r.rows.find((row) => row.left.kind === "removed" && row.right.kind === "added");
    expect(changedRow).toBeTruthy();
    expect(changedRow!.left.lineNumber).toBe(3);
    expect(changedRow!.right.lineNumber).toBe(3);
  });
});
