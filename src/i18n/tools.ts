import type { Lang } from "./index";

const toolNames: Record<string, { en: string; es: string }> = {
  formatter: { en: "JSON Formatter", es: "Formateador JSON" },
  diff: { en: "JSON Diff", es: "Diff JSON" },
  viewer: { en: "JSON Tree Viewer", es: "Visor de \u00c1rbol JSON" },
  graph: { en: "JSON Graph Visualizer", es: "Visualizador de Grafo JSON" },
  jsonpath: { en: "JSONPath Tester", es: "Tester JSONPath" },
  "yaml-to-json": { en: "YAML to JSON", es: "YAML a JSON" },
  "json-to-yaml": { en: "JSON to YAML", es: "JSON a YAML" },
  "json-to-csv": { en: "JSON to CSV", es: "JSON a CSV" },
  "csv-to-json": { en: "CSV to JSON", es: "CSV a JSON" },
  "json-to-toml": { en: "JSON to TOML", es: "JSON a TOML" },
  "toml-to-json": { en: "TOML to JSON", es: "TOML a JSON" },
  regex: { en: "Regex Tester", es: "Tester de Regex" },
  base64: { en: "Base64 Encode/Decode", es: "Codificar/Decodificar Base64" },
  "url-encode": { en: "URL Encoder/Decoder", es: "Codificador/Decodificador URL" },
  hash: { en: "Hash Generator", es: "Generador de Hash" },
  uuid: { en: "UUID Generator", es: "Generador de UUID" },
  timestamp: { en: "Timestamp Converter", es: "Conversor de Timestamp" },
  cron: { en: "Cron Expression Builder", es: "Constructor de Cron" },
  "json-to-typescript": { en: "JSON to TypeScript", es: "JSON a TypeScript" },
  "xml-formatter": { en: "XML Formatter", es: "Formateador XML" },
  "json-to-html-table": { en: "JSON to HTML Table", es: "JSON a Tabla HTML" },
  "yaml-validator": { en: "YAML Validator", es: "Validador YAML" },
  "json-schema-validator": { en: "JSON Schema Validator", es: "Validador de JSON Schema" },
};

export function getToolName(id: string, lang: Lang): string {
  return toolNames[id]?.[lang] ?? toolNames[id]?.en ?? id;
}

// Short card descriptions for the landing grid. Kept under ~60 chars
// so the 3-col desktop layout doesn't wrap awkwardly. The longer SEO
// descriptions live in src/lib/tools.ts (for tool-page meta) and in
// src/i18n/pages.ts (for tool-page SEO blocks).
const toolCardDescriptions: Record<string, { en: string; es: string }> = {
  formatter: { en: "Validate, beautify or minify JSON in real time", es: "Valida, embellece o minifica JSON en tiempo real" },
  diff: { en: "Compare two JSON documents side by side", es: "Compara dos documentos JSON lado a lado" },
  viewer: { en: "Explore JSON as a collapsible tree", es: "Explora JSON como \u00e1rbol colapsable" },
  graph: { en: "Visualize JSON as an interactive graph", es: "Visualiza JSON como grafo interactivo" },
  jsonpath: { en: "Test JSONPath expressions with live evaluation", es: "Prueba expresiones JSONPath con evaluaci\u00f3n en vivo" },
  "yaml-to-json": { en: "Convert YAML files to JSON instantly", es: "Convierte YAML a JSON al instante" },
  "json-to-yaml": { en: "Convert JSON to clean readable YAML", es: "Convierte JSON a YAML limpio y legible" },
  "json-to-csv": { en: "Convert JSON arrays to spreadsheet CSV", es: "Convierte arrays JSON a CSV de hoja de c\u00e1lculo" },
  "csv-to-json": { en: "Convert CSV data to structured JSON", es: "Convierte datos CSV a JSON estructurado" },
  "json-to-toml": { en: "Convert JSON to TOML configuration", es: "Convierte JSON a configuraci\u00f3n TOML" },
  "toml-to-json": { en: "Convert TOML config files to JSON", es: "Convierte ficheros TOML a JSON" },
  regex: { en: "Test regex with live matches and groups", es: "Prueba regex con matches y grupos en vivo" },
  base64: { en: "Encode text to Base64 or decode back", es: "Codifica texto a Base64 o decod\u00edficalo" },
  "url-encode": { en: "Percent-encode or decode URLs safely", es: "Codifica o decodifica URLs con porcentaje" },
  hash: { en: "Generate MD5, SHA-1, SHA-256, SHA-512", es: "Genera MD5, SHA-1, SHA-256 y SHA-512" },
  uuid: { en: "Generate random UUID v4 strings in bulk", es: "Genera UUID v4 aleatorios en bloque" },
  timestamp: { en: "Convert Unix timestamps to dates and back", es: "Convierte timestamps Unix a fechas y viceversa" },
  cron: { en: "Build cron expressions with next-run preview", es: "Construye expresiones cron con vista previa" },
  "json-to-typescript": { en: "Generate TypeScript interfaces from JSON", es: "Genera interfaces TypeScript desde JSON" },
  "xml-formatter": { en: "Format, prettify or minify XML documents", es: "Formatea, embellece o minifica XML" },
  "json-to-html-table": { en: "Convert JSON arrays to HTML tables", es: "Convierte arrays JSON a tablas HTML" },
  "yaml-validator": { en: "Validate YAML with line-precise errors", es: "Valida YAML con errores por l\u00ednea" },
  "json-schema-validator": { en: "Validate JSON against a JSON Schema", es: "Valida JSON contra un JSON Schema" },
};

