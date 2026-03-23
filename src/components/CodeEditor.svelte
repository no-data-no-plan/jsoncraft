<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers } from "@codemirror/view";
  import { EditorState } from "@codemirror/state";
  import { json } from "@codemirror/lang-json";
  import { yaml } from "@codemirror/lang-yaml";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { lintGutter } from "@codemirror/lint";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";

  export let value: string = "";
  export let lang: "json" | "yaml" | "text" = "json";
  export let placeholder: string = "";
  export let readonly: boolean = false;
  export let onchange: ((value: string) => void) | undefined = undefined;

  let container: HTMLDivElement;
  let view: EditorView;

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
    return document.body.classList.contains("light");
  }

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: buildExtensions(isLight()),
      }),
      parent: container,
    });

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
    };
  });

  onDestroy(() => {
    view?.destroy();
  });

  // Update editor when value changes externally
  $: if (view && value !== view.state.doc.toString()) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    });
  }
</script>

<div bind:this={container} class="h-full w-full overflow-hidden rounded border border-[var(--color-border)]"></div>
