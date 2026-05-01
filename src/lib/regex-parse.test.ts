import { describe, it, expect } from "vitest";
import { parseRegex, type AstNode } from "./regex-parse";

function ok(pattern: string, flags = "") {
  const r = parseRegex(pattern, flags);
  if (!r.ok) throw new Error(`expected ok parse, got: ${r.error}`);
  return r.ast;
}

function isKind<K extends AstNode["kind"]>(n: AstNode, k: K): n is Extract<AstNode, { kind: K }> {
  return n.kind === k;
}

describe("parseRegex — primitives", () => {
  it("parses a single literal as a literal node", () => {
    const ast = ok("a");
    expect(ast.kind).toBe("literal");
    if (isKind(ast, "literal")) expect(ast.text).toBe("a");
  });

  it("parses a sequence of literals as a sequence", () => {
    const ast = ok("abc");
    expect(ast.kind).toBe("sequence");
    if (isKind(ast, "sequence")) {
      expect(ast.children).toHaveLength(3);
      expect(ast.children.every((n) => n.kind === "literal")).toBe(true);
    }
  });

  it("parses anchors", () => {
    const ast = ok("^abc$");
    if (isKind(ast, "sequence")) {
      expect(ast.children[0].kind).toBe("anchor");
      expect(ast.children.at(-1)!.kind).toBe("anchor");
    } else {
      throw new Error("expected sequence");
    }
  });
});

describe("parseRegex — escapes", () => {
  it("recognises common shorthand classes", () => {
    const ast = ok("\\d\\w\\s\\D\\W\\S");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    const cats = ast.children.map((n) => (isKind(n, "escape") ? n.category : null));
    expect(cats).toEqual([
      "digit",
      "word",
      "whitespace",
      "nonDigit",
      "nonWord",
      "nonWhitespace",
    ]);
  });

  it("recognises word boundaries", () => {
    const ast = ok("\\bfoo\\B");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    const first = ast.children[0];
    const last = ast.children.at(-1)!;
    expect(first.kind === "escape" && first.category).toBe("wordBoundary");
    expect(last.kind === "escape" && last.category).toBe("nonWordBoundary");
  });

  it("recognises the any-char dot", () => {
    const ast = ok(".");
    expect(ast.kind === "escape" && ast.category).toBe("anyChar");
  });

  it("treats other escapes as literal characters", () => {
    const ast = ok("\\.\\(\\\\");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    expect(ast.children).toHaveLength(3);
    expect(ast.children.every((n) => n.kind === "escape" && n.category === "literalChar")).toBe(true);
  });
});

describe("parseRegex — quantifiers", () => {
  it("parses *, +, ? and applies to the previous atom", () => {
    const star = ok("a*");
    expect(star.kind).toBe("quantified");
    if (isKind(star, "quantified")) {
      expect(star.min).toBe(0);
      expect(star.max).toBe(Infinity);
      expect(star.greedy).toBe(true);
    }
    const plus = ok("a+");
    if (isKind(plus, "quantified")) {
      expect(plus.min).toBe(1);
      expect(plus.max).toBe(Infinity);
    }
    const opt = ok("a?");
    if (isKind(opt, "quantified")) {
      expect(opt.min).toBe(0);
      expect(opt.max).toBe(1);
    }
  });

  it("parses {n}, {n,}, {n,m}", () => {
    const exact = ok("a{3}");
    if (isKind(exact, "quantified")) {
      expect(exact.min).toBe(3);
      expect(exact.max).toBe(3);
    }
    const atLeast = ok("a{2,}");
    if (isKind(atLeast, "quantified")) {
      expect(atLeast.min).toBe(2);
      expect(atLeast.max).toBe(Infinity);
    }
    const ranged = ok("a{1,5}");
    if (isKind(ranged, "quantified")) {
      expect(ranged.min).toBe(1);
      expect(ranged.max).toBe(5);
    }
  });

  it("recognises lazy quantifiers", () => {
    const lazy = ok("a+?");
    if (isKind(lazy, "quantified")) {
      expect(lazy.greedy).toBe(false);
      expect(lazy.min).toBe(1);
    }
  });
});