export function getToolCardDescription(id: string, lang: Lang): string {
  return toolCardDescriptions[id]?.[lang] ?? toolCardDescriptions[id]?.en ?? "";
}

// Component-specific translations

const formatter = {
  en: {
    spaces2: "2 spaces",
    spaces4: "4 spaces",
    tab: "Tab",
    inputPlaceholder: "Paste your JSON here, or drag & drop a .json file...",
    outputPlaceholder: "Formatted output will appear here...",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    downloadOutput: "Download output as .json",
    onlyJson: "Only .json files are supported",
  },
  es: {
    spaces2: "2 espacios",
    spaces4: "4 espacios",
    tab: "Tab",
    inputPlaceholder: "Pega tu JSON aqu\u00ed, o arrastra y suelta un archivo .json...",
    outputPlaceholder: "La salida formateada aparecer\u00e1 aqu\u00ed...",
    copyInput: "Copiar entrada",
    copyOutput: "Copiar salida",
    downloadOutput: "Descargar salida como .json",
    onlyJson: "Solo se admiten archivos .json",
  },
};

const diff = {
  en: {
    leftOriginal: "Left (Original)",
    rightModified: "Right (Modified)",
    leftPlaceholder: "Paste first JSON...",
    rightPlaceholder: "Paste second JSON...",
    differences: "Differences:",
    lines: "lines",
    noDifferences: "No differences \u2014 JSONs are identical",
    enterLeft: "Enter JSON in the left panel",
    enterRight: "Enter JSON in the right panel",
    enterBoth: "Paste JSON in both panels to compare",
    sideBySide: "Side-by-side",
    unified: "Unified",
    summaryAdded: "added",
    summaryRemoved: "removed",
    summaryChanged: "changed",
    aria_diffOutput: "Diff output",
    aria_leftEditor: "Left JSON editor",
    aria_rightEditor: "Right JSON editor",
  },
  es: {
    leftOriginal: "Izquierda (Original)",
    rightModified: "Derecha (Modificado)",
    leftPlaceholder: "Pega el primer JSON...",
    rightPlaceholder: "Pega el segundo JSON...",
    differences: "Diferencias:",
    lines: "l\u00edneas",
    noDifferences: "Sin diferencias \u2014 los JSON son id\u00e9nticos",
    enterLeft: "Introduce JSON en el panel izquierdo",
    enterRight: "Introduce JSON en el panel derecho",
    enterBoth: "Pega JSON en ambos paneles para comparar",
    sideBySide: "Lado a lado",
    unified: "Unificado",
    summaryAdded: "a\u00f1adidas",
    summaryRemoved: "eliminadas",
    summaryChanged: "modificadas",
    aria_diffOutput: "Salida del diff",
    aria_leftEditor: "Editor JSON izquierdo",
    aria_rightEditor: "Editor JSON derecho",
  },
};

