import type { Lang } from "./index";

const common = {
  en: {
    // Header
    headerBadge: "Your data never leaves your browser",
    // Footer
    footerTagline: "JSONCraft \u2014 Free, fast, private JSON tools",
    footerCoffee: "Buy me a coffee",
    feedbackPlaceholder: "Bug, idea, or feedback...",
    feedbackSend: "Send",
    // Sidebar
    sidebarPrivacy: "100% client-side. No data sent to any server.",
    // Buttons (shared)
    copy: "Copy",
    copied: "Copied!",
    clear: "Clear",
    sample: "Sample",
    upload: "Upload",
    download: "Download",
    swap: "\u21c4 Swap",
    format: "Format",
    minify: "Minify",
    convert: "Convert",
    compare: "Compare",
    evaluate: "Evaluate",
    generate: "Generate",
    encode: "Encode",
    decode: "Decode",
    // Labels
    input: "Input",
    output: "Output",
    result: "Result",
    indent: "Indent:",
    // Status
    validJson: "Valid JSON",
    processing: "Processing...",
    comparing: "Comparing...",
    parsing: "Parsing...",
    evaluating: "Evaluating...",
    computing: "Computing...",
    processingLarge: "Processing large file...",
    // SeoContent
    related: "Related:",
    // SeoBlock
    aboutThisTool: "About this tool",
    seoBlockPrivacy: "100% client-side. Your data never leaves your browser. No tracking, no cookies.",
    // Theme / Menu
    toggleTheme: "Toggle theme",
    toggleMenu: "Toggle menu",
    // Language toggle
    langToggleLabel: "ES",
    langToggleTitle: "Cambiar a espa\u00f1ol",
    // Group labels
    groupCore: "Core",
    groupConverters: "Converters",
    groupDevTools: "Dev Tools",
  },
  es: {
    headerBadge: "Tus datos nunca salen de tu navegador",
    footerTagline: "JSONCraft \u2014 Herramientas JSON gratuitas, r\u00e1pidas y privadas",
    footerCoffee: "Buy me a coffee",
    feedbackPlaceholder: "Error, idea o sugerencia...",
    feedbackSend: "Enviar",
    sidebarPrivacy: "100% en tu navegador. No se env\u00edan datos a ning\u00fan servidor.",
    copy: "Copiar",
    copied: "\u00a1Copiado!",
    clear: "Limpiar",
    sample: "Ejemplo",
    upload: "Subir",
    download: "Descargar",
    swap: "\u21c4 Intercambiar",
    format: "Formatear",
    minify: "Minificar",
    convert: "Convertir",
    compare: "Comparar",
    evaluate: "Evaluar",
    generate: "Generar",
    encode: "Codificar",
    decode: "Decodificar",
    input: "Entrada",
    output: "Salida",
    result: "Resultado",
    indent: "Sangr\u00eda:",
    validJson: "JSON v\u00e1lido",
    processing: "Procesando...",
    comparing: "Comparando...",
    parsing: "Analizando...",
    evaluating: "Evaluando...",
    computing: "Calculando...",
    processingLarge: "Procesando archivo grande...",
    related: "Relacionados:",
    aboutThisTool: "Sobre esta herramienta",
    seoBlockPrivacy: "100% en tu navegador. Tus datos nunca salen de tu navegador. Sin rastreo, sin cookies.",
    toggleTheme: "Cambiar tema",
    toggleMenu: "Alternar men\u00fa",
    langToggleLabel: "EN",
    langToggleTitle: "Switch to English",
    groupCore: "Principal",
    groupConverters: "Conversores",
    groupDevTools: "Herramientas Dev",
  },
} as const;

export type CommonKey = keyof typeof common.en;

export function t(lang: Lang, key: CommonKey): string {
  return common[lang][key];
}

const groupMap: Record<string, { en: string; es: string }> = {
  Core: { en: "Core", es: "Principal" },
  Converters: { en: "Converters", es: "Conversores" },
  "Dev Tools": { en: "Dev Tools", es: "Herramientas Dev" },
};

export function translateGroup(label: string, lang: Lang): string {
  return groupMap[label]?.[lang] ?? label;
}
