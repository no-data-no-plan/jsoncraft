import type { Lang } from "./index";

interface PageSeo {
  title: string;
  description: string;
  seoHeading: string;
  seoText: string;
  seoBlockHeading: string;
  seoBlockText: string;
  seoFeatures: string[];
}

/**
 * Rich i18n dictionary for the `/` landing page. Separate from the
 * tool-page PageSeo shape because the landing needs hero copy, group
 * labels, and a bottom CTA block that tool pages don't use.
 */
export interface HomeI18n {
  title: string;
  description: string;
  heroEyebrow: string;
  heroHeadingPrefix: string;
  heroHeadingEm: string;
  heroSubtext: string;
  ctaOpenFormatter: string;
  groupCoreLabel: string;
  groupConvertersLabel: string;
  groupDevToolsLabel: string;
  bottomCtaEyebrow: string;
  bottomCtaText: string;
}

const homeI18n: Record<Lang, HomeI18n> = {
  en: {
    title: "JSONCraft — Free JSON, YAML, CSV & TOML Tools in Your Browser",
    description: "23 free developer tools for JSON, YAML, CSV, TOML and XML. Format, validate, diff, convert and visualize — 100% in your browser. No signup, no upload.",
    heroEyebrow: "Free JSON & Data Tools",
    heroHeadingPrefix: "Every JSON task, ",
    heroHeadingEm: "instantly",
    heroSubtext: "Format, validate, convert, diff, visualize — 23 browser tools for JSON, YAML, CSV, TOML and XML. No signup, no upload, nothing leaves your tab.",
    ctaOpenFormatter: "Open JSON Formatter",
    groupCoreLabel: "Core",
    groupConvertersLabel: "Converters",
    groupDevToolsLabel: "Dev Tools",
    bottomCtaEyebrow: "23 free developer tools",
    bottomCtaText: "No signup, no tracking, no limits. Everything runs locally in your browser.",
  },
  es: {
    title: "JSONCraft — Herramientas JSON, YAML, CSV y TOML gratis en tu navegador",
    description: "23 herramientas gratis para desarrolladores: JSON, YAML, CSV, TOML y XML. Formatea, valida, compara, convierte y visualiza — 100% en tu navegador, sin registro ni subidas.",
    heroEyebrow: "Herramientas JSON gratis",
    heroHeadingPrefix: "Toda tarea JSON, ",
    heroHeadingEm: "al instante",
    heroSubtext: "Formatea, valida, convierte, compara, visualiza \u2014 23 herramientas de navegador para JSON, YAML, CSV, TOML y XML. Sin registro, sin subidas, nada sale de tu pesta\u00f1a.",
    ctaOpenFormatter: "Abrir formateador JSON",
    groupCoreLabel: "Esenciales",
    groupConvertersLabel: "Conversores",
    groupDevToolsLabel: "Utilidades Dev",
    bottomCtaEyebrow: "23 herramientas gratis para dev",
    bottomCtaText: "Sin registro, sin tracking, sin l\u00edmites. Todo se ejecuta localmente en tu navegador.",
  },
};

export function getHomeI18n(lang: Lang): HomeI18n {
  return homeI18n[lang];
}

