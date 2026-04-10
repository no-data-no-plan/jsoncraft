<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { debounce, stripBom } from "../lib/fileutils";
  import { shouldUseWorker, parseInWorker } from "../lib/worker-api";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  // ── Types ──

  interface GraphNode {
    id: string;
    key: string;
    value: string | null;
    type: "object" | "array" | "string" | "number" | "boolean" | "null";
    x: number;
    y: number;
    width: number;
    height: number;
    children: GraphNode[];
    collapsed: boolean;
  }

  interface Connection {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }

  // ── State ──

  let input = $state("");
  let error = $state("");
  let processing = $state(false);
  let rootNode = $state<GraphNode | null>(null);
  let totalNodes = $state(0);
  let maxDepth = $state(0);

  // Pan & zoom
  let viewX = $state(0);
  let viewY = $state(0);
  let zoom = $state(1);
  let dragging = $state(false);
  let dragStartX = $state(0);
  let dragStartY = $state(0);
  let dragStartViewX = $state(0);
  let dragStartViewY = $state(0);
  let svgContainer = $state<HTMLDivElement>(null!);
  let containerWidth = $state(800);
  let containerHeight = $state(500);

  // ── Constants ──

  const NODE_W = 180;
  const NODE_H = 36;
  const H_GAP = 24;
  const V_GAP = 60;
  const MAX_CHILDREN = 50;
  const MAX_TOTAL_NODES = 500;

  const typeColors: Record<string, string> = {
    object: "var(--color-bg-secondary)",
    array: "rgba(59, 130, 246, 0.15)",
    string: "rgba(34, 197, 94, 0.15)",
    number: "rgba(249, 115, 22, 0.15)",
    boolean: "rgba(168, 85, 247, 0.15)",
    null: "rgba(107, 114, 128, 0.15)",
  };

  const typeValueColors: Record<string, string> = {
    object: "var(--color-text-muted)",
    array: "var(--color-text-muted)",
    string: "#4ade80",
    number: "#fbbf24",
    boolean: "#a78bfa",
    null: "var(--color-text-muted)",
  };

  const typeValueColorsLight: Record<string, string> = {
    object: "var(--color-text-muted)",
    array: "var(--color-text-muted)",
    string: "#16a34a",
    number: "#b45309",
    boolean: "#7c3aed",
    null: "var(--color-text-muted)",
  };

  let isLight = $state(false);

  function detectTheme() {
    if (typeof document !== "undefined") {
      isLight = document.documentElement.classList.contains("light");
    }
  }

  $effect(() => {
    detectTheme();
    const handler = () => detectTheme();
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  });

  function getValueColor(type: string): string {
    return isLight ? (typeValueColorsLight[type] ?? "var(--color-text-muted)") : (typeValueColors[type] ?? "var(--color-text-muted)");
  }

  // ── JSON to Graph ──

  let nodeCount = 0;

  function jsonToGraph(data: unknown, key: string): GraphNode {
    nodeCount++;
    const id = String(nodeCount);

    if (data === null) {
      return { id, key, value: "null", type: "null", x: 0, y: 0, width: NODE_W, height: NODE_H, children: [], collapsed: false };
    }
    if (typeof data === "boolean") {
      return { id, key, value: String(data), type: "boolean", x: 0, y: 0, width: NODE_W, height: NODE_H, children: [], collapsed: false };
    }
    if (typeof data === "number") {
      return { id, key, value: String(data), type: "number", x: 0, y: 0, width: NODE_W, height: NODE_H, children: [], collapsed: false };
    }
    if (typeof data === "string") {
      const display = data.length > 20 ? data.slice(0, 20) + "..." : data;
      return { id, key, value: `"${display}"`, type: "string", x: 0, y: 0, width: NODE_W, height: NODE_H, children: [], collapsed: false };
    }
    if (Array.isArray(data)) {
      const limited = data.slice(0, MAX_CHILDREN);
      const children: GraphNode[] = [];
      for (let i = 0; i < limited.length && nodeCount < MAX_TOTAL_NODES; i++) {
        children.push(jsonToGraph(limited[i], `[${i}]`));
      }
      return { id, key, value: null, type: "array", x: 0, y: 0, width: NODE_W, height: NODE_H, children, collapsed: false };
    }
    if (typeof data === "object") {
      const entries = Object.entries(data).slice(0, MAX_CHILDREN);
      const children: GraphNode[] = [];
      for (const [k, v] of entries) {
        if (nodeCount >= MAX_TOTAL_NODES) break;
        children.push(jsonToGraph(v, k));
      }
      return { id, key, value: null, type: "object", x: 0, y: 0, width: NODE_W, height: NODE_H, children, collapsed: false };
    }
    return { id, key, value: String(data), type: "null", x: 0, y: 0, width: NODE_W, height: NODE_H, children: [], collapsed: false };
  }

  // ── Layout ──

  function layoutTree(node: GraphNode, x: number, y: number, depth: number): { width: number; height: number } {
    node.x = x;
    node.y = y;
    node.width = NODE_W;
    node.height = NODE_H;

    if (node.children.length === 0 || node.collapsed) {
      return { width: NODE_W, height: NODE_H };
    }

    let childX = x;
    let maxChildHeight = 0;

    for (const child of node.children) {
      const size = layoutTree(child, childX, y + NODE_H + V_GAP, depth + 1);
      childX += size.width + H_GAP;
      maxChildHeight = Math.max(maxChildHeight, size.height);
    }

    const totalChildWidth = childX - H_GAP - x;
    node.x = x + totalChildWidth / 2 - NODE_W / 2;

    return { width: Math.max(NODE_W, totalChildWidth), height: NODE_H + V_GAP + maxChildHeight };
  }

  // ── Flatten for rendering ──

  function flattenNodes(node: GraphNode): GraphNode[] {
    const result: GraphNode[] = [node];
    if (!node.collapsed) {
      for (const child of node.children) {
        result.push(...flattenNodes(child));
      }
    }
    return result;
  }

  function collectConnections(node: GraphNode): Connection[] {
    const result: Connection[] = [];
    if (!node.collapsed) {
      for (const child of node.children) {
        result.push({
          fromX: node.x + NODE_W / 2,
          fromY: node.y + NODE_H,
          toX: child.x + NODE_W / 2,
          toY: child.y,
        });
        result.push(...collectConnections(child));
      }
    }
    return result;
  }

  function countDepth(node: GraphNode, depth: number): number {
    if (node.children.length === 0 || node.collapsed) return depth;
    let max = depth;
    for (const child of node.children) {
      max = Math.max(max, countDepth(child, depth + 1));
    }
    return max;
  }

  // ── Derived rendering data ──

  let flatNodes = $derived(rootNode ? flattenNodes(rootNode) : []);
  let connections = $derived(rootNode ? collectConnections(rootNode) : []);

  // Compute SVG bounds
  let svgBounds = $derived.by(() => {
    if (flatNodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 500 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of flatNodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    }
    return { minX: minX - 40, minY: minY - 40, maxX: maxX + 40, maxY: maxY + 40 };
  });

  let viewBox = $derived(
    `${viewX} ${viewY} ${containerWidth / zoom} ${containerHeight / zoom}`
  );

  // ── Process input ──

  function rebuildLayout() {
    if (rootNode) {
      layoutTree(rootNode, 0, 0, 0);
      maxDepth = countDepth(rootNode, 0);
      // Trigger reactivity by reassigning
      rootNode = rootNode;
    }
  }

  async function processInput(value: string) {
    if (!value.trim()) {
      rootNode = null;
      error = "";
      totalNodes = 0;
      maxDepth = 0;
      return;
    }

    let parsed: unknown;
    if (shouldUseWorker(value)) {
      processing = true;
      try {
        const result = await parseInWorker(value);
        parsed = JSON.parse(result.output);
        error = "";
      } catch (e: any) {
        error = e.message;
        rootNode = null;
        processing = false;
        return;
      } finally {
        processing = false;
      }
    } else {
      try {
        parsed = JSON.parse(stripBom(value));
        error = "";
      } catch (e: any) {
        error = e.message;
        rootNode = null;
        return;
      }
    }

    nodeCount = 0;
    rootNode = jsonToGraph(parsed, "root");
    totalNodes = nodeCount;
    layoutTree(rootNode, 0, 0, 0);
    maxDepth = countDepth(rootNode, 0);

    // Reset view to fit content
    resetView();
  }

  function resetView() {
    viewX = svgBounds.minX;
    viewY = svgBounds.minY;
    const contentW = svgBounds.maxX - svgBounds.minX;
    const contentH = svgBounds.maxY - svgBounds.minY;
    if (contentW > 0 && contentH > 0 && containerWidth > 0 && containerHeight > 0) {
      zoom = Math.min(containerWidth / contentW, containerHeight / contentH, 1.5);
      zoom = Math.max(zoom, 0.1);
    } else {
      zoom = 1;
    }
  }

  const debouncedProcess = debounce((v: string) => processInput(v), 300);

  function handleInput(value: string) {
    input = value;
    debouncedProcess(value);
  }

  function loadSample() {
    const sample = JSON.stringify(
      {
        users: [
          { id: 1, name: "Alice", roles: ["admin", "user"], active: true },
          { id: 2, name: "Bob", roles: ["user"], active: false },
        ],
        metadata: { total: 2, page: 1, generated: null },
        config: { theme: "dark", locale: "en-US", features: { beta: true, v2: false } },
      },
      null,
      2
    );
    handleInput(sample);
    input = sample;
  }

  // ── Collapse/Expand ──

  function toggleCollapse(nodeId: string) {
    if (!rootNode) return;
    function walk(node: GraphNode): boolean {
      if (node.id === nodeId) {
        node.collapsed = !node.collapsed;
        return true;
      }
      for (const child of node.children) {
        if (walk(child)) return true;
      }
      return false;
    }
    walk(rootNode);
    rebuildLayout();
    // Force update derived values
    rootNode = rootNode;
  }

  function setAllCollapsed(node: GraphNode, collapsed: boolean) {
    if (node.children.length > 0) {
      node.collapsed = collapsed;
      for (const child of node.children) {
        setAllCollapsed(child, collapsed);
      }
    }
  }

  function expandAll() {
    if (!rootNode) return;
    setAllCollapsed(rootNode, false);
    rebuildLayout();
    rootNode = rootNode;
    // After expanding, fit to view
    setTimeout(() => resetView(), 0);
  }

  function collapseAll() {
    if (!rootNode) return;
    setAllCollapsed(rootNode, true);
    rebuildLayout();
    rootNode = rootNode;
    setTimeout(() => resetView(), 0);
  }

  // ── Pan & Zoom handlers ──

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * factor, 0.05), 5);

    // Zoom toward cursor position
    const rect = svgContainer.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const svgX = viewX + mx / zoom;
    const svgY = viewY + my / zoom;

    zoom = newZoom;
    viewX = svgX - mx / newZoom;
    viewY = svgY - my / newZoom;
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartViewX = viewX;
    dragStartViewY = viewY;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    viewX = dragStartViewX - dx / zoom;
    viewY = dragStartViewY - dy / zoom;
  }

  function handleMouseUp() {
    dragging = false;
  }

  // Touch support
  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      dragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      dragStartViewX = viewX;
      dragStartViewY = viewY;
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    viewX = dragStartViewX - dx / zoom;
    viewY = dragStartViewY - dy / zoom;
  }

  function handleTouchEnd() {
    dragging = false;
  }

  // Observe container size
  $effect(() => {
    if (!svgContainer) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width || 800;
        containerHeight = entry.contentRect.height || 500;
      }
    });
    obs.observe(svgContainer);
    return () => obs.disconnect();
  });

  // Label helper: truncate key for display
  function displayKey(key: string): string {
    return key.length > 16 ? key.slice(0, 14) + ".." : key;
  }

  function displayLabel(node: GraphNode): string {
    const k = displayKey(node.key);
    if (node.value !== null) {
      const maxValueLen = 14;
      const v = node.value.length > maxValueLen ? node.value.slice(0, maxValueLen) + ".." : node.value;
      return `${k}: ${v}`;
    }
    if (node.type === "array") return `${k} [${node.children.length}]`;
    if (node.type === "object") return `${k} {${node.children.length}}`;
    return k;
  }

  // Truncated children notice
  function truncatedNotice(node: GraphNode): string | null {
    if (node.collapsed && node.children.length > 0) {
      return `+${node.children.length}`;
    }
    return null;
  }