const viewer = {
  en: {
    expandAll: "Expand All",
    collapseAll: "Collapse All",
    tree: "Tree",
    copyPath: "copy path",
    showMore: "Show more",
    remaining: "remaining",
    emptyArray: "Empty array []",
    emptyObject: "Empty object {}",
    pasteHint: "Paste JSON on the left to see the tree view.",
    inputPlaceholder: "Paste JSON to explore as tree...",
  },
  es: {
    expandAll: "Expandir Todo",
    collapseAll: "Colapsar Todo",
    tree: "\u00c1rbol",
    copyPath: "copiar ruta",
    showMore: "Mostrar m\u00e1s",
    remaining: "restantes",
    emptyArray: "Array vac\u00edo []",
    emptyObject: "Objeto vac\u00edo {}",
    pasteHint: "Pega JSON a la izquierda para ver la vista de \u00e1rbol.",
    inputPlaceholder: "Pega JSON para explorar como \u00e1rbol...",
  },
};

const graph = {
  en: {
    expandAll: "Expand All",
    collapseAll: "Collapse All",
    fitView: "Fit View",
    graph: "Graph",
    nodes: "Nodes",
    depth: "Depth",
    zoomLevel: "Zoom",
    inputPlaceholder: "Paste JSON to visualize as a graph...",
    pasteHint: "Paste JSON on the left to see an interactive graph diagram.",
    graphAria: "Interactive JSON graph visualization",
  },
  es: {
    expandAll: "Expandir Todo",
    collapseAll: "Colapsar Todo",
    fitView: "Ajustar Vista",
    graph: "Grafo",
    nodes: "Nodos",
    depth: "Profundidad",
    zoomLevel: "Zoom",
    inputPlaceholder: "Pega JSON para visualizar como grafo...",
    pasteHint: "Pega JSON a la izquierda para ver un diagrama de grafo interactivo.",
    graphAria: "Visualizaci\u00f3n interactiva de grafo JSON",
  },
};

const jsonpath = {
  en: {
    path: "Path:",
    jsonInput: "JSON Input",
    inputPlaceholder: "Paste JSON to query with JSONPath...",
    resultPlaceholder: "Query results will appear here...",
    match: "match",
    matches: "matches",
    examples: "Examples:",
    pasteFirst: "Paste JSON in the input panel first",
    allAuthors: "All authors",
    allPrices: "All prices",
    firstBook: "First book",
    booksWithIsbn: "Books with ISBN",
    booksUnder10: "Books under 10",
    allItems: "All items",
  },
  es: {
    path: "Ruta:",
    jsonInput: "Entrada JSON",
    inputPlaceholder: "Pega JSON para consultar con JSONPath...",
    resultPlaceholder: "Los resultados de la consulta aparecer\u00e1n aqu\u00ed...",
    match: "coincidencia",
    matches: "coincidencias",
    examples: "Ejemplos:",
    pasteFirst: "Pega JSON en el panel de entrada primero",
    allAuthors: "Todos los autores",
    allPrices: "Todos los precios",
    firstBook: "Primer libro",
    booksWithIsbn: "Libros con ISBN",
    booksUnder10: "Libros bajo 10",
    allItems: "Todos los elementos",
  },
};

