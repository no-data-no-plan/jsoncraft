/**
 * Pragmatic JavaScript regex parser for the visualizer.
 *
 * Goal: reach a faithful AST for the syntax users actually type — capture
 * groups, alternation, character classes with ranges, common backslash
 * escapes, quantifiers (greedy + lazy), anchors, lookaround, named groups,
 * and back-references. We do NOT try to be a fully-spec-compliant regex
 * engine; if a pattern stumps the parser we surface a typed error and the
 * UI falls back to “visualization not available” instead of pretending.
 *
 * Returned positions are 0-based indices into the original pattern string —
 * they let the renderer highlight the matching slice when the user hovers
 * over a node.
 */

export type EscapeCategory =
  | "digit"
  | "nonDigit"
  | "word"
  | "nonWord"
  | "whitespace"
  | "nonWhitespace"
  | "wordBoundary"
  | "nonWordBoundary"
  | "tab"
  | "newline"
  | "carriageReturn"
  | "nullChar"
  | "anyChar"
  | "literalChar"
  | "unicodeEscape"
  | "hexEscape";

export type AstNode =
  | { kind: "sequence"; pos: number; end: number; children: AstNode[] }
  | { kind: "alternation"; pos: number; end: number; branches: AstNode[] }
  | {
      kind: "group";
      pos: number;
      end: number;
      groupKind:
        | "capture"
        | "noncapture"
        | "named"
        | "lookahead"
        | "negLookahead"
        | "lookbehind"
        | "negLookbehind";
      name?: string;
      captureIndex?: number;
      child: AstNode;
    }
  | {
      kind: "quantified";
      pos: number;
      end: number;
      min: number;
      max: number; // Infinity for unbounded
      greedy: boolean;
      child: AstNode;
    }
  | { kind: "literal"; pos: number; end: number; text: string }
  | {
      kind: "escape";
      pos: number;
      end: number;
      raw: string;
      // Semantic category lets the explainer pick the right description
      // without re-matching the raw text on every render.
      category: EscapeCategory;
    }
  | {
      kind: "class";
      pos: number;
      end: number;
      negated: boolean;
      raw: string;
      items: ClassItem[];
    }
  | {
      kind: "anchor";
      pos: number;
      end: number;
      anchor: "start" | "end";
    }
  | {
      kind: "backreference";
      pos: number;
      end: number;
      ref: number | string;
      raw: string;
    };

export type ClassItem =
  | { kind: "char"; value: string }
  | { kind: "range"; from: string; to: string }
  | { kind: "escape"; raw: string; category: EscapeCategory };

export interface ParseResult {
  ok: true;
  ast: AstNode;
  flags: string;
  pattern: string;
}
export interface ParseError {
  ok: false;
  error: string;
  position?: number;
}
export type ParseOutcome = ParseResult | ParseError;

class Cursor {
  pos = 0;
  // Capture-group counter mirrors the runtime regex engine's numbering so
  // back-references resolve to the right group in the visualisation.
  captureCount = 0;
  constructor(public src: string) {}
  peek(off = 0): string | undefined {
    return this.src[this.pos + off];
  }
  match(s: string): boolean {
    if (this.src.startsWith(s, this.pos)) {
      this.pos += s.length;
      return true;
    }
    return false;
  }
  eat(): string {
    return this.src[this.pos++];
  }
  done(): boolean {
    return this.pos >= this.src.length;
  }
}

class RegexParseError extends Error {
  constructor(
    message: string,
    public position: number,
  ) {
    super(message);
  }
}