</script>

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div
    class="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap"
  >
    <button
      onclick={expandAll}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      {tt("graph", lang, "expandAll")}
    </button>
    <button
      onclick={collapseAll}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {tt("graph", lang, "collapseAll")}
    </button>
    <button
      onclick={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>
    <button
      onclick={() => resetView()}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {tt("graph", lang, "fitView")}
    </button>

    <div class="ml-auto flex items-center gap-3 text-xs text-[var(--color-text-muted)]" aria-live="polite">
      {#if processing}
        <span class="text-[var(--color-accent)] animate-pulse">{t(lang, "parsing")}</span>
      {:else if error}
        <span class="text-[var(--color-error)]">{error}</span>
      {:else if rootNode}
        <span>{tt("graph", lang, "nodes")}: {totalNodes}</span>
        <span>{tt("graph", lang, "depth")}: {maxDepth}</span>
        <span class="hidden sm:inline">{tt("graph", lang, "zoomLevel")}: {Math.round(zoom * 100)}%</span>
      {/if}
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Left: JSON input -->
    <div class="flex-1 flex flex-col min-h-0 p-2" style="max-width: 50%; min-width: 200px;">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{t(lang, "input")}</div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang="json"
          placeholder={tt("graph", lang, "inputPlaceholder")}
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <!-- Right: SVG graph -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{tt("graph", lang, "graph")}</div>
      <div
        bind:this={svgContainer}
        class="flex-1 min-h-0 overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)]"
        style="min-height: 400px; cursor: {dragging ? 'grabbing' : 'grab'};"
        role="img"
        aria-label={tt("graph", lang, "graphAria")}
        onwheel={handleWheel}
        onmousedown={handleMouseDown}
        onmousemove={handleMouseMove}
        onmouseup={handleMouseUp}
        onmouseleave={handleMouseUp}
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
      >
        {#if rootNode}
          <svg
            viewBox={viewBox}
            class="w-full h-full"
            style="display: block;"
          >
            <!-- Connection lines -->
            {#each connections as conn}
              {@const midY = (conn.fromY + conn.toY) / 2}
              <path
                d="M{conn.fromX},{conn.fromY} C{conn.fromX},{midY} {conn.toX},{midY} {conn.toX},{conn.toY}"
                fill="none"
                stroke="var(--color-border)"
                stroke-width="1.5"
                opacity="0.6"
              />
            {/each}

            <!-- Nodes -->
            {#each flatNodes as node (node.id)}
              <g transform="translate({node.x}, {node.y})">
                <!-- Node background -->
                <rect
                  width={node.width}
                  height={node.height}
                  rx="6"
                  fill={typeColors[node.type]}
                  stroke="var(--color-border)"
                  stroke-width="1"
                />

                <!-- Node label -->
                <text
                  x="10"
                  y="23"
                  font-size="11"
                  font-family="var(--font-mono, monospace)"
                  fill="var(--color-text-primary)"
                  style="pointer-events: none;"
                >
                  {#if node.value !== null}
                    <tspan font-weight="600">{displayKey(node.key)}</tspan><tspan fill={getValueColor(node.type)}>: {node.value.length > 14 ? node.value.slice(0, 14) + ".." : node.value}</tspan>
                  {:else if node.type === "array"}
                    <tspan font-weight="600">{displayKey(node.key)}</tspan><tspan fill="var(--color-text-muted)"> [{node.children.length}]</tspan>
                  {:else if node.type === "object"}
                    <tspan font-weight="600">{displayKey(node.key)}</tspan><tspan fill="var(--color-text-muted)"> {"{"}{node.children.length}{"}"}</tspan>
                  {:else}
                    <tspan font-weight="600">{displayKey(node.key)}</tspan>
                  {/if}
                </text>

                <!-- Type badge -->
                <rect
                  x={node.width - 30}
                  y="6"
                  width="24"
                  height="14"
                  rx="3"
                  fill="var(--color-bg-tertiary)"
                  opacity="0.8"
                />
                <text
                  x={node.width - 18}
                  y="16"
                  font-size="7"
                  text-anchor="middle"
                  fill="var(--color-text-muted)"
                  style="pointer-events: none; text-transform: uppercase;"
                >
                  {node.type === "object" ? "OBJ" : node.type === "array" ? "ARR" : node.type === "string" ? "STR" : node.type === "number" ? "NUM" : node.type === "boolean" ? "BOOL" : "NULL"}
                </text>

                <!-- Collapse/expand button -->
                {#if node.children.length > 0}
                  <g
                    transform="translate({node.width / 2}, {node.height})"
                    onclick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
                    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleCollapse(node.id); } }}
                    role="button"
                    tabindex="0"
                    aria-label={node.collapsed ? (lang === 'es' ? 'Expandir nodo' : 'Expand node') : (lang === 'es' ? 'Contraer nodo' : 'Collapse node')}
                    style="cursor: pointer;"
                  >
                    <circle
                      cx="0"
                      cy="10"
                      r="10"
                      fill="var(--color-bg-tertiary)"
                      stroke="var(--color-border)"
                      stroke-width="1"
                    />
                    <text
                      x="0"
                      y="14"
                      text-anchor="middle"
                      font-size="12"
                      font-weight="bold"
                      fill="var(--color-text-secondary)"
                      style="pointer-events: none;"
                    >
                      {node.collapsed ? "+" : "\u2212"}
                    </text>
                  </g>
                {/if}
              </g>
            {/each}
          </svg>
        {:else if !error}
          <div class="flex items-center justify-center h-full text-sm text-[var(--color-text-muted)] p-4">
            {tt("graph", lang, "pasteHint")}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
