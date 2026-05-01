/**
 * Human-readable descriptions for AST nodes produced by `regex-parse.ts`.
 * Used by the visualizer to label each block; also useful as standalone
 * tooltips in the future. Strings live here (not in i18n/) because they
 * compose with values from the AST (counts, names, ranges) rather than
 * being plain template strings.
 */

import type { AstNode, ClassItem, EscapeCategory } from "./regex-parse";

export type ExplainLang = "en" | "es";

export function explainNode(node: AstNode, lang: ExplainLang = "en"): string {
  const w = words[lang];
  switch (node.kind) {
    case "literal":
      return `${w.literal} "${escapeForLabel(node.text)}"`;
    case "sequence":
      return `${w.sequence} (${node.children.length} ${node.children.length === 1 ? w.itemSingular : w.itemPlural})`;
    case "alternation":
      return `${w.alternation} (${node.branches.length} ${w.branchPlural})`;
    case "group":
      return groupLabel(node.groupKind, node.captureIndex, node.name, w);
    case "quantified":
      return quantifierLabel(node.min, node.max, node.greedy, w);
    case "anchor":
      return node.anchor === "start" ? w.anchorStart : w.anchorEnd;
    case "escape":
      return escapeLabel(node.category, w);
    case "class":
      return classLabel(node, w);
    case "backreference":
      return typeof node.ref === "number"
        ? `${w.backreferenceNumber} ${node.ref}`
        : `${w.backreferenceNamed} "${node.ref}"`;
  }
}

interface Words {
  literal: string;
  sequence: string;
  itemSingular: string;
  itemPlural: string;
  alternation: string;
  branchPlural: string;
  capturingGroup: string;
  nonCapturingGroup: string;
  namedGroup: string;
  lookahead: string;
  negativeLookahead: string;
  lookbehind: string;
  negativeLookbehind: string;
  exactly: string;
  atLeast: string;
  between: string;
  zeroOrMore: string;
  oneOrMore: string;
  optional: string;
  greedy: string;
  lazy: string;
  anchorStart: string;
  anchorEnd: string;
  digit: string;
  nonDigit: string;
  word: string;
  nonWord: string;
  whitespace: string;
  nonWhitespace: string;
  wordBoundary: string;
  nonWordBoundary: string;
  tab: string;
  newline: string;
  carriageReturn: string;
  nullChar: string;
  anyChar: string;
  literalCharGeneric: string;
  unicodeEscape: string;
  hexEscape: string;
  classAny: string;
  classNone: string;
  range: string;
  backreferenceNumber: string;
  backreferenceNamed: string;
  groupNo: string;
  named: string;
}

const words: Record<ExplainLang, Words> = {
  en: {
    literal: "Literal",
    sequence: "Sequence",
    itemSingular: "item",
    itemPlural: "items",
    alternation: "Alternation",
    branchPlural: "branches",
    capturingGroup: "Capturing group",
    nonCapturingGroup: "Non-capturing group",
    namedGroup: "Named group",
    lookahead: "Positive lookahead",
    negativeLookahead: "Negative lookahead",
    lookbehind: "Positive lookbehind",
    negativeLookbehind: "Negative lookbehind",
    exactly: "exactly",
    atLeast: "at least",
    between: "between",
    zeroOrMore: "zero or more times",
    oneOrMore: "one or more times",
    optional: "optional (zero or one)",
    greedy: "greedy",
    lazy: "lazy",
    anchorStart: "Start of input (^)",
    anchorEnd: "End of input ($)",
    digit: "Any digit (0–9)",
    nonDigit: "Any non-digit",
    word: "Any word character (A–Z, a–z, 0–9, _)",
    nonWord: "Any non-word character",
    whitespace: "Any whitespace",
    nonWhitespace: "Any non-whitespace",
    wordBoundary: "Word boundary",
    nonWordBoundary: "Not a word boundary",
    tab: "Tab character",
    newline: "Newline character",
    carriageReturn: "Carriage return",
    nullChar: "Null character",
    anyChar: "Any character (except newline by default)",
    literalCharGeneric: "Escaped literal character",
    unicodeEscape: "Unicode escape",
    hexEscape: "Hex escape",
    classAny: "Any one of",
    classNone: "Any character except",
    range: "to",
    backreferenceNumber: "Back-reference to group",
    backreferenceNamed: "Back-reference to named group",
    groupNo: "#",
    named: "named",
  },
  es: {
    literal: "Literal",
    sequence: "Secuencia",
    itemSingular: "elemento",
    itemPlural: "elementos",
    alternation: "Alternativa",
    branchPlural: "ramas",
    capturingGroup: "Grupo de captura",
    nonCapturingGroup: "Grupo sin captura",
    namedGroup: "Grupo nombrado",
    lookahead: "Lookahead positivo",
    negativeLookahead: "Lookahead negativo",
    lookbehind: "Lookbehind positivo",
    negativeLookbehind: "Lookbehind negativo",
    exactly: "exactamente",
    atLeast: "al menos",
    between: "entre",
    zeroOrMore: "cero o más veces",
    oneOrMore: "una o más veces",
    optional: "opcional (cero o uno)",
    greedy: "voraz",
    lazy: "perezoso",
    anchorStart: "Inicio de la entrada (^)",
    anchorEnd: "Fin de la entrada ($)",
    digit: "Cualquier dígito (0–9)",
    nonDigit: "Cualquier no-dígito",
    word: "Cualquier carácter de palabra (A–Z, a–z, 0–9, _)",
    nonWord: "Cualquier carácter no-palabra",
    whitespace: "Cualquier espacio en blanco",
    nonWhitespace: "Cualquier no-espacio",
    wordBoundary: "Límite de palabra",
    nonWordBoundary: "No es límite de palabra",
    tab: "Tabulador",
    newline: "Salto de línea",
    carriageReturn: "Retorno de carro",
    nullChar: "Carácter nulo",
    anyChar: "Cualquier carácter (excepto saltos de línea por defecto)",
    literalCharGeneric: "Carácter literal escapado",
    unicodeEscape: "Escape Unicode",
    hexEscape: "Escape hex",
    classAny: "Cualquiera de",
    classNone: "Cualquier carácter excepto",
    range: "a",
    backreferenceNumber: "Referencia atrás al grupo",
    backreferenceNamed: "Referencia atrás al grupo nombrado",
    groupNo: "n.º",
    named: "nombrado",
  },
};