export function parseRegex(pattern: string, flags = ""): ParseOutcome {
  if (typeof pattern !== "string") {
    return { ok: false, error: "pattern must be a string" };
  }
  // Validate via the JS engine first — keeps us from rendering nonsense for
  // patterns the runtime would reject anyway, and gives a familiar error.
  try {
    new RegExp(pattern, flags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  const c = new Cursor(pattern);
  try {
    const ast = parseAlternation(c, /* atTopLevel */ true);
    if (!c.done()) {
      throw new RegexParseError(`unexpected character "${c.peek()}" at position ${c.pos}`, c.pos);
    }
    return { ok: true, ast, flags, pattern };
  } catch (e) {
    if (e instanceof RegexParseError) {
      return { ok: false, error: e.message, position: e.position };
    }
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function parseAlternation(c: Cursor, atTopLevel: boolean): AstNode {
  const start = c.pos;
  const branches: AstNode[] = [parseSequence(c, atTopLevel)];
  while (c.peek() === "|") {
    c.eat();
    branches.push(parseSequence(c, atTopLevel));
  }
  if (branches.length === 1) return branches[0];
  return { kind: "alternation", pos: start, end: c.pos, branches };
}

function parseSequence(c: Cursor, atTopLevel: boolean): AstNode {
  const start = c.pos;
  const children: AstNode[] = [];
  while (!c.done()) {
    const ch = c.peek();
    if (ch === "|") break;
    if (!atTopLevel && ch === ")") break;
    const atom = parseAtom(c);
    children.push(maybeQuantify(c, atom));
  }
  if (children.length === 1) return children[0];
  return { kind: "sequence", pos: start, end: c.pos, children };
}

function maybeQuantify(c: Cursor, atom: AstNode): AstNode {
  const next = c.peek();
  if (next !== "*" && next !== "+" && next !== "?" && next !== "{") return atom;
  const start = atom.pos;
  let min = 0;
  let max: number = Infinity;
  if (next === "*") {
    c.eat();
  } else if (next === "+") {
    c.eat();
    min = 1;
  } else if (next === "?") {
    c.eat();
    max = 1;
  } else {
    // {n} | {n,} | {n,m}
    const saved = c.pos;
    c.eat(); // {
    const n = readDigits(c);
    if (n === null) {
      // Not actually a quantifier — restore and treat as literal "{".
      c.pos = saved;
      return atom;
    }
    if (c.peek() === "}") {
      c.eat();
      min = n;
      max = n;
    } else if (c.peek() === ",") {
      c.eat();
      const m = readDigits(c);
      if (c.peek() !== "}") {
        // Bail back to literal on malformed counts. JS accepts {a,b} as
        // literal characters in non-strict-unicode patterns.
        c.pos = saved;
        return atom;
      }
      c.eat();
      min = n;
      max = m === null ? Infinity : m;
    } else {
      c.pos = saved;
      return atom;
    }
  }
  let greedy = true;
  if (c.peek() === "?") {
    c.eat();
    greedy = false;
  }
  return {
    kind: "quantified",
    pos: start,
    end: c.pos,
    min,
    max,
    greedy,
    child: atom,
  };
}

function readDigits(c: Cursor): number | null {
  let s = "";
  while (!c.done() && c.peek()! >= "0" && c.peek()! <= "9") s += c.eat();
  return s.length === 0 ? null : parseInt(s, 10);
}

function parseAtom(c: Cursor): AstNode {
  const start = c.pos;
  const ch = c.peek();
  if (ch === undefined) {
    throw new RegexParseError("unexpected end of pattern", c.pos);
  }
  if (ch === "(") return parseGroup(c);
  if (ch === "[") return parseClass(c);
  if (ch === "^") {
    c.eat();
    return { kind: "anchor", pos: start, end: c.pos, anchor: "start" };
  }
  if (ch === "$") {
    c.eat();
    return { kind: "anchor", pos: start, end: c.pos, anchor: "end" };
  }
  if (ch === ".") {
    c.eat();
    return { kind: "escape", pos: start, end: c.pos, raw: ".", category: "anyChar" };
  }
  if (ch === "\\") return parseEscape(c);
  // Plain literal. We coalesce runs of literal chars in the renderer for
  // readability; here each char is its own node so quantifiers attach to
  // the right unit.
  c.eat();
  return { kind: "literal", pos: start, end: c.pos, text: ch };
}

function parseGroup(c: Cursor): AstNode {
  const start = c.pos;
  c.eat(); // (
  let groupKind:
    | "capture"
    | "noncapture"
    | "named"
    | "lookahead"
    | "negLookahead"
    | "lookbehind"
    | "negLookbehind" = "capture";
  let name: string | undefined;
  let captureIndex: number | undefined;

  if (c.match("?:")) {
    groupKind = "noncapture";
  } else if (c.match("?=")) {
    groupKind = "lookahead";
  } else if (c.match("?!")) {
    groupKind = "negLookahead";
  } else if (c.match("?<=")) {
    groupKind = "lookbehind";
  } else if (c.match("?<!")) {
    groupKind = "negLookbehind";
  } else if (c.match("?<")) {
    groupKind = "named";
    let n = "";
    while (!c.done() && c.peek() !== ">") n += c.eat();
    if (c.peek() !== ">") throw new RegexParseError("unterminated named group", c.pos);
    c.eat(); // >
    name = n;
    c.captureCount += 1;
    captureIndex = c.captureCount;
  } else {
    c.captureCount += 1;
    captureIndex = c.captureCount;
  }

  const child = parseAlternation(c, /* atTopLevel */ false);
  if (c.peek() !== ")") throw new RegexParseError("unterminated group", c.pos);
  c.eat();
  return {
    kind: "group",
    pos: start,
    end: c.pos,
    groupKind,
    name,
    captureIndex,
    child,
  };
}

function parseEscape(c: Cursor): AstNode {
  const start = c.pos;
  c.eat(); // \
  const ch = c.peek();
  if (ch === undefined) throw new RegexParseError("trailing backslash", c.pos);

  // Word/non-word boundaries surface as anchors-ish nodes so explainers can
  // distinguish "match here" from "consume this character".
  if (ch === "b") {
    c.eat();
    return { kind: "escape", pos: start, end: c.pos, raw: "\\b", category: "wordBoundary" };
  }
  if (ch === "B") {
    c.eat();
    return { kind: "escape", pos: start, end: c.pos, raw: "\\B", category: "nonWordBoundary" };
  }
  // Numeric back-references (\1..\99). The runtime treats \0 as null.
  if (ch >= "1" && ch <= "9") {
    let s = "";
    while (!c.done() && c.peek()! >= "0" && c.peek()! <= "9") s += c.eat();
    return {
      kind: "backreference",
      pos: start,
      end: c.pos,
      ref: parseInt(s, 10),
      raw: `\\${s}`,
    };
  }
  if (ch === "k" && c.peek(1) === "<") {
    c.eat(); // k
    c.eat(); // <
    let n = "";
    while (!c.done() && c.peek() !== ">") n += c.eat();
    if (c.peek() !== ">") throw new RegexParseError("unterminated named back-reference", c.pos);
    c.eat();
    return { kind: "backreference", pos: start, end: c.pos, ref: n, raw: `\\k<${n}>` };
  }
  // Common single-char escape categories.
  const map: Record<string, AstNode["kind"] extends "escape" ? never : never> = {} as never; // unused, kept for clarity
  const cat = singleCharCategory(ch);
  if (cat) {
    c.eat();
    return { kind: "escape", pos: start, end: c.pos, raw: `\\${ch}`, category: cat };
  }
  if (ch === "u") {
    c.eat();
    if (c.peek() === "{") {
      c.eat();
      while (!c.done() && c.peek() !== "}") c.eat();
      if (c.peek() === "}") c.eat();
      return { kind: "escape", pos: start, end: c.pos, raw: c.src.slice(start, c.pos), category: "unicodeEscape" };
    }
    // Fixed 4-hex form.
    for (let i = 0; i < 4 && !c.done(); i++) c.eat();
    return { kind: "escape", pos: start, end: c.pos, raw: c.src.slice(start, c.pos), category: "unicodeEscape" };
  }
  if (ch === "x") {
    c.eat();
    for (let i = 0; i < 2 && !c.done(); i++) c.eat();
    return { kind: "escape", pos: start, end: c.pos, raw: c.src.slice(start, c.pos), category: "hexEscape" };
  }
  // Anything else is a literal escaped character (e.g. \. \( \\ \+).
  c.eat();
  return { kind: "escape", pos: start, end: c.pos, raw: `\\${ch}`, category: "literalChar" };
}

function singleCharCategory(ch: string): EscapeCategory | null {
  switch (ch) {
    case "d": return "digit";
    case "D": return "nonDigit";
    case "w": return "word";
    case "W": return "nonWord";
    case "s": return "whitespace";
    case "S": return "nonWhitespace";
    case "t": return "tab";
    case "n": return "newline";
    case "r": return "carriageReturn";
    case "0": return "nullChar";
    default: return null;
  }
}

function parseClass(c: Cursor): AstNode {
  const start = c.pos;
  c.eat(); // [
  let negated = false;
  if (c.peek() === "^") {
    c.eat();
    negated = true;
  }
  const items: ClassItem[] = [];
  while (!c.done() && c.peek() !== "]") {
    const left = readClassChar(c);
    if (c.peek() === "-" && c.peek(1) !== undefined && c.peek(1) !== "]") {
      c.eat();
      const right = readClassChar(c);
      // Class items support escape-on-either-side ranges (e.g. [A-z]) —
      // we project both ends down to their literal char form when known.
      const fromCh = left.kind === "char" ? left.value : approximateClassEscape(left);
      const toCh = right.kind === "char" ? right.value : approximateClassEscape(right);
      items.push({ kind: "range", from: fromCh, to: toCh });
    } else {
      items.push(left);
    }
  }
  if (c.peek() !== "]") throw new RegexParseError("unterminated character class", c.pos);
  c.eat();
  return {
    kind: "class",
    pos: start,
    end: c.pos,
    negated,
    raw: c.src.slice(start, c.pos),
    items,
  };
}

function readClassChar(c: Cursor): ClassItem {
  if (c.peek() === "\\") {
    c.eat();
    const ch = c.eat();
    const cat = singleCharCategory(ch);
    if (cat) return { kind: "escape" as const, raw: `\\${ch}`, category: cat };
    if (ch === "u") {
      // Skip the hex/braced unicode payload; we only need the textual raw form.
      let raw = "\\u";
      if (c.peek() === "{") {
        raw += c.eat();
        while (!c.done() && c.peek() !== "}") raw += c.eat();
        if (c.peek() === "}") raw += c.eat();
      } else {
        for (let i = 0; i < 4 && !c.done(); i++) raw += c.eat();
      }
      return { kind: "escape" as const, raw, category: "unicodeEscape" };
    }
    if (ch === "x") {
      let raw = "\\x";
      for (let i = 0; i < 2 && !c.done(); i++) raw += c.eat();
      return { kind: "escape" as const, raw, category: "hexEscape" };
    }
    return { kind: "char", value: unescapeChar(ch) };
  }
  return { kind: "char", value: c.eat() };
}

function unescapeChar(ch: string): string {
  switch (ch) {
    case "n": return "\n";
    case "r": return "\r";
    case "t": return "\t";
    case "f": return "\f";
    case "v": return "\v";
    case "0": return "\0";
    default: return ch;
  }
}

function approximateClassEscape(item: ClassItem): string {
  // Best-effort projection so a hovered range shows a sensible label even
  // when one endpoint was an escape. Range endpoints come from this helper
  // too, so cover that branch by falling through to the raw form when we
  // have it.
  if (item.kind === "char") return item.value;
  if (item.kind === "escape") return item.raw;
  return `${item.from}-${item.to}`;
}