const pages: Record<string, { en: PageSeo; es: PageSeo }> = {
  formatter: {
    en: {
      title: "JSON Formatter & Validator Online Free",
      description: "JSONCraft is a free suite of 22 browser-based developer tools — JSON formatter, validator, diff, YAML/CSV/TOML converters. 100% client-side, no signup.",
      seoHeading: "Format, Validate & Beautify JSON Instantly",
      seoText: "Paste or upload your JSON to instantly format it with proper indentation, validate its syntax, or minify it for production. JSONCraft detects errors in real time and shows the exact line and column. Supports 2-space, 4-space, and tab indentation.",
      seoBlockHeading: "About this tool",
      seoBlockText: "JSONCraft's formatter instantly validates, beautifies, and minifies your JSON. Paste or drop a file and get real-time syntax validation with clear error messages pointing to the exact line and column.",
      seoFeatures: [
        "Format with 2 spaces, 4 spaces, or tabs",
        "Minify JSON to a single compact line",
        "Real-time validation as you type",
        "Upload .json files or drag and drop",
        "Download formatted results",
      ],
    },
    es: {
      title: "Formateador y Validador JSON Online Gratis",
      description: "JSONCraft es un conjunto gratuito de 23 herramientas para desarrolladores — formateador, validador, diff, conversores YAML/CSV/TOML. 100% en navegador.",
      seoHeading: "Formatea, Valida y Embellece JSON al Instante",
      seoText: "Pega o sube tu JSON para formatearlo instant\u00e1neamente con la sangr\u00eda correcta, validar su sintaxis o minificarlo para producci\u00f3n. JSONCraft detecta errores en tiempo real y muestra la l\u00ednea y columna exactas. Soporta sangr\u00eda de 2 espacios, 4 espacios y tabulaciones.",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "El formateador de JSONCraft valida, embellece y minifica tu JSON instant\u00e1neamente. Pega o arrastra un archivo y obt\u00e9n validaci\u00f3n de sintaxis en tiempo real con mensajes de error claros que indican la l\u00ednea y columna exactas.",
      seoFeatures: [
        "Formatear con 2 espacios, 4 espacios o tabulaciones",
        "Minificar JSON en una sola l\u00ednea compacta",
        "Validaci\u00f3n en tiempo real mientras escribes",
        "Subir archivos .json o arrastrar y soltar",
        "Descargar resultados formateados",
      ],
    },
  },
  diff: {
    en: {
      title: "JSON Diff \u2014 Compare JSON Online Side by Side",
      description: "Compare two JSON documents online for free. See additions, deletions, and changes side by side. Real-time diffing, 100% in your browser.",
      seoHeading: "Compare JSON Documents Side by Side",
      seoText: "Paste two JSON documents to instantly see what changed. JSONCraft compares semantically, so different key ordering won't produce false differences. Additions are highlighted in green, deletions in red, with a summary of total changes.",
      seoBlockHeading: "About JSON Diff",
      seoBlockText: "Compare two JSON documents semantically \u2014 key order doesn't matter. See exactly what was added, removed, or changed with color-coded highlighting and a summary of total changes.",
      seoFeatures: [
        "Semantic comparison (key order independent)",
        "Color-coded additions and deletions",
        "Change summary with line counts",
        "Swap sides with one click",
        "Identifies identical documents",
      ],
    },
    es: {
      title: "Diff JSON \u2014 Comparar JSON Online Lado a Lado",
      description: "Compara dos documentos JSON online gratis. Ve adiciones, eliminaciones y cambios resaltados lado a lado. Comparaci\u00f3n sem\u00e1ntica \u2014 el orden de las claves no importa.",
      seoHeading: "Compara Documentos JSON Lado a Lado",
      seoText: "Pega dos documentos JSON para ver instant\u00e1neamente qu\u00e9 cambi\u00f3. JSONCraft compara sem\u00e1nticamente, por lo que un orden de claves diferente no producir\u00e1 diferencias falsas. Las adiciones se resaltan en verde y las eliminaciones en rojo, con un resumen del total de cambios.",
      seoBlockHeading: "Sobre JSON Diff",
      seoBlockText: "Compara dos documentos JSON sem\u00e1nticamente \u2014 el orden de las claves no importa. Ve exactamente qu\u00e9 se a\u00f1adi\u00f3, elimin\u00f3 o cambi\u00f3 con resaltado por colores y un resumen del total de cambios.",
      seoFeatures: [
        "Comparaci\u00f3n sem\u00e1ntica (independiente del orden de claves)",
        "Adiciones y eliminaciones con c\u00f3digo de colores",
        "Resumen de cambios con conteo de l\u00edneas",
        "Intercambiar lados con un clic",
        "Identifica documentos id\u00e9nticos",
      ],
    },
  },
  viewer: {
    en: {
      title: "JSON Tree Viewer Online \u2014 Interactive JSON Explorer",
      description: "Explore JSON as an interactive collapsible tree. Navigate complex nested structures, expand and collapse nodes instantly. Free, browser-based.",
      seoHeading: "Explore JSON as an Interactive Tree",
      seoText: "Visualize any JSON structure as a collapsible tree. Navigate deeply nested data, see types and array lengths at a glance, and click any node to copy its JSONPath expression. Handles large JSON files efficiently.",
      seoBlockHeading: "About JSON Tree Viewer",
      seoBlockText: "Visualize any JSON structure as an interactive, collapsible tree. Quickly navigate deeply nested data, see types and array lengths at a glance, and copy JSONPath expressions for any node.",
      seoFeatures: [
        "Auto-expands the first level for quick overview",
        "Expand or collapse all nodes at once",
        "Shows data types, array lengths, and object sizes",
        "Click any node to copy its JSONPath",
        "Handles empty objects and arrays gracefully",
      ],
    },
    es: {
      title: "Visor de \u00c1rbol JSON Online \u2014 Explorador JSON Interactivo",
      description: "Explora JSON como árbol interactivo colapsable. Navega estructuras anidadas complejas, expande y colapsa nodos al instante. Gratis, en navegador.",
      seoHeading: "Explora JSON como un \u00c1rbol Interactivo",
      seoText: "Visualiza cualquier estructura JSON como un \u00e1rbol colapsable. Navega datos profundamente anidados, ve tipos y longitudes de arrays de un vistazo, y haz clic en cualquier nodo para copiar su expresi\u00f3n JSONPath. Maneja archivos JSON grandes de forma eficiente.",
      seoBlockHeading: "Sobre el Visor de \u00c1rbol JSON",
      seoBlockText: "Visualiza cualquier estructura JSON como un \u00e1rbol interactivo y colapsable. Navega r\u00e1pidamente datos profundamente anidados, ve tipos y longitudes de arrays de un vistazo, y copia expresiones JSONPath de cualquier nodo.",
      seoFeatures: [
        "Expande autom\u00e1ticamente el primer nivel para una vista r\u00e1pida",
        "Expandir o colapsar todos los nodos a la vez",
        "Muestra tipos de datos, longitudes de arrays y tama\u00f1os de objetos",
        "Haz clic en cualquier nodo para copiar su JSONPath",
        "Maneja objetos y arrays vac\u00edos correctamente",
      ],
    },
  },
  graph: {
    en: {
      title: "JSON Graph Visualizer \u2014 Interactive Tree Diagram",
      description: "Visualize JSON data as an interactive graph diagram. Explore nodes, collapse branches, pan and zoom. Free, private, no upload.",
      seoHeading: "Visualize JSON as an Interactive Graph",
      seoText: "Turn any JSON into an interactive node-based graph diagram. Each key becomes a node connected to its children. Collapse branches to focus on what matters, pan and zoom to navigate large structures, and see data types at a glance with color-coded nodes.",
      seoBlockHeading: "About JSON Graph Visualizer",
      seoBlockText: "The JSON Graph Visualizer renders your JSON as an SVG-based tree diagram with clickable nodes. Unlike flat text views, the graph makes nested relationships immediately visible and lets you explore data interactively.",
      seoFeatures: [
        "SVG-based graph with nodes and connections",
        "Collapse and expand any branch",
        "Pan and zoom for large JSON structures",
        "Color-coded nodes by data type",
        "Node count and depth info at a glance",
      ],
    },
    es: {
      title: "Visualizador de Grafo JSON \u2014 Diagrama de \u00c1rbol Interactivo",
      description: "Visualiza datos JSON como un diagrama de grafo interactivo. Explora nodos, colapsa ramas, despl\u00e1zate y haz zoom. Gratis, privado, sin subida.",
      seoHeading: "Visualiza JSON como un Grafo Interactivo",
      seoText: "Convierte cualquier JSON en un diagrama de grafo interactivo basado en nodos. Cada clave se convierte en un nodo conectado a sus hijos. Colapsa ramas para enfocarte en lo importante, despl\u00e1zate y haz zoom para navegar estructuras grandes, y ve los tipos de datos de un vistazo con nodos codificados por color.",
      seoBlockHeading: "Sobre el Visualizador de Grafo JSON",
      seoBlockText: "El Visualizador de Grafo JSON renderiza tu JSON como un diagrama de \u00e1rbol basado en SVG con nodos clicables. A diferencia de las vistas de texto plano, el grafo hace las relaciones anidadas inmediatamente visibles y te permite explorar datos interactivamente.",
      seoFeatures: [
        "Grafo basado en SVG con nodos y conexiones",
        "Colapsar y expandir cualquier rama",
        "Desplazamiento y zoom para estructuras JSON grandes",
        "Nodos codificados por color seg\u00fan tipo de dato",
        "Conteo de nodos y profundidad de un vistazo",
      ],
    },
  },
  jsonpath: {
    en: {
      title: "JSONPath Tester Online \u2014 Query & Filter JSON Data",
      description: "Test JSONPath expressions online with instant results. Evaluate queries, see match counts, and learn JSONPath with built-in examples. Free playground.",
      seoHeading: "Test JSONPath Expressions Interactively",
      seoText: "Evaluate JSONPath queries against your JSON data in real time. See matching results instantly with a count of matches. Includes built-in examples for filters, wildcards, recursive descent, and more to help you learn the syntax.",
      seoBlockHeading: "About JSONPath Tester",
      seoBlockText: "Test and debug JSONPath expressions against your data in real time. Instantly see matching results with a count of matches. Includes quick-access example queries to learn the syntax.",
      seoFeatures: [
        "Real-time evaluation as you type",
        "Match count displayed automatically",
        "Built-in examples: filters, wildcards, recursive descent",
        "Supports the full JSONPath specification",
        "Clear error messages for invalid expressions",
      ],
    },
    es: {
      title: "Tester JSONPath Online \u2014 Consultar y Filtrar Datos JSON",
      description: "Prueba expresiones JSONPath online con resultados instantáneos. Evalúa consultas, ve el conteo de coincidencias y aprende la sintaxis. Playground gratis.",
      seoHeading: "Prueba Expresiones JSONPath de Forma Interactiva",
      seoText: "Eval\u00faa consultas JSONPath contra tus datos JSON en tiempo real. Ve los resultados de coincidencias instant\u00e1neamente con un conteo. Incluye ejemplos integrados para filtros, comodines, descenso recursivo y m\u00e1s para ayudarte a aprender la sintaxis.",
      seoBlockHeading: "Sobre el Tester JSONPath",
      seoBlockText: "Prueba y depura expresiones JSONPath contra tus datos en tiempo real. Ve instant\u00e1neamente los resultados de coincidencias con un conteo. Incluye ejemplos de acceso r\u00e1pido para aprender la sintaxis.",
      seoFeatures: [
        "Evaluaci\u00f3n en tiempo real mientras escribes",
        "Conteo de coincidencias mostrado autom\u00e1ticamente",
        "Ejemplos integrados: filtros, comodines, descenso recursivo",
        "Soporta la especificaci\u00f3n completa de JSONPath",
        "Mensajes de error claros para expresiones inv\u00e1lidas",
      ],
    },
  },
  "yaml-to-json": {
    en: {
      title: "YAML to JSON Converter Online Free",
      description: "Convert YAML to JSON online for free. Instant conversion with full YAML support — multi-document, anchors, nested structures. No data uploaded.",
      seoHeading: "Convert YAML to JSON Instantly",
      seoText: "Paste or upload your YAML configuration files to convert them to JSON format. Supports multi-document YAML, complex nested structures, and automatically detects if you paste the wrong format.",
      seoBlockHeading: "About YAML to JSON conversion",
      seoBlockText: "Convert YAML configuration files and data to JSON format instantly. Supports multi-document YAML, nested structures, anchors, and all standard YAML features.",
      seoFeatures: ["Multi-document YAML support (--- separators)", "Handles complex nested structures", "Auto-detects if you paste the wrong format", "Upload YAML files directly"],
    },
    es: {
      title: "Conversor YAML a JSON Online Gratis",
      description: "Convierte YAML a JSON online gratis. Conversi\u00f3n instant\u00e1nea y precisa con soporte completo de YAML incluyendo archivos multi-documento, anclas y estructuras anidadas.",
      seoHeading: "Convierte YAML a JSON al Instante",
      seoText: "Pega o sube tus archivos de configuraci\u00f3n YAML para convertirlos a formato JSON. Soporta YAML multi-documento, estructuras anidadas complejas y detecta autom\u00e1ticamente si pegas el formato incorrecto.",
      seoBlockHeading: "Sobre la conversi\u00f3n YAML a JSON",
      seoBlockText: "Convierte archivos de configuraci\u00f3n YAML y datos a formato JSON instant\u00e1neamente. Soporta YAML multi-documento, estructuras anidadas, anclas y todas las caracter\u00edsticas est\u00e1ndar de YAML.",
      seoFeatures: ["Soporte YAML multi-documento (separadores ---)", "Maneja estructuras anidadas complejas", "Detecta autom\u00e1ticamente si pegas el formato incorrecto", "Sube archivos YAML directamente"],
    },
  },
  "json-to-yaml": {
    en: {
      title: "JSON to YAML Converter Online Free",
      description: "Convert JSON to YAML online for free. Get clean, readable YAML output with proper indentation. Perfect for creating configuration files from JSON data. 100% client-side.",
      seoHeading: "Convert JSON to Clean YAML",
      seoText: "Transform your JSON data into human-readable YAML with clean 2-space indentation. Ideal for creating configuration files from JSON API responses or converting between data formats.",
      seoBlockHeading: "About JSON to YAML conversion",
      seoBlockText: "Transform JSON data into clean, human-readable YAML. Perfect for creating configuration files from JSON API responses or converting between data formats.",
      seoFeatures: ["Clean 2-space indentation", "Handles nested objects, arrays, and all JSON types", "Primitive values converted with type warnings", "Upload JSON files directly"],
    },
    es: {
      title: "Conversor JSON a YAML Online Gratis",
      description: "Convierte JSON a YAML online gratis. YAML limpio y legible con sangría correcta. Perfecto para crear archivos de configuración desde JSON.",
      seoHeading: "Convierte JSON a YAML Limpio",
      seoText: "Transforma tus datos JSON en YAML legible con sangr\u00eda limpia de 2 espacios. Ideal para crear archivos de configuraci\u00f3n desde respuestas de API JSON o convertir entre formatos de datos.",
      seoBlockHeading: "Sobre la conversi\u00f3n JSON a YAML",
      seoBlockText: "Transforma datos JSON en YAML limpio y legible. Perfecto para crear archivos de configuraci\u00f3n desde respuestas de API JSON o convertir entre formatos de datos.",
      seoFeatures: ["Sangr\u00eda limpia de 2 espacios", "Maneja objetos anidados, arrays y todos los tipos JSON", "Valores primitivos convertidos con avisos de tipo", "Sube archivos JSON directamente"],
    },
  },
  "json-to-csv": {
    en: {
      title: "JSON to CSV Converter Online \u2014 Export to Spreadsheet",
      description: "Convert JSON arrays to CSV online for free. Export JSON data to spreadsheet-friendly CSV with auto-flattening of nested fields. 100% client-side.",
      seoHeading: "Export JSON Data to CSV",
      seoText: "Convert JSON arrays to CSV for use in Excel, Google Sheets, and other data tools. Nested objects are flattened with dot notation (e.g. address.city) and API wrappers are auto-extracted.",
      seoBlockHeading: "About JSON to CSV conversion",
      seoBlockText: "Convert JSON data to CSV for use in spreadsheets and data tools. Handles nested objects by flattening keys with dot notation, and automatically extracts arrays from API response wrappers.",
      seoFeatures: ["Flat arrays of objects convert directly to CSV", "Nested objects flattened with dot notation (e.g. address.city)", "API wrappers like {data: [...]} auto-extracted", "Single objects converted to one-row CSV", "Download result as .csv file"],
    },
    es: {
      title: "Conversor JSON a CSV Online \u2014 Exportar a Hoja de C\u00e1lculo",
      description: "Convierte arrays JSON a CSV online gratis. Exporta datos JSON a CSV compatible con hojas de cálculo con aplanamiento automático. 100% en navegador.",
      seoHeading: "Exporta Datos JSON a CSV",
      seoText: "Convierte arrays JSON a CSV para usar en Excel, Google Sheets y otras herramientas de datos. Los objetos anidados se aplanan con notaci\u00f3n de punto (ej. address.city) y los wrappers de API se extraen autom\u00e1ticamente.",
      seoBlockHeading: "Sobre la conversi\u00f3n JSON a CSV",
      seoBlockText: "Convierte datos JSON a CSV para usar en hojas de c\u00e1lculo y herramientas de datos. Maneja objetos anidados aplanando claves con notaci\u00f3n de punto y extrae autom\u00e1ticamente arrays de wrappers de respuestas de API.",
      seoFeatures: ["Arrays planos de objetos se convierten directamente a CSV", "Objetos anidados aplanados con notaci\u00f3n de punto (ej. address.city)", "Wrappers de API como {data: [...]} extra\u00eddos autom\u00e1ticamente", "Objetos individuales convertidos a CSV de una fila", "Descarga el resultado como archivo .csv"],
    },
  },
  "csv-to-json": {
    en: {
      title: "CSV to JSON Converter Online Free",
      description: "Convert CSV data to JSON online for free. Automatic header detection, delimiter inference, and type conversion. Transform spreadsheet data into structured JSON instantly.",
      seoHeading: "Convert CSV Spreadsheet Data to JSON",
      seoText: "Transform CSV and spreadsheet data into structured JSON. Automatically detects delimiters, infers data types (numbers, booleans), and handles edge cases like embedded JSON in cells.",
      seoBlockHeading: "About CSV to JSON conversion",
      seoBlockText: "Transform CSV and spreadsheet data into structured JSON. Automatically detects delimiters (comma, tab, semicolon), infers data types, and handles edge cases like embedded JSON in cells.",
      seoFeatures: ["Auto-detects comma, tab, and semicolon delimiters", "Numbers and booleans converted to proper JSON types", "Headerless CSV detected and handled", "Embedded JSON in cells parsed automatically", "Upload .csv files directly"],
    },
    es: {
      title: "Conversor CSV a JSON Online Gratis",
      description: "Convierte datos CSV a JSON online gratis. Detección automática de cabeceras, inferencia de tipos y previsualización instantánea. Sin subidas.",
      seoHeading: "Convierte Datos CSV de Hojas de C\u00e1lculo a JSON",
      seoText: "Transforma datos CSV y de hojas de c\u00e1lculo en JSON estructurado. Detecta autom\u00e1ticamente delimitadores, infiere tipos de datos (n\u00fameros, booleanos) y maneja casos especiales como JSON embebido en celdas.",
      seoBlockHeading: "Sobre la conversi\u00f3n CSV a JSON",
      seoBlockText: "Transforma datos CSV y de hojas de c\u00e1lculo en JSON estructurado. Detecta autom\u00e1ticamente delimitadores (coma, tabulaci\u00f3n, punto y coma), infiere tipos de datos y maneja casos especiales como JSON embebido en celdas.",
      seoFeatures: ["Detecta autom\u00e1ticamente delimitadores de coma, tabulaci\u00f3n y punto y coma", "N\u00fameros y booleanos convertidos a tipos JSON correctos", "CSV sin cabeceras detectado y manejado", "JSON embebido en celdas analizado autom\u00e1ticamente", "Sube archivos .csv directamente"],
    },
  },
  "json-to-toml": {
    en: {
      title: "JSON to TOML Converter Online Free",
      description: "Convert JSON to TOML configuration format online for free. Clean TOML output with proper sections and typed values. Handles null values and mixed arrays automatically.",
      seoHeading: "Convert JSON to TOML Configuration",
      seoText: "Transform JSON data into TOML configuration format. Nested objects become TOML sections, typed values are preserved, and TOML-specific limitations like null values and mixed arrays are handled automatically.",
      seoBlockHeading: "About JSON to TOML conversion",
      seoBlockText: "Convert JSON data into TOML configuration format. Handles TOML-specific limitations automatically: null values are replaced, mixed-type arrays are normalized, and root arrays are wrapped.",
      seoFeatures: ["Nested objects mapped to TOML sections", "null values replaced with empty strings (with warnings)", "Mixed-type arrays safely converted to strings", "Root arrays wrapped in an [items] table", "Download result as .toml file"],
    },
    es: {
      title: "Conversor JSON a TOML Online Gratis",
      description: "Convierte JSON a formato TOML online gratis. Salida TOML limpia con secciones, arrays y tablas anidadas. Ideal para archivos de configuración.",
      seoHeading: "Convierte JSON a Configuraci\u00f3n TOML",
      seoText: "Transforma datos JSON en formato de configuraci\u00f3n TOML. Los objetos anidados se convierten en secciones TOML, los valores tipados se preservan y las limitaciones espec\u00edficas de TOML como valores nulos y arrays mixtos se manejan autom\u00e1ticamente.",
      seoBlockHeading: "Sobre la conversi\u00f3n JSON a TOML",
      seoBlockText: "Convierte datos JSON a formato de configuraci\u00f3n TOML. Maneja autom\u00e1ticamente las limitaciones de TOML: los valores nulos se reemplazan, los arrays de tipos mixtos se normalizan y los arrays ra\u00edz se envuelven.",
      seoFeatures: ["Objetos anidados mapeados a secciones TOML", "Valores nulos reemplazados con cadenas vac\u00edas (con avisos)", "Arrays de tipos mixtos convertidos a cadenas de forma segura", "Arrays ra\u00edz envueltos en una tabla [items]", "Descarga el resultado como archivo .toml"],
    },
  },
  "toml-to-json": {
    en: {
      title: "TOML to JSON Converter Online Free",
      description: "Convert TOML configuration files to JSON online. Full TOML v1.0 support with tables, arrays, and datetimes. Browser-based, no upload needed.",
      seoHeading: "Convert TOML Configuration to JSON",
      seoText: "Parse TOML configuration files and convert them to JSON. Supports all TOML v1.0 features including tables, arrays of tables, inline tables, and typed values like dates and integers.",
      seoBlockHeading: "About TOML to JSON conversion",
      seoBlockText: "Parse TOML configuration files and convert them to JSON. Supports all TOML features including tables, arrays of tables, inline tables, and typed values.",
      seoFeatures: ["Full TOML v1.0 support", "Tables and arrays of tables mapped to JSON objects", "Typed values preserved (strings, integers, floats, booleans, dates)", "Clear error messages for invalid TOML syntax"],
    },
    es: {
      title: "Conversor TOML a JSON Online Gratis",
      description: "Convierte archivos TOML a JSON online gratis. Soporte completo de TOML v1.0 con tablas, arrays y datetimes. Sin subidas, en tu navegador.",
      seoHeading: "Convierte Configuraci\u00f3n TOML a JSON",
      seoText: "Analiza archivos de configuraci\u00f3n TOML y conv\u00edertelos a JSON. Soporta todas las caracter\u00edsticas de TOML v1.0 incluyendo tablas, arrays de tablas, tablas en l\u00ednea y valores tipados como fechas y enteros.",
      seoBlockHeading: "Sobre la conversi\u00f3n TOML a JSON",
      seoBlockText: "Analiza archivos de configuraci\u00f3n TOML y conv\u00edertelos a JSON. Soporta todas las caracter\u00edsticas de TOML incluyendo tablas, arrays de tablas, tablas en l\u00ednea y valores tipados.",
      seoFeatures: ["Soporte completo de TOML v1.0", "Tablas y arrays de tablas mapeados a objetos JSON", "Valores tipados preservados (cadenas, enteros, flotantes, booleanos, fechas)", "Mensajes de error claros para sintaxis TOML inv\u00e1lida"],
    },
  },
  regex: {
    en: {
      title: "Regex Tester Online Free",
      description: "Test regular expressions with real-time matching, capture groups, and highlighted results. Free regex playground \u2014 runs entirely in your browser.",
      seoHeading: "Test Regular Expressions Instantly",
      seoText: "Enter a regex pattern and test string to see matches highlighted in real time. Supports all JavaScript regex flags (global, case-insensitive, multiline, dotAll, unicode). View capture groups and match positions.",
      seoBlockHeading: "About this tool",
      seoBlockText: "A real-time regex playground for testing and debugging regular expressions. See matches highlighted as you type with support for capture groups and all standard flags.",
      seoFeatures: [
        "Real-time matching as you type",
        "Capture group display",
        "All JS regex flags (g, i, m, s, u)",
        "Match highlighting with positions",
      ],
    },
    es: {
      title: "Tester de Regex Online Gratis",
      description: "Prueba expresiones regulares con coincidencias en tiempo real, grupos de captura y resultados resaltados. Flags i/g/m/s/u/y. Playground gratis.",
      seoHeading: "Prueba Expresiones Regulares al Instante",
      seoText: "Introduce un patr\u00f3n regex y una cadena de prueba para ver las coincidencias resaltadas en tiempo real. Soporta todos los flags de regex de JavaScript (global, insensible a may\u00fasculas, multil\u00ednea, dotAll, unicode). Ve grupos de captura y posiciones de coincidencia.",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "Un playground de regex en tiempo real para probar y depurar expresiones regulares. Ve las coincidencias resaltadas mientras escribes con soporte para grupos de captura y todos los flags est\u00e1ndar.",
      seoFeatures: [
        "Coincidencias en tiempo real mientras escribes",
        "Visualizaci\u00f3n de grupos de captura",
        "Todos los flags de regex JS (g, i, m, s, u)",
        "Resaltado de coincidencias con posiciones",
      ],
    },
  },
  base64: {
    en: {
      title: "Base64 Encode & Decode Online Free",
      description: "Encode text to Base64 or decode Base64 strings instantly. Free online Base64 converter \u2014 supports UTF-8, runs entirely in your browser.",
      seoHeading: "Base64 Encoder & Decoder",
      seoText: "Convert text to Base64 encoding or decode Base64 back to plain text. Supports full UTF-8 characters. Swap between encode and decode with one click.",
      seoBlockHeading: "About this tool",
      seoBlockText: "Base64 is a binary-to-text encoding scheme that represents binary data as ASCII characters. It's commonly used in data URLs, email attachments, and API payloads.",
      seoFeatures: [
        "Real-time encode and decode",
        "Full UTF-8 support",
        "One-click swap between modes",
        "Copy result to clipboard",
      ],
    },
    es: {
      title: "Codificador y Decodificador Base64 Online Gratis",
      description: "Codifica texto a Base64 o decodifica cadenas Base64 instant\u00e1neamente. Conversor Base64 online gratuito \u2014 soporta UTF-8, se ejecuta completamente en tu navegador.",
      seoHeading: "Codificador y Decodificador Base64",
      seoText: "Convierte texto a codificaci\u00f3n Base64 o decodifica Base64 a texto plano. Soporta caracteres UTF-8 completos. Intercambia entre codificar y decodificar con un clic.",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "Base64 es un esquema de codificaci\u00f3n de binario a texto que representa datos binarios como caracteres ASCII. Se usa com\u00fanmente en data URLs, adjuntos de email y payloads de API.",
      seoFeatures: [
        "Codificaci\u00f3n y decodificaci\u00f3n en tiempo real",
        "Soporte completo de UTF-8",
        "Intercambio entre modos con un clic",
        "Copiar resultado al portapapeles",
      ],
    },
  },
  "url-encode": {
    en: {
      title: "URL Encoder & Decoder Online Free",
      description: "Encode or decode URLs and query strings for safe transmission. Supports encodeURIComponent and encodeURI modes. Free, private, browser-based.",
      seoHeading: "URL Percent-Encoding Tool",
      seoText: "Encode special characters in URLs for safe transmission, or decode percent-encoded strings back to readable text. Choose between Component mode (encodes everything) and Full URI mode (preserves URL structure).",
      seoBlockHeading: "About this tool",
      seoBlockText: "URL encoding (percent-encoding) replaces unsafe characters with % followed by two hex digits. Component mode encodes all special characters, while URI mode preserves characters like :, /, and ? that are valid in URLs.",
      seoFeatures: [
        "encodeURIComponent and encodeURI modes",
        "Real-time encoding/decoding",
        "Swap input and output",
        "Copy result to clipboard",
      ],
    },
    es: {
      title: "Codificador y Decodificador de URL Online Gratis",
      description: "Codifica o decodifica URLs y cadenas de consulta para transmisi\u00f3n segura. Soporta modos encodeURIComponent y encodeURI. Gratuito, privado, en el navegador.",
      seoHeading: "Herramienta de Codificaci\u00f3n Porcentual de URL",
      seoText: "Codifica caracteres especiales en URLs para transmisi\u00f3n segura o decodifica cadenas codificadas en porcentaje a texto legible. Elige entre modo Component (codifica todo) y modo Full URI (preserva la estructura de URL).",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "La codificaci\u00f3n de URL (codificaci\u00f3n porcentual) reemplaza caracteres inseguros con % seguido de dos d\u00edgitos hexadecimales. El modo Component codifica todos los caracteres especiales, mientras que el modo URI preserva caracteres como :, / y ? que son v\u00e1lidos en URLs.",
      seoFeatures: [
        "Modos encodeURIComponent y encodeURI",
        "Codificaci\u00f3n/decodificaci\u00f3n en tiempo real",
        "Intercambiar entrada y salida",
        "Copiar resultado al portapapeles",
      ],
    },
  },
  hash: {
    en: {
      title: "Hash Generator Online Free \u2014 MD5, SHA-1, SHA-256, SHA-512",
      description: "Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes from any text. Free online hash generator using Web Crypto API \u2014 runs in your browser.",
      seoHeading: "Generate Cryptographic Hashes Instantly",
      seoText: "Paste any text to generate its MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hash values simultaneously. Uses the browser's native Web Crypto API for SHA hashes. Your data never leaves your browser.",
      seoBlockHeading: "About this tool",
      seoBlockText: "Cryptographic hash functions produce a fixed-size digest from arbitrary input. SHA-256 and SHA-512 are widely used for data integrity verification, password storage, and digital signatures.",
      seoFeatures: [
        "MD5, SHA-1, SHA-256, SHA-384, SHA-512",
        "Real-time hashing as you type",
        "Uses native Web Crypto API",
        "Copy individual hash values",
      ],
    },
    es: {
      title: "Generador de Hash Online — MD5, SHA-1, SHA-256, SHA-512",
      description: "Genera hashes MD5, SHA-1, SHA-256, SHA-384 y SHA-512 desde cualquier texto. Generador de hash online gratuito usando Web Crypto API \u2014 se ejecuta en tu navegador.",
      seoHeading: "Genera Hashes Criptogr\u00e1ficos al Instante",
      seoText: "Pega cualquier texto para generar sus valores hash MD5, SHA-1, SHA-256, SHA-384 y SHA-512 simult\u00e1neamente. Usa la Web Crypto API nativa del navegador para hashes SHA. Tus datos nunca salen de tu navegador.",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "Las funciones hash criptogr\u00e1ficas producen un resumen de tama\u00f1o fijo a partir de cualquier entrada. SHA-256 y SHA-512 se usan ampliamente para verificaci\u00f3n de integridad de datos, almacenamiento de contrase\u00f1as y firmas digitales.",
      seoFeatures: [
        "MD5, SHA-1, SHA-256, SHA-384, SHA-512",
        "Generaci\u00f3n de hash en tiempo real mientras escribes",
        "Usa Web Crypto API nativa",
        "Copiar valores hash individuales",
      ],
    },
  },
  uuid: {
    en: {
      title: "UUID Generator Online Free \u2014 UUID v4",
      description: "Generate random UUID v4 identifiers instantly. Bulk generation, uppercase option, copy to clipboard. Free, private, browser-based.",
      seoHeading: "Generate Random UUIDs",
      seoText: "Generate one or hundreds of cryptographically random UUID v4 identifiers. Choose uppercase or lowercase, with or without dashes. Uses the browser's native crypto.randomUUID() for true randomness.",
      seoBlockHeading: "About this tool",
      seoBlockText: "UUID (Universally Unique Identifier) v4 generates 128-bit identifiers using cryptographic randomness. They're virtually guaranteed to be unique and are widely used as database primary keys, session tokens, and correlation IDs.",
      seoFeatures: [
        "Cryptographically random UUID v4",
        "Bulk generation (up to 1000)",
        "Uppercase and no-dashes options",
        "Copy individual or all UUIDs",
      ],
    },
    es: {
      title: "Generador de UUID Online Gratis \u2014 UUID v4",
      description: "Genera identificadores UUID v4 aleatorios instant\u00e1neamente. Generaci\u00f3n masiva, opci\u00f3n de may\u00fasculas, copiar al portapapeles. Gratuito, privado, en el navegador.",
      seoHeading: "Genera UUIDs Aleatorios",
      seoText: "Genera uno o cientos de identificadores UUID v4 criptogr\u00e1ficamente aleatorios. Elige may\u00fasculas o min\u00fasculas, con o sin guiones. Usa crypto.randomUUID() nativo del navegador para aleatoriedad verdadera.",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "UUID (Identificador \u00danico Universal) v4 genera identificadores de 128 bits usando aleatoriedad criptogr\u00e1fica. Pr\u00e1cticamente se garantiza que son \u00fanicos y se usan ampliamente como claves primarias de bases de datos, tokens de sesi\u00f3n e IDs de correlaci\u00f3n.",
      seoFeatures: [
        "UUID v4 criptogr\u00e1ficamente aleatorio",
        "Generaci\u00f3n masiva (hasta 1000)",
        "Opciones de may\u00fasculas y sin guiones",
        "Copiar UUIDs individuales o todos",
      ],
    },
  },
  timestamp: {
    en: {
      title: "Unix Timestamp Converter Online Free",
      description: "Convert Unix timestamps to human-readable dates and dates to timestamps. Live clock, UTC/local/ISO display. Free, private, browser-based.",
      seoHeading: "Convert Unix Timestamps & Dates",
      seoText: "Convert between Unix timestamps (epoch time) and human-readable dates. See the current timestamp live, convert in both directions, and copy results in multiple formats including UTC, local time, and ISO 8601.",
      seoBlockHeading: "About this tool",
      seoBlockText: "Unix timestamps count the seconds since January 1, 1970 (the Unix epoch). They're widely used in APIs, databases, and log files. This tool handles both second and millisecond precision timestamps.",
      seoFeatures: [
        "Two-way conversion (timestamp \u2194 date)",
        "Live current timestamp display",
        "UTC, local, ISO 8601, relative formats",
        "Handles seconds and milliseconds",
      ],
    },
    es: {
      title: "Conversor de Timestamp Unix Online Gratis",
      description: "Convierte timestamps Unix a fechas legibles y fechas a timestamps. Reloj en vivo, visualizaci\u00f3n UTC/local/ISO. Gratuito, privado, en el navegador.",
      seoHeading: "Convierte Timestamps Unix y Fechas",
      seoText: "Convierte entre timestamps Unix (tiempo epoch) y fechas legibles. Ve el timestamp actual en vivo, convierte en ambas direcciones y copia resultados en m\u00faltiples formatos incluyendo UTC, hora local e ISO 8601.",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "Los timestamps Unix cuentan los segundos desde el 1 de enero de 1970 (el epoch Unix). Se usan ampliamente en APIs, bases de datos y archivos de log. Esta herramienta maneja timestamps con precisi\u00f3n de segundos y milisegundos.",
      seoFeatures: [
        "Conversi\u00f3n bidireccional (timestamp \u2194 fecha)",
        "Visualizaci\u00f3n del timestamp actual en vivo",
        "Formatos UTC, local, ISO 8601, relativo",
        "Maneja segundos y milisegundos",
      ],
    },
  },
  cron: {
    en: {
      title: "Cron Expression Builder & Tester Online Free",
      description: "Build and test cron expressions with a visual editor. See next 5 scheduled runs, use quick presets, or type expressions manually. Free cron generator.",
      seoHeading: "Build Cron Expressions Visually",
      seoText: "Create cron schedules with a visual builder or type expressions directly. See the next 5 scheduled runs in real time. Quick presets for common schedules like every 5 minutes, daily, weekly, and monthly.",
      seoBlockHeading: "About this tool",
      seoBlockText: "Cron expressions define recurring schedules using 5 fields: minute, hour, day of month, month, and day of week. They're used in Unix crontab, CI/CD pipelines, Kubernetes CronJobs, and cloud schedulers.",
      seoFeatures: [
        "Visual field-by-field editor",
        "12 quick preset schedules",
        "Next 5 runs preview",
        "Human-readable description",
      ],
    },
    es: {
      title: "Constructor de Expresiones Cron Online Gratis",
      description: "Construye y prueba expresiones cron con un editor visual. Ve las próximas 5 ejecuciones programadas con descripciones en lenguaje natural.",
      seoHeading: "Construye Expresiones Cron Visualmente",
      seoText: "Crea programaciones cron con un constructor visual o escribe expresiones directamente. Ve las pr\u00f3ximas 5 ejecuciones programadas en tiempo real. Presets r\u00e1pidos para programaciones comunes como cada 5 minutos, diario, semanal y mensual.",
      seoBlockHeading: "Sobre esta herramienta",
      seoBlockText: "Las expresiones cron definen programaciones recurrentes usando 5 campos: minuto, hora, d\u00eda del mes, mes y d\u00eda de la semana. Se usan en crontab de Unix, pipelines CI/CD, CronJobs de Kubernetes y programadores en la nube.",
      seoFeatures: [
        "Editor visual campo por campo",
        "12 presets de programaciones r\u00e1pidas",
        "Vista previa de las pr\u00f3ximas 5 ejecuciones",
        "Descripci\u00f3n legible por humanos",
      ],
    },
  },
  "json-to-typescript": {
    en: {
      title: "JSON to TypeScript Converter Online Free",
      description: "Convert JSON to TypeScript interfaces and types instantly. Generates clean, typed interfaces from any JSON structure. Free, private, browser-based.",
      seoHeading: "Generate TypeScript Types from JSON",
      seoText: "Paste any JSON data to instantly generate TypeScript interfaces. Handles nested objects, arrays, optional fields, and union types. Perfect for quickly typing API responses or configuration objects.",
      seoBlockHeading: "About JSON to TypeScript conversion",
      seoBlockText: "TypeScript interfaces describe the shape of JavaScript objects. Generating them from JSON samples saves time when typing API responses, configuration files, or database records.",
      seoFeatures: [
        "Generates clean TypeScript interfaces",
        "Handles nested objects and arrays",
        "Detects union types in arrays",
        "Download as .ts file",
        "Real-time conversion as you type",
      ],
    },
    es: {
      title: "Conversor JSON a TypeScript Online Gratis",
      description: "Convierte JSON a interfaces y tipos TypeScript instant\u00e1neamente. Genera interfaces limpias y tipadas desde cualquier estructura JSON. Gratuito, privado, en el navegador.",
      seoHeading: "Genera Tipos TypeScript desde JSON",
      seoText: "Pega cualquier dato JSON para generar interfaces TypeScript instant\u00e1neamente. Maneja objetos anidados, arrays, campos opcionales y tipos uni\u00f3n. Perfecto para tipar r\u00e1pidamente respuestas de API o objetos de configuraci\u00f3n.",
      seoBlockHeading: "Sobre la conversi\u00f3n de JSON a TypeScript",
      seoBlockText: "Las interfaces TypeScript describen la forma de objetos JavaScript. Generarlas desde muestras JSON ahorra tiempo al tipar respuestas de API, archivos de configuraci\u00f3n o registros de bases de datos.",
      seoFeatures: [
        "Genera interfaces TypeScript limpias",
        "Maneja objetos anidados y arrays",
        "Detecta tipos uni\u00f3n en arrays",
        "Descargar como archivo .ts",
        "Conversi\u00f3n en tiempo real mientras escribes",
      ],
    },
  },
  "xml-formatter": {
    en: {
      title: "XML Formatter & Prettifier Online Free",
      description: "Format, prettify and minify XML online for free. Proper indentation, syntax validation, and one-click minification. 100% private, browser-based.",
      seoHeading: "Format & Prettify XML Instantly",
      seoText: "Paste or upload XML to instantly format it with proper indentation. Supports 2-space and 4-space indentation. Minify XML to a single line for production. Validates syntax and shows detailed error messages.",
      seoBlockHeading: "About XML formatting",
      seoBlockText: "XML (eXtensible Markup Language) is used for configuration files, data exchange, and web services. Well-formatted XML with proper indentation makes it much easier to read and debug.",
      seoFeatures: [
        "Format with 2 or 4 spaces indentation",
        "Minify to a single compact line",
        "Syntax validation with error messages",
        "Upload .xml files directly",
        "Download formatted results",
      ],
    },
    es: {
      title: "Formateador XML Online Gratis",
      description: "Formatea, embellece y minifica XML online gratis. Sangr\u00eda correcta, validaci\u00f3n de sintaxis y minificaci\u00f3n con un clic. 100% privado, en el navegador.",
      seoHeading: "Formatea y Embellece XML al Instante",
      seoText: "Pega o sube XML para formatearlo instant\u00e1neamente con la sangr\u00eda correcta. Soporta sangr\u00eda de 2 y 4 espacios. Minifica XML en una sola l\u00ednea para producci\u00f3n. Valida la sintaxis y muestra mensajes de error detallados.",
      seoBlockHeading: "Sobre el formateo de XML",
      seoBlockText: "XML (Lenguaje de Marcado Extensible) se usa para archivos de configuraci\u00f3n, intercambio de datos y servicios web. XML bien formateado con sangr\u00eda correcta es mucho m\u00e1s f\u00e1cil de leer y depurar.",
      seoFeatures: [
        "Formatear con sangr\u00eda de 2 o 4 espacios",
        "Minificar en una sola l\u00ednea compacta",
        "Validaci\u00f3n de sintaxis con mensajes de error",
        "Subir archivos .xml directamente",
        "Descargar resultados formateados",
      ],
    },
  },
  "json-to-html-table": {
    en: {
      title: "JSON to HTML Table Converter Online Free",
      description: "Convert JSON arrays to clean HTML tables with live preview. Download as HTML file or copy the code. Free, private, browser-based.",
      seoHeading: "Convert JSON to HTML Tables",
      seoText: "Paste a JSON array of objects to instantly generate a clean HTML table. Preview the table live or view the generated HTML code. Download as a standalone HTML file with basic styling included.",
      seoBlockHeading: "About JSON to HTML table conversion",
      seoBlockText: "Converting JSON data to HTML tables is common when building reports, dashboards, or documentation. This tool generates semantic HTML with thead, tbody, and proper escaping.",
      seoFeatures: [
        "Live table preview",
        "Toggle between preview and HTML code",
        "Download as standalone HTML file",
        "Handles nested objects (serialized as JSON)",
        "Proper HTML escaping for safe output",
      ],
    },
    es: {
      title: "Conversor JSON a Tabla HTML Online Gratis",
      description: "Convierte arrays JSON a tablas HTML limpias con vista previa en vivo. Descarga como archivo HTML o copia el c\u00f3digo. Gratuito, privado, en el navegador.",
      seoHeading: "Convierte JSON a Tablas HTML",
      seoText: "Pega un array JSON de objetos para generar instant\u00e1neamente una tabla HTML limpia. Previsualiza la tabla en vivo o ve el c\u00f3digo HTML generado. Descarga como archivo HTML independiente con estilos b\u00e1sicos incluidos.",
      seoBlockHeading: "Sobre la conversi\u00f3n de JSON a tabla HTML",
      seoBlockText: "Convertir datos JSON a tablas HTML es com\u00fan al crear informes, dashboards o documentaci\u00f3n. Esta herramienta genera HTML sem\u00e1ntico con thead, tbody y escape correcto.",
      seoFeatures: [
        "Vista previa de tabla en vivo",
        "Alternar entre vista previa y c\u00f3digo HTML",
        "Descargar como archivo HTML independiente",
        "Maneja objetos anidados (serializados como JSON)",
        "Escape HTML correcto para salida segura",
      ],
    },
  },
  "yaml-validator": {
    en: {
      title: "YAML Validator & Linter Online Free",
      description: "Validate YAML syntax online with detailed error messages and line numbers. See parsed JSON output. Supports multi-document YAML. Free, private, browser-based.",
      seoHeading: "Validate YAML Syntax Instantly",
      seoText: "Paste YAML to instantly validate its syntax. See exact error positions with line and column numbers. View the parsed result as JSON. Supports multi-document YAML files separated by --- delimiters.",
      seoBlockHeading: "About YAML validation",
      seoBlockText: "YAML is a human-readable data serialization format used for configuration files (Docker Compose, Kubernetes, CI/CD). Syntax errors in YAML can be hard to spot due to indentation-based structure.",
      seoFeatures: [
        "Real-time validation as you type",
        "Error messages with line and column numbers",
        "Parsed JSON output preview",
        "Multi-document YAML support (--- separators)",
        "Upload .yaml/.yml files",
      ],
    },
    es: {
      title: "Validador YAML Online Gratis",
      description: "Valida la sintaxis YAML online con mensajes de error detallados y números de línea. Ve exactamente dónde está el problema. 100% en navegador.",
      seoHeading: "Valida la Sintaxis YAML al Instante",
      seoText: "Pega YAML para validar su sintaxis instant\u00e1neamente. Ve posiciones exactas de errores con n\u00fameros de l\u00ednea y columna. Visualiza el resultado parseado como JSON. Soporta archivos YAML multi-documento separados por delimitadores ---.",
      seoBlockHeading: "Sobre la validaci\u00f3n de YAML",
      seoBlockText: "YAML es un formato de serializaci\u00f3n de datos legible por humanos usado para archivos de configuraci\u00f3n (Docker Compose, Kubernetes, CI/CD). Los errores de sintaxis en YAML pueden ser dif\u00edciles de detectar debido a la estructura basada en sangr\u00eda.",
      seoFeatures: [
        "Validaci\u00f3n en tiempo real mientras escribes",
        "Mensajes de error con n\u00fameros de l\u00ednea y columna",
        "Vista previa de salida JSON parseada",
        "Soporte multi-documento YAML (separadores ---)",
        "Subir archivos .yaml/.yml",
      ],
    },
  },
  "json-schema-validator": {
    en: {
      title: "JSON Schema Validator Online Free",
      description: "Validate JSON data against a JSON Schema with detailed error reports. Supports Draft-07. All errors shown at once. Free, private, browser-based.",
      seoHeading: "Validate JSON Against a Schema",
      seoText: "Paste JSON data and a JSON Schema to instantly validate compliance. See all validation errors at once with exact paths and descriptions. Powered by Ajv, the fastest JSON Schema validator.",
      seoBlockHeading: "About JSON Schema validation",
      seoBlockText: "JSON Schema defines the structure, types, and constraints of JSON data. It's used for API request/response validation, configuration file validation, and data quality checks.",
      seoFeatures: [
        "Full JSON Schema Draft-07 support",
        "All validation errors shown at once",
        "Exact error paths and descriptions",
        "Real-time validation as you type",
        "Sample schema with common patterns",
      ],
    },
    es: {
      title: "Validador de JSON Schema Online Gratis",
      description: "Valida datos JSON contra un JSON Schema con informes de error detallados. Soporta Draft-07. Todos los errores mostrados a la vez. Gratuito, privado, en el navegador.",
      seoHeading: "Valida JSON Contra un Schema",
      seoText: "Pega datos JSON y un JSON Schema para validar el cumplimiento instant\u00e1neamente. Ve todos los errores de validaci\u00f3n a la vez con rutas exactas y descripciones. Potenciado por Ajv, el validador de JSON Schema m\u00e1s r\u00e1pido.",
      seoBlockHeading: "Sobre la validaci\u00f3n de JSON Schema",
      seoBlockText: "JSON Schema define la estructura, tipos y restricciones de datos JSON. Se usa para validaci\u00f3n de solicitudes/respuestas de API, validaci\u00f3n de archivos de configuraci\u00f3n y verificaciones de calidad de datos.",
      seoFeatures: [
        "Soporte completo de JSON Schema Draft-07",
        "Todos los errores de validaci\u00f3n mostrados a la vez",
        "Rutas exactas y descripciones de errores",
        "Validaci\u00f3n en tiempo real mientras escribes",
        "Schema de ejemplo con patrones comunes",
      ],
    },
  },
};

export function getPageSeo(toolId: string, lang: Lang): PageSeo | undefined {
  return pages[toolId]?.[lang];
}