const regex = {
  en: {
    enterPattern: "Enter regex pattern...",
    testString: "Test String",
    enterTestString: "Enter test string...",
    matchesHighlighted: "Matches & Highlighted",
    matchesPlaceholder: "Matches will be highlighted here",
    atIndex: "at index",
    matches: "matches",
    matchSingular: "match",
    visualize: "Visualize",
    visualization: "Visualization",
    visualizeHint: "See how each part of the pattern is parsed.",
  },
  es: {
    enterPattern: "Introduce un patr\u00f3n regex...",
    testString: "Cadena de Prueba",
    enterTestString: "Introduce la cadena de prueba...",
    matchesHighlighted: "Coincidencias y Resaltado",
    matchesPlaceholder: "Las coincidencias se resaltar\u00e1n aqu\u00ed",
    atIndex: "en \u00edndice",
    matches: "coincidencias",
    matchSingular: "coincidencia",
    visualize: "Visualizar",
    visualization: "Visualizaci\u00f3n",
    visualizeHint: "Mira c\u00f3mo se descompone cada parte del patr\u00f3n.",
  },
};

const base64 = {
  en: {
    text: "Text",
    invalidBase64: "Invalid Base64 string",
    encodePlaceholder: "Enter text to encode...",
    decodePlaceholder: "Enter Base64 to decode...",
    resultPlaceholder: "Result will appear here...",
    urlSafe: "URL-safe",
    urlSafeHint: "URL-safe encoding (base64url)",
  },
  es: {
    text: "Texto",
    invalidBase64: "Cadena Base64 inv\u00e1lida",
    encodePlaceholder: "Introduce texto para codificar...",
    decodePlaceholder: "Introduce Base64 para decodificar...",
    resultPlaceholder: "El resultado aparecer\u00e1 aqu\u00ed...",
    urlSafe: "URL-safe",
    urlSafeHint: "Codificaci\u00f3n URL-safe (base64url)",
  },
};

const urlEncode = {
  en: {
    component: "Component",
    fullUri: "Full URI",
    form: "Form",
    modeHint: "Form: space \u2192 '+' (HTML forms). URI: preserves URL structure. Component: encodes everything.",
    inputPlaceholder: "Enter text or URL to encode/decode...",
    resultPlaceholder: "Result...",
  },
  es: {
    component: "Componente",
    fullUri: "URI Completa",
    form: "Formulario",
    modeHint: "Form: espacio \u2192 '+' (formularios HTML). URI: preserva estructura de URL. Component: codifica todo.",
    inputPlaceholder: "Introduce texto o URL para codificar/decodificar...",
    resultPlaceholder: "Resultado...",
  },
};

const hash = {
  en: {
    pasteToHash: "Paste text to generate hashes",
    hashes: "Hashes",
    inputPlaceholder: "Enter text to hash...",
    emptyHint: "Enter text on the left to generate hash values.",
    modeText: "Text",
    modeFile: "File",
    modeHmac: "HMAC",
    secretKey: "Secret key",
    secretKeyPlaceholder: "Enter HMAC secret key...",
    chooseFile: "Choose file",
    noFile: "No file selected",
    fileTooLarge: "File too large (max 50MB)",
    md5FileUnsupported: "MD5 file hashing not supported \u2014 use SHA-256",
    hashing: "Hashing...",
    hmacAlgorithm: "Algorithm",
    enterKeyAndMessage: "Enter a secret key and a message to compute HMAC.",
    workerTimeout: "MD5 timed out",
    unknownError: "Unknown error",
  },
  es: {
    pasteToHash: "Pega texto para generar hashes",
    hashes: "Hashes",
    inputPlaceholder: "Introduce texto para hashear...",
    emptyHint: "Introduce texto a la izquierda para generar valores hash.",
    modeText: "Texto",
    modeFile: "Archivo",
    modeHmac: "HMAC",
    secretKey: "Clave secreta",
    secretKeyPlaceholder: "Introduce la clave secreta HMAC...",
    chooseFile: "Elegir archivo",
    noFile: "Ning\u00fan archivo seleccionado",
    fileTooLarge: "Archivo demasiado grande (m\u00e1x 50MB)",
    md5FileUnsupported: "Hash MD5 de archivos no soportado \u2014 usa SHA-256",
    hashing: "Hasheando...",
    hmacAlgorithm: "Algoritmo",
    enterKeyAndMessage: "Introduce una clave secreta y un mensaje para calcular HMAC.",
    workerTimeout: "MD5 tard\u00f3 demasiado",
    unknownError: "Error desconocido",
  },
};

