<script lang="ts">
  import { onMount } from "svelte";
  import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers } from "@codemirror/view";
  import { EditorState, Transaction } from "@codemirror/state";
  import { json } from "@codemirror/lang-json";
  import { yaml } from "@codemirror/lang-yaml";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { lintGutter } from "@codemirror/lint";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";

  let { value = "", lang = "json", placeholder = "", readonly = false, label = "", onchange = undefined }: {
    value?: string;
    lang?: "json" | "yaml" | "text";
    placeholder?: string;
    readonly?: boolean;
    label?: string;
    onchange?: (value: string) => void;
  } = $props();

  // Fallback chain for aria-label: explicit label > placeholder > generic
  const effectiveLabel = label || placeholder || "Code editor";

  let container = $state<HTMLDivElement>(null!);
  let view: EditorView; // imperative, not reactive

  function getLangExtension() {
    if (lang === "json") return json();
    if (lang === "yaml") return yaml();
    return [];
  }

  function buildExtensions(isLight: boolean) {
    const exts = [
      lineNumbers(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      getLangExtension(),
      lintGutter(),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ "aria-label": effectiveLabel }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onchange) {
          onchange(update.state.doc.toString());
        }
      }),
    ];

    if (placeholder) {
      exts.push(cmPlaceholder(placeholder));
    }

    if (readonly) {
      exts.push(EditorState.readOnly.of(true));
    }

    if (!isLight) {
      exts.push(oneDark);
    } else {
      exts.push(
        EditorView.theme({
          "&": { backgroundColor: "#f8fafc", color: "#0f172a" },
          ".cm-gutters": {
            backgroundColor: "#f1f5f9",
            color: "#94a3b8",
            border: "none",
          },
          ".cm-activeLineGutter": { backgroundColor: "#e2e8f0" },
          ".cm-activeLine": { backgroundColor: "#f1f5f9" },
          ".cm-selectionBackground": { backgroundColor: "#bae6fd !important" },
          "&.cm-focused .cm-cursor": { borderLeftColor: "#0284c7" },
        })
      );
    }

    return exts;
  }

  function isLight() {
    return document.documentElement.classList.contains("light");
  }

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: buildExtensions(isLight()),
      }),
      parent: container,
    });

    // Make the scrollable region keyboard-reachable (WCAG 2.1.1 scrollable-region-focusable).
    // CodeMirror defaults cm-scroller to tabindex=-1; cm-content remains the primary focus
    // target for editing, but tabindex=0 on the scroller lets keyboard users tab into the
    // scrollable area and use arrow keys to scroll long documents.
    view.scrollDOM.setAttribute("tabindex", "0");

    const handleThemeChange = () => {
      const content = view.state.doc.toString();
      view.setState(
        EditorState.create({
          doc: content,
          extensions: buildExtensions(isLight()),
        })
      );
    };
    window.addEventListener("theme-changed", handleThemeChange);

    return () => {
      window.removeEventListener("theme-changed", handleThemeChange);
      view?.destroy();
    };
  });

  // Update editor when value changes externally.
  //
  // `addToHistory.of(false)` excludes this transaction from CodeMirror's undo
  // stack (Nielsen audit code-review 2026-04-30). Without it, the UndoToast
  // restore would push BOTH the Clear (insert "") and the Undo (insert
  // original) into the editor's history. Then Ctrl+Z inside the editor —
  // meant to undo the user's last typed character — would re-clear the
  // editor instead. `addToHistory` is the canonical CodeMirror flag for
  // suppressing history recording on programmatic changes.
  $effect(() => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
        annotations: Transaction.addToHistory.of(false),
      });
    }
  });
</script>

<div bind:this={container} class="h-full w-full overflow-hidden rounded border border-[var(--color-border)]"></div>