function escapeForLabel(s: string): string {
  return s.replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r");
}

function groupLabel(
  kind: Extract<AstNode, { kind: "group" }>["groupKind"],
  index: number | undefined,
  name: string | undefined,
  w: Words,
): string {
  switch (kind) {
    case "capture":
      return `${w.capturingGroup} ${w.groupNo}${index ?? "?"}`;
    case "noncapture":
      return w.nonCapturingGroup;
    case "named":
      return `${w.namedGroup} "${name ?? ""}" (${w.groupNo}${index ?? "?"})`;
    case "lookahead":
      return w.lookahead;
    case "negLookahead":
      return w.negativeLookahead;
    case "lookbehind":
      return w.lookbehind;
    case "negLookbehind":
      return w.negativeLookbehind;
  }
}

function quantifierLabel(min: number, max: number, greedy: boolean, w: Words): string {
  const mode = greedy ? w.greedy : w.lazy;
  if (min === 0 && max === Infinity) return `${w.zeroOrMore} (${mode})`;
  if (min === 1 && max === Infinity) return `${w.oneOrMore} (${mode})`;
  if (min === 0 && max === 1) return `${w.optional} (${mode})`;
  if (min === max) return `${w.exactly} ${min} (${mode})`;
  if (max === Infinity) return `${w.atLeast} ${min} (${mode})`;
  return `${w.between} ${min}–${max} (${mode})`;
}

function escapeLabel(cat: EscapeCategory, w: Words): string {
  switch (cat) {
    case "digit": return w.digit;
    case "nonDigit": return w.nonDigit;
    case "word": return w.word;
    case "nonWord": return w.nonWord;
    case "whitespace": return w.whitespace;
    case "nonWhitespace": return w.nonWhitespace;
    case "wordBoundary": return w.wordBoundary;
    case "nonWordBoundary": return w.nonWordBoundary;
    case "tab": return w.tab;
    case "newline": return w.newline;
    case "carriageReturn": return w.carriageReturn;
    case "nullChar": return w.nullChar;
    case "anyChar": return w.anyChar;
    case "literalChar": return w.literalCharGeneric;
    case "unicodeEscape": return w.unicodeEscape;
    case "hexEscape": return w.hexEscape;
  }
}

function classLabel(node: Extract<AstNode, { kind: "class" }>, w: Words): string {
  const head = node.negated ? w.classNone : w.classAny;
  const parts = node.items.map((i) => classItemLabel(i, w));
  return `${head}: ${parts.join(", ")}`;
}

function classItemLabel(item: ClassItem, w: Words): string {
  if (item.kind === "char") return `"${escapeForLabel(item.value)}"`;
  if (item.kind === "range") return `"${item.from}" ${w.range} "${item.to}"`;
  return escapeLabel(item.category, w);
}