const uuid = {
  en: {
    count: "Count:",
    uppercase: "Uppercase",
    noDashes: "No dashes",
    copyAll: "Copy All",
  },
  es: {
    count: "Cantidad:",
    uppercase: "May\u00fasculas",
    noDashes: "Sin guiones",
    copyAll: "Copiar Todo",
  },
};

const timestamp = {
  en: {
    currentUnix: "Current Unix:",
    tsToDate: "Timestamp \u2192 Date",
    dateToTs: "Date \u2192 Timestamp",
    now: "Now",
    seconds: "Seconds",
    millis: "Millis",
    invalidTimestamp: "Invalid timestamp",
    invalidDate: "Invalid date",
    ago: "ago",
    fromNow: "from now",
    secondsUnit: "seconds",
    minutesUnit: "minutes",
    hoursUnit: "hours",
    daysUnit: "days",
    monthsUnit: "months",
    yearsUnit: "years",
  },
  es: {
    currentUnix: "Unix actual:",
    tsToDate: "Timestamp \u2192 Fecha",
    dateToTs: "Fecha \u2192 Timestamp",
    now: "Ahora",
    seconds: "Segundos",
    millis: "Millis",
    invalidTimestamp: "Timestamp inv\u00e1lido",
    invalidDate: "Fecha inv\u00e1lida",
    ago: "atr\u00e1s",
    fromNow: "a partir de ahora",
    secondsUnit: "segundos",
    minutesUnit: "minutos",
    hoursUnit: "horas",
    daysUnit: "d\u00edas",
    monthsUnit: "meses",
    yearsUnit: "a\u00f1os",
  },
};

const cron = {
  en: {
    quickPresets: "Quick Presets",
    fields: "Fields",
    next5Runs: "Next 5 Runs",
    noUpcoming: "No upcoming runs found",
    mustHave5: "Cron expression must have exactly 5 fields",
    minute: "Minute",
    hour: "Hour",
    dayOfMonth: "Day of Month",
    month: "Month",
    dayOfWeek: "Day of Week",
    everyMinute: "Every minute",
    every5min: "Every 5 min",
    every15min: "Every 15 min",
    every30min: "Every 30 min",
    everyHour: "Every hour",
    every2hours: "Every 2 hours",
    dailyMidnight: "Daily midnight",
    daily9am: "Daily 9 AM",
    weekdays9am: "Weekdays 9 AM",
    weeklySunday: "Weekly Sunday",
    monthly1st: "Monthly 1st",
    yearlyJan1: "Yearly Jan 1",
  },
  es: {
    quickPresets: "Presets R\u00e1pidos",
    fields: "Campos",
    next5Runs: "Pr\u00f3ximas 5 Ejecuciones",
    noUpcoming: "No se encontraron pr\u00f3ximas ejecuciones",
    mustHave5: "La expresi\u00f3n cron debe tener exactamente 5 campos",
    minute: "Minuto",
    hour: "Hora",
    dayOfMonth: "D\u00eda del Mes",
    month: "Mes",
    dayOfWeek: "D\u00eda de la Semana",
    everyMinute: "Cada minuto",
    every5min: "Cada 5 min",
    every15min: "Cada 15 min",
    every30min: "Cada 30 min",
    everyHour: "Cada hora",
    every2hours: "Cada 2 horas",
    dailyMidnight: "Diario medianoche",
    daily9am: "Diario 9 AM",
    weekdays9am: "Laborables 9 AM",
    weeklySunday: "Semanal domingo",
    monthly1st: "Mensual d\u00eda 1",
    yearlyJan1: "Anual 1 ene",
  },
};

const jsonToTypescript = {
  en: {
    inputPlaceholder: "Paste JSON to generate TypeScript types...",
    outputPlaceholder: "TypeScript interfaces will appear here...",
  },
  es: {
    inputPlaceholder: "Pega JSON para generar tipos TypeScript...",
    outputPlaceholder: "Las interfaces TypeScript aparecer\u00e1n aqu\u00ed...",
  },
};

