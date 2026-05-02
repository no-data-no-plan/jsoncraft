<script lang="ts">
  import type { AstNode, ParseOutcome } from "../lib/regex-parse";
  import { explainNode, type ExplainLang } from "../lib/regex-explain";

  interface Props {
    /** The parser outcome — the visualizer renders an inline error if not ok. */
    outcome: ParseOutcome;
    lang?: ExplainLang;
    /** Reports which slice of the pattern the user is hovering over. The
     *  parent renders the highlight in the pattern preview (CW-JC-10
     *  hover→highlight, 2026-05-02). */
    onHover?: (range: { pos: number; end: number } | null) => void;
  }
  let { outcome, lang = "en", onHover }: Props = $props();

  // Each AST node category gets a distinct accent so the user can scan the
  // whole pattern at a glance. The accents reuse JC's design tokens so the
  // visualizer fits the rest of the app's palette.
  function nodeAccent(kind: AstNode["kind"]): string {
    switch (kind) {
      case "literal": return "var(--color-text-secondary)";
      case "sequence": return "var(--color-text-muted)";
      case "alternation": return "var(--color-warning)";
      case "group": return "var(--color-accent)";
      case "quantified": return "var(--color-warning)";
      case "anchor": return "var(--color-success)";
      case "escape": return "var(--color-success)";
      case "class": return "var(--color-accent-fg)";
      case "backreference": return "var(--color-error)";
    }
  }
</script>

{#snippet nodeView(node: AstNode)}
  {@const accent = nodeAccent(node.kind)}
  <div
    class="rounded border bg-[var(--color-bg-tertiary)] text-sm cursor-help"
    style="border-color: {accent}66;"
    role="presentation"
    onmouseenter={() => onHover?.({ pos: node.pos, end: node.end })}
    onmouseleave={() => onHover?.(null)}
    onfocusin={() => onHover?.({ pos: node.pos, end: node.end })}
    onfocusout={() => onHover?.(null)}
  >
    <!--
      The kind label and branch index used to take their text colour from
      `accent`, but several accent tokens (capture-group #0369a1 on slate-700
      dark; alternation #d97706 on slate-200 light) failed WCAG 1.4.3 AA on
      the bg-tertiary background — measured 1.75:1 and 2.58:1 in the
      2026-05-01 manual audit. The colour signal stays on the decorative
      border + accent-coloured background pip; text uses the theme-aware
      secondary token which clears AA in both modes.
    -->
    <div class="flex items-center gap-2 px-2 py-1 border-b" style="border-color: {accent}33;">
      <span aria-hidden="true" class="inline-block w-1.5 h-1.5 rounded-full" style="background-color: {accent};"></span>
      <span class="text-[10px] uppercase tracking-wider font-mono text-[var(--color-text-secondary)]">{node.kind}</span>
      <span class="text-xs text-[var(--color-text-secondary)]">{explainNode(node, lang)}</span>
    </div>

    {#if node.kind === "sequence"}
      <div class="p-2 flex flex-wrap gap-2">
        {#each node.children as child}
          {@render nodeView(child)}
        {/each}
      </div>
    {:else if node.kind === "alternation"}
      <div class="p-2 flex flex-col gap-2">
        {#each node.branches as branch, i}
          <div class="flex items-start gap-2">
            <span class="text-[10px] font-mono pt-1 text-[var(--color-text-secondary)]">{i + 1}</span>
            <div class="flex-1">{@render nodeView(branch)}</div>
          </div>
        {/each}
      </div>
    {:else if node.kind === "group"}
      <div class="p-2">{@render nodeView(node.child)}</div>
    {:else if node.kind === "quantified"}
      <div class="p-2">{@render nodeView(node.child)}</div>
    {:else if node.kind === "class"}
      <!-- Class items are rendered inline in the explainer line above; no children to draw here. -->
    {:else}
      <!-- Leaf nodes (literal, anchor, escape, backreference) — no body. -->
    {/if}
  </div>
{/snippet}

<div class="px-3 py-3 overflow-auto h-full">
  {#if !outcome.ok}
    <div class="rounded bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 px-3 py-2 text-sm text-[var(--color-error)]">
      {outcome.error}
    </div>
  {:else if !outcome.pattern}
    <div class="text-sm text-[var(--color-text-muted)]">
      {lang === "es" ? "Escribe un patrón para ver su estructura." : "Type a pattern to see its structure."}
    </div>
  {:else}
    {@render nodeView(outcome.ast)}
  {/if}
</div>