describe("parseRegex — groups", () => {
  it("parses capture groups and assigns sequential indices", () => {
    const ast = ok("(a)(b)");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    const g1 = ast.children[0];
    const g2 = ast.children[1];
    if (isKind(g1, "group")) expect(g1.captureIndex).toBe(1);
    if (isKind(g2, "group")) expect(g2.captureIndex).toBe(2);
  });

  it("parses non-capture, named, and lookaround groups", () => {
    const types = [
      ["(?:abc)", "noncapture"],
      ["(?<word>foo)", "named"],
      ["(?=abc)", "lookahead"],
      ["(?!abc)", "negLookahead"],
      ["(?<=abc)", "lookbehind"],
      ["(?<!abc)", "negLookbehind"],
    ] as const;
    for (const [src, expected] of types) {
      const ast = ok(src);
      if (!isKind(ast, "group")) throw new Error(`expected group for ${src}`);
      expect(ast.groupKind).toBe(expected);
    }
  });

  it("named groups still bump the capture counter", () => {
    const ast = ok("(?<x>a)(?<y>b)");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    const a = ast.children[0];
    const b = ast.children[1];
    if (isKind(a, "group")) {
      expect(a.name).toBe("x");
      expect(a.captureIndex).toBe(1);
    }
    if (isKind(b, "group")) {
      expect(b.name).toBe("y");
      expect(b.captureIndex).toBe(2);
    }
  });
});

describe("parseRegex — alternation", () => {
  it("splits top-level alternation", () => {
    const ast = ok("foo|bar|baz");
    expect(ast.kind).toBe("alternation");
    if (isKind(ast, "alternation")) expect(ast.branches).toHaveLength(3);
  });

  it("scopes alternation to its enclosing group", () => {
    const ast = ok("(foo|bar)baz");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    const grp = ast.children[0];
    if (!isKind(grp, "group")) throw new Error("expected group first");
    expect(grp.child.kind).toBe("alternation");
  });
});

describe("parseRegex — character classes", () => {
  it("parses ranges and explicit chars", () => {
    const ast = ok("[a-z0-9_]");
    if (!isKind(ast, "class")) throw new Error("expected class");
    expect(ast.negated).toBe(false);
    expect(ast.items).toHaveLength(3);
    expect(ast.items[0]).toEqual({ kind: "range", from: "a", to: "z" });
    expect(ast.items[1]).toEqual({ kind: "range", from: "0", to: "9" });
    expect(ast.items[2]).toEqual({ kind: "char", value: "_" });
  });

  it("recognises negated classes", () => {
    const ast = ok("[^abc]");
    if (!isKind(ast, "class")) throw new Error("expected class");
    expect(ast.negated).toBe(true);
    expect(ast.items).toHaveLength(3);
  });

  it("preserves shorthand escapes inside a class", () => {
    const ast = ok("[\\d\\s]");
    if (!isKind(ast, "class")) throw new Error("expected class");
    expect(ast.items[0]).toMatchObject({ kind: "escape", category: "digit" });
    expect(ast.items[1]).toMatchObject({ kind: "escape", category: "whitespace" });
  });
});

describe("parseRegex — back-references", () => {
  it("parses numeric back-references", () => {
    const ast = ok("(a)\\1");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    const back = ast.children[1];
    if (!isKind(back, "backreference")) throw new Error("expected backreference");
    expect(back.ref).toBe(1);
  });

  it("parses named back-references", () => {
    const ast = ok("(?<x>a)\\k<x>");
    if (!isKind(ast, "sequence")) throw new Error("expected sequence");
    const back = ast.children[1];
    if (!isKind(back, "backreference")) throw new Error("expected backreference");
    expect(back.ref).toBe("x");
  });
});

describe("parseRegex — error reporting", () => {
  it("rejects patterns the JS engine itself rejects", () => {
    const r = parseRegex("[a-");
    expect(r.ok).toBe(false);
  });

  it("rejects unterminated groups", () => {
    const r = parseRegex("(abc");
    expect(r.ok).toBe(false);
  });
});

describe("parseRegex — real-world patterns", () => {
  it("handles an email-ish pattern end-to-end", () => {
    const r = parseRegex("^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$", "i");
    expect(r.ok).toBe(true);
  });

  it("handles a hex colour pattern", () => {
    const r = parseRegex("^#?([a-f0-9]{6}|[a-f0-9]{3})$", "i");
    expect(r.ok).toBe(true);
  });

  it("handles a URL-ish pattern with alternation, groups and quantifiers", () => {
    const r = parseRegex("^https?:\\/\\/(?:[\\w-]+\\.)+[a-z]{2,}(\\/.*)?$", "i");
    expect(r.ok).toBe(true);
  });

  it("preserves source positions for hover highlighting", () => {
    const r = parseRegex("a(bc)d");
    if (!r.ok) throw new Error("expected ok");
    if (!isKind(r.ast, "sequence")) throw new Error("expected sequence");
    const grp = r.ast.children[1];
    if (!isKind(grp, "group")) throw new Error("expected group");
    expect(grp.pos).toBe(1);
    expect(grp.end).toBe(5);
  });
});