const xmlFormatter = {
  en: {
    spaces2: "2 spaces",
    spaces4: "4 spaces",
    inputPlaceholder: "Paste XML to format...",
    outputPlaceholder: "Formatted XML will appear here...",
  },
  es: {
    spaces2: "2 espacios",
    spaces4: "4 espacios",
    inputPlaceholder: "Pega XML para formatear...",
    outputPlaceholder: "El XML formateado aparecer\u00e1 aqu\u00ed...",
  },
};

const jsonToHtmlTable = {
  en: {
    inputPlaceholder: "Paste a JSON array to generate an HTML table...",
    emptyHint: "Enter a JSON array on the left to generate an HTML table.",
    showCode: "Show HTML code",
    showPreview: "Show preview",
    needsArrayOrObject: "Input must be a JSON array or object",
    emptyArray: "Array is empty",
    needsObjects: "Array items must be objects with keys",
  },
  es: {
    inputPlaceholder: "Pega un array JSON para generar una tabla HTML...",
    emptyHint: "Introduce un array JSON a la izquierda para generar una tabla HTML.",
    showCode: "Ver c\u00f3digo HTML",
    showPreview: "Ver previsualizaci\u00f3n",
    needsArrayOrObject: "La entrada debe ser un array u objeto JSON",
    emptyArray: "El array est\u00e1 vac\u00edo",
    needsObjects: "Los elementos del array deben ser objetos con claves",
  },
};

const yamlValidator = {
  en: {
    inputPlaceholder: "Paste YAML to validate...",
    outputPlaceholder: "Parsed JSON output will appear here...",
    validYaml: "Valid YAML",
    invalidYaml: "Invalid YAML",
    line: "line",
    column: "col",
    document: "document",
    documents: "documents",
  },
  es: {
    inputPlaceholder: "Pega YAML para validar...",
    outputPlaceholder: "La salida JSON parseada aparecer\u00e1 aqu\u00ed...",
    validYaml: "YAML v\u00e1lido",
    invalidYaml: "YAML inv\u00e1lido",
    line: "l\u00ednea",
    column: "col",
    document: "documento",
    documents: "documentos",
  },
};

const jsonSchemaValidator = {
  en: {
    jsonPlaceholder: "Paste JSON data to validate...",
    schemaPlaceholder: "Paste JSON Schema...",
    valid: "Valid \u2014 JSON matches the schema",
    invalid: "Invalid",
    error: "error",
    errors: "errors",
    validationErrors: "Validation Errors",
    validate: "Validate",
    awaitingBoth: "Paste JSON and schema to validate",
    awaitingJson: "Awaiting JSON\u2026",
    awaitingSchema: "Awaiting schema\u2026",
  },
  es: {
    jsonPlaceholder: "Pega los datos JSON a validar...",
    schemaPlaceholder: "Pega el JSON Schema...",
    valid: "V\u00e1lido \u2014 JSON coincide con el schema",
    invalid: "Inv\u00e1lido",
    error: "error",
    errors: "errores",
    validationErrors: "Errores de Validaci\u00f3n",
    validate: "Validar",
    awaitingBoth: "Pega JSON y schema para validar",
    awaitingJson: "Esperando JSON\u2026",
    awaitingSchema: "Esperando schema\u2026",
  },
};

const converter = {
  en: {
    copyInput: "Copy input",
    copyOutput: "Copy output",
    downloadOutput: "Download output",
  },
  es: {
    copyInput: "Copiar entrada",
    copyOutput: "Copiar salida",
    downloadOutput: "Descargar salida",
  },
};

type ToolTranslations = Record<string, Record<string, string>>;

const allToolStrings: Record<string, { en: ToolTranslations[string]; es: ToolTranslations[string] }> = {
  formatter, diff, viewer, graph, jsonpath, regex, base64, urlEncode, hash, uuid, timestamp, cron, converter,
  jsonToTypescript, xmlFormatter, jsonToHtmlTable, yamlValidator, jsonSchemaValidator,
};

export function tt(tool: string, lang: Lang, key: string): string {
  return allToolStrings[tool]?.[lang]?.[key] ?? allToolStrings[tool]?.en?.[key] ?? key;
}
