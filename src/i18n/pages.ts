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
      seoText: "Paste, drop a file, or upload raw JSON and the formatter parses it, reports the first syntax error with the exact line and column, and re-emits it with consistent indentation. Toggle between 2-space, 4-space, or tab indentation, or minify the document to a single line to strip every non-essential whitespace byte for production payloads.\n\nReach for the formatter whenever you need to clean up a one-line API response pasted from DevTools, prepare a fixture file for a test suite, inspect a minified webhook body, or normalise JSON before committing it to a repo so diffs stay readable. It also works as a quick validator step before sending data through a schema check or a parser that gives less helpful errors.\n\nValidation runs on every keystroke, so trailing commas, unquoted keys, mismatched brackets, and invalid escapes surface immediately with the offending token highlighted. The tool keeps key order intact, preserves numeric precision within JavaScript's Number range, and handles deeply nested structures and large arrays without truncating. The result area supports one-click copy and download as a .json file.\n\nEverything runs in your browser through a local parser \u2014 no upload, no server round-trip, no telemetry. Your payload never leaves the tab.",
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
      seoText: "Pega, arrastra un archivo o sube JSON crudo y el formateador lo parsea, reporta el primer error de sintaxis con l\u00ednea y columna exactas, y lo reescribe con sangr\u00eda consistente. Alterna entre sangr\u00eda de 2 espacios, 4 espacios o tabulaciones, o minifica el documento a una sola l\u00ednea para eliminar cada byte de espacio en blanco no esencial en payloads de producci\u00f3n.\n\nUsa el formateador cuando necesites limpiar una respuesta de API de una sola l\u00ednea pegada desde DevTools, preparar un fixture para una suite de tests, inspeccionar el cuerpo de un webhook minificado o normalizar JSON antes de commitearlo al repo para que los diffs queden legibles. Tambi\u00e9n funciona como paso de validaci\u00f3n r\u00e1pida antes de pasar datos por un schema o un parser con errores menos claros.\n\nLa validaci\u00f3n corre en cada pulsaci\u00f3n, as\u00ed que comas finales, claves sin comillas, corchetes desbalanceados y escapes inv\u00e1lidos aparecen al instante con el token problem\u00e1tico resaltado. La herramienta mantiene el orden de las claves, preserva la precisi\u00f3n num\u00e9rica dentro del rango de Number de JavaScript y maneja estructuras profundamente anidadas y arrays grandes sin truncar. El \u00e1rea de resultado soporta copia con un clic y descarga como archivo .json.\n\nTodo corre en tu navegador mediante un parser local \u2014 sin subida, sin viaje al servidor, sin telemetr\u00eda. Tu payload nunca sale de la pesta\u00f1a.",
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
      seoText: "Paste two JSON documents into the left and right panes and the diff engine walks both trees key-by-key and index-by-index, emitting a color-coded report of additions, deletions, and value changes. Comparison is semantic, so reordering keys inside an object does not register as a change \u2014 only real structural and value differences surface.\n\nThis is the tool for reviewing what actually changed between two API responses across environments, spotting drift between a committed fixture and a fresh capture, validating migrations where key ordering varies, or debugging regressions where a field silently flipped type. It is also useful for config review: diff a production config against staging and see every real delta in seconds.\n\nAdded values are highlighted in green, removed in red, and changed values show both old and new. A summary header reports the total number of added, removed, and changed paths so you can gauge impact at a glance. A swap button flips the two inputs without reloading, and identical documents render an explicit \"no differences\" banner so you do not have to scan blank output.\n\nBoth documents stay in the browser \u2014 the diff runs locally in JavaScript with no upload, no logging, and no remote call.",
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
      seoText: "Pega dos documentos JSON en los paneles izquierdo y derecho y el motor de diff recorre ambos \u00e1rboles clave por clave e \u00edndice por \u00edndice, emitiendo un informe codificado por colores de adiciones, eliminaciones y cambios de valor. La comparaci\u00f3n es sem\u00e1ntica, as\u00ed que reordenar claves dentro de un objeto no se registra como cambio \u2014 solo las diferencias estructurales y de valor reales afloran.\n\nEsta es la herramienta para revisar qu\u00e9 cambi\u00f3 realmente entre dos respuestas de API en distintos entornos, detectar deriva entre un fixture commiteado y una captura nueva, validar migraciones donde el orden de claves var\u00eda, o depurar regresiones donde un campo cambi\u00f3 de tipo silenciosamente. Tambi\u00e9n sirve para revisar configs: compara producci\u00f3n contra staging y ve cada delta real en segundos.\n\nLos valores a\u00f1adidos se resaltan en verde, los eliminados en rojo, y los cambiados muestran valor antiguo y nuevo. Una cabecera de resumen reporta el total de rutas a\u00f1adidas, eliminadas y cambiadas para que midas el impacto de un vistazo. Un bot\u00f3n de intercambio invierte los dos inputs sin recargar, y los documentos id\u00e9nticos renderizan un banner expl\u00edcito de \"sin diferencias\" para que no escanees salida vac\u00eda.\n\nAmbos documentos se quedan en el navegador \u2014 el diff corre localmente en JavaScript sin subida, sin logging y sin llamadas remotas.",
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
      seoText: "Paste any JSON document and the viewer renders it as a collapsible tree with one node per key, showing inferred data types, array lengths, and object sizes inline next to every branch. The first level auto-expands so you get an immediate overview, and you can expand or collapse every node at once with a single control when you need to zoom in or out.\n\nThis is the right tool when you are exploring an unfamiliar API response, auditing a large configuration payload, hunting for a specific deeply nested field, or reviewing log records where flat text becomes unreadable beyond a few levels. Clicking any node copies its JSONPath expression to the clipboard, which you can then paste into the JSONPath tester or into runtime code to extract that value programmatically.\n\nThe viewer is built for size: multi-megabyte documents remain responsive because nodes render lazily on expand, and empty objects and arrays render as explicit empty placeholders so you never confuse \"missing\" with \"present but empty\". Numbers keep their source precision, strings preserve whitespace, and null/true/false are rendered distinctly so types are always obvious.\n\nAll parsing and rendering happen locally \u2014 the document is never transmitted anywhere.",
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
      seoText: "Pega cualquier documento JSON y el visor lo renderiza como un \u00e1rbol colapsable con un nodo por clave, mostrando tipos de datos inferidos, longitudes de arrays y tama\u00f1os de objetos en l\u00ednea junto a cada rama. El primer nivel se auto-expande para darte un resumen inmediato, y puedes expandir o colapsar todos los nodos a la vez con un control \u00fanico cuando necesites hacer zoom.\n\nEsta es la herramienta correcta cuando exploras una respuesta de API desconocida, auditas un payload de configuraci\u00f3n grande, buscas un campo espec\u00edfico profundamente anidado o revisas registros de log donde el texto plano se vuelve ilegible m\u00e1s all\u00e1 de unos pocos niveles. Hacer clic en cualquier nodo copia su expresi\u00f3n JSONPath al portapapeles, que luego puedes pegar en el tester JSONPath o en c\u00f3digo para extraer ese valor program\u00e1ticamente.\n\nEl visor est\u00e1 pensado para tama\u00f1o: documentos de varios megabytes siguen siendo responsivos porque los nodos se renderizan perezosamente al expandir, y los objetos y arrays vac\u00edos se renderizan como marcadores expl\u00edcitos para que nunca confundas \"faltante\" con \"presente pero vac\u00edo\". Los n\u00fameros mantienen la precisi\u00f3n de origen, las cadenas preservan espacios y null/true/false se renderizan distinto para que los tipos siempre sean obvios.\n\nTodo el parseo y renderizado ocurre localmente \u2014 el documento nunca se transmite a ning\u00fan sitio.",
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
      seoText: "Paste any JSON and the visualizer renders it as an SVG-based node-edge graph where each key becomes a node and each parent-child relationship becomes an edge. Primitive values sit at the leaves, objects and arrays branch out, and the entire diagram is pannable and zoomable so you can navigate documents that would be unreadable as scrolling text.\n\nReach for this when you are explaining a data shape to a teammate, documenting an API response in a design review, scoping a schema migration, or trying to understand an unfamiliar payload where nesting obscures relationships. It is particularly useful for deeply recursive structures like AST dumps, GraphQL responses, tree-shaped configs, and organisation/permission hierarchies where the connections matter more than the exact values.\n\nNodes are color-coded by data type (string, number, boolean, null, object, array) so types are legible at a glance. Any branch can be collapsed to hide its subtree, letting you focus on one section without losing context. A small stats panel reports the total node count and maximum depth so you can quickly gauge complexity, and layout recomputes automatically as you expand or collapse branches.\n\nRendering happens entirely in the browser \u2014 nothing is uploaded, nothing is stored server-side.",
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
      seoText: "Pega cualquier JSON y el visualizador lo renderiza como un grafo de nodos y aristas basado en SVG donde cada clave es un nodo y cada relaci\u00f3n padre-hijo es una arista. Los valores primitivos quedan en las hojas, objetos y arrays se ramifican, y el diagrama entero es desplazable y con zoom para navegar documentos que ser\u00edan ilegibles como texto con scroll.\n\n\u00dasalo cuando expliques una forma de datos a un compa\u00f1ero, documentes una respuesta de API en una design review, dimensiones una migraci\u00f3n de schema o intentes entender un payload desconocido donde el anidamiento oculta relaciones. Es especialmente \u00fatil para estructuras recursivas como dumps de AST, respuestas GraphQL, configs en \u00e1rbol y jerarqu\u00edas de permisos donde las conexiones importan m\u00e1s que los valores exactos.\n\nLos nodos est\u00e1n codificados por color seg\u00fan tipo de dato (cadena, n\u00famero, booleano, null, objeto, array) para que los tipos sean legibles de un vistazo. Cualquier rama se puede colapsar para ocultar su sub\u00e1rbol, permiti\u00e9ndote enfocarte en una secci\u00f3n sin perder contexto. Un panel de stats reporta el conteo total de nodos y profundidad m\u00e1xima para que midas complejidad r\u00e1pido, y el layout se recalcula autom\u00e1ticamente al expandir o colapsar ramas.\n\nEl renderizado ocurre totalmente en el navegador \u2014 nada se sube, nada se guarda en servidor.",
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
      seoText: "Paste your JSON and a JSONPath expression, and the tester evaluates the query against the document in real time, listing every match and counting how many nodes the path selected. Expressions run on every keystroke, so you can iterate a filter until it returns exactly the subset you need without leaving the page.\n\nThis is the tool for building the exact query you will later use in jq-style pipelines, JMESPath fields in cloud tools, CI assertions, JSONPath-based rule engines, or runtime code that extracts values from API payloads. It is equally good for debugging a query that looks right but returns nothing, or for exploring an unfamiliar document by writing recursive-descent queries like $..id to survey every identifier in the tree.\n\nThe full JSONPath surface is supported: root ($), child (.key and [\"key\"]), array index and slice ([0], [1:3], [-1]), wildcard (*), recursive descent (..), and filter expressions ([?(@.price > 10)]). The example dropdown seeds common patterns so you can compare your query against a known-good baseline, and invalid expressions produce a specific error message rather than a silent empty result.\n\nThe data and the query stay in your browser \u2014 nothing is sent to a server at any point.",
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
      seoText: "Pega tu JSON y una expresi\u00f3n JSONPath, y el tester eval\u00faa la consulta contra el documento en tiempo real, listando cada coincidencia y contando cu\u00e1ntos nodos seleccion\u00f3 la ruta. Las expresiones se ejecutan en cada pulsaci\u00f3n, as\u00ed que puedes iterar un filtro hasta devolver exactamente el subconjunto que necesitas sin salir de la p\u00e1gina.\n\nEsta es la herramienta para construir la consulta exacta que luego usar\u00e1s en pipelines tipo jq, campos JMESPath en herramientas cloud, aserciones de CI, motores de reglas basados en JSONPath o c\u00f3digo que extrae valores de payloads de API. Tambi\u00e9n sirve para depurar una consulta que parece correcta pero no devuelve nada, o para explorar un documento desconocido escribiendo consultas de descenso recursivo como $..id y hacer un censo de identificadores.\n\nLa superficie completa de JSONPath est\u00e1 soportada: ra\u00edz ($), hijo (.clave y [\"clave\"]), \u00edndice y slice ([0], [1:3], [-1]), comod\u00edn (*), descenso recursivo (..) y expresiones de filtro ([?(@.price > 10)]). El desplegable de ejemplos siembra patrones comunes para comparar tu consulta contra un baseline conocido, y las expresiones inv\u00e1lidas producen un mensaje de error espec\u00edfico en vez de un resultado vac\u00edo silencioso.\n\nLos datos y la consulta se quedan en tu navegador \u2014 nada se env\u00eda a un servidor en ning\u00fan momento.",
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
      seoText: "Paste or upload a YAML file and the converter parses it into a native data structure, then serialises that structure as valid JSON with proper indentation. Multi-document YAML separated by --- is converted to a JSON array of documents, anchors and aliases are resolved before emitting, and nested maps and sequences survive the round-trip with their structure intact.\n\nThis is the everyday tool for feeding YAML-based configs (Kubernetes manifests, GitHub Actions workflows, Docker Compose files, OpenAPI specs) into systems that only consume JSON \u2014 test fixtures, schema validators, REST clients, serverless configurations, or ad-hoc scripts. It is also useful when a colleague shares config as YAML but your pipeline or editor works better with JSON.\n\nTyped scalars are preserved: integers stay integers, floats stay floats, booleans (true/false/yes/no) are normalised to JSON booleans, null/~/empty become JSON null, and dates/timestamps are serialised as ISO 8601 strings. If you paste what looks like JSON by mistake, the converter detects it and suggests the reverse direction instead of producing confusing output.\n\nParsing and emitting both run locally in your browser \u2014 no upload, no third-party service, no storage.",
      seoBlockHeading: "About YAML to JSON conversion",
      seoBlockText: "Convert YAML configuration files and data to JSON format instantly. Supports multi-document YAML, nested structures, anchors, and all standard YAML features.",
      seoFeatures: ["Multi-document YAML support (--- separators)", "Handles complex nested structures", "Auto-detects if you paste the wrong format", "Upload YAML files directly"],
    },
    es: {
      title: "Conversor YAML a JSON Online Gratis",
      description: "Convierte YAML a JSON online gratis. Conversi\u00f3n instant\u00e1nea y precisa con soporte completo de YAML incluyendo archivos multi-documento, anclas y estructuras anidadas.",
      seoHeading: "Convierte YAML a JSON al Instante",
      seoText: "Pega o sube un archivo YAML y el conversor lo parsea a una estructura de datos nativa, luego serializa esa estructura como JSON v\u00e1lido con sangr\u00eda correcta. El YAML multi-documento separado por --- se convierte en un array JSON de documentos, las anclas y aliases se resuelven antes de emitir, y los mapas y secuencias anidadas sobreviven al round-trip con su estructura intacta.\n\nEs la herramienta diaria para alimentar configs basados en YAML (manifests de Kubernetes, workflows de GitHub Actions, archivos Docker Compose, specs OpenAPI) a sistemas que solo consumen JSON \u2014 fixtures de tests, validadores de schema, clientes REST, configuraciones serverless o scripts ad-hoc. Tambi\u00e9n sirve cuando un compa\u00f1ero comparte config como YAML pero tu pipeline o editor funciona mejor con JSON.\n\nLos escalares tipados se preservan: los enteros siguen siendo enteros, los flotantes flotantes, los booleanos (true/false/yes/no) se normalizan a booleanos JSON, null/~/vac\u00edo se vuelven null JSON, y las fechas/timestamps se serializan como cadenas ISO 8601. Si pegas algo que parece JSON por error, el conversor lo detecta y sugiere la direcci\u00f3n inversa en vez de producir salida confusa.\n\nEl parseo y la emisi\u00f3n corren localmente en tu navegador \u2014 sin subida, sin servicio de terceros, sin almacenamiento.",
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
      seoText: "Paste or upload JSON and the converter parses it, then emits a YAML document with clean 2-space indentation that mirrors the original tree. Nested objects become YAML maps, arrays become block sequences, and every JSON primitive type is mapped to the equivalent YAML scalar so the data round-trips faithfully.\n\nThis is the tool for turning a JSON API response into a readable config file, generating Kubernetes or Docker Compose YAML from a programmatic source, converting OpenAPI JSON to its YAML variant, or porting fixtures from one format to another for a codebase that prefers YAML. It is also useful for code review \u2014 YAML is often easier to read in a PR than the equivalent JSON blob.\n\nEdge cases are handled sensibly: strings that contain special characters (colons, dashes, leading numbers, YAML reserved words like yes/no/on/off) are quoted automatically, multi-line strings use the literal block style, null becomes an explicit null, and deeply nested structures stay aligned without drift. If your JSON root is a primitive rather than an object or array, a type warning surfaces so you know the output is a single scalar.\n\nAll parsing and emission runs in your browser \u2014 the JSON never leaves the tab and no server sees your data.",
      seoBlockHeading: "About JSON to YAML conversion",
      seoBlockText: "Transform JSON data into clean, human-readable YAML. Perfect for creating configuration files from JSON API responses or converting between data formats.",
      seoFeatures: ["Clean 2-space indentation", "Handles nested objects, arrays, and all JSON types", "Primitive values converted with type warnings", "Upload JSON files directly"],
    },
    es: {
      title: "Conversor JSON a YAML Online Gratis",
      description: "Convierte JSON a YAML online gratis. YAML limpio y legible con sangría correcta. Perfecto para crear archivos de configuración desde JSON.",
      seoHeading: "Convierte JSON a YAML Limpio",
      seoText: "Pega o sube JSON y el conversor lo parsea, luego emite un documento YAML con sangr\u00eda limpia de 2 espacios que refleja el \u00e1rbol original. Los objetos anidados se vuelven mapas YAML, los arrays secuencias en bloque, y cada tipo primitivo JSON se mapea al escalar YAML equivalente para que los datos hagan round-trip fielmente.\n\nEs la herramienta para convertir una respuesta de API JSON en un archivo de config legible, generar YAML de Kubernetes o Docker Compose desde una fuente program\u00e1tica, convertir OpenAPI JSON a su variante YAML o portar fixtures entre formatos para un codebase que prefiere YAML. Tambi\u00e9n sirve para code review \u2014 YAML suele leerse mejor en un PR que el blob JSON equivalente.\n\nLos casos borde se manejan con sentido: las cadenas con caracteres especiales (dos puntos, guiones, n\u00fameros iniciales, palabras reservadas YAML como yes/no/on/off) se entrecomillan autom\u00e1ticamente, las cadenas multil\u00ednea usan el estilo de bloque literal, null se vuelve null expl\u00edcito, y las estructuras profundamente anidadas mantienen alineaci\u00f3n sin deriva. Si la ra\u00edz de tu JSON es un primitivo en lugar de objeto o array, aparece un aviso de tipo para que sepas que la salida es un escalar \u00fanico.\n\nTodo el parseo y emisi\u00f3n corre en tu navegador \u2014 el JSON nunca sale de la pesta\u00f1a y ning\u00fan servidor ve tus datos.",
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
      seoText: "Paste a JSON array of objects and the converter produces a CSV with a header row derived from the union of all keys across rows, quoting values that contain commas, quotes, or newlines according to RFC 4180 so spreadsheets import cleanly. Nested objects are flattened into dotted columns (address.city, address.zip) so no structural information is lost.\n\nReach for this when you need to load an API response into Excel, Google Sheets, or a BI tool; build a quick pivot from a JSON export; hand JSON data to a non-technical teammate who only works in spreadsheets; or produce a diffable text export for data stored in JSON at rest. It is equally useful for one-off exports before a demo and for scripted data extraction pipelines.\n\nCommon wrapper shapes like {\"data\": [...]} and {\"results\": [...]} are auto-detected and unwrapped so you don't have to edit the input. A single object without an enclosing array is converted to a one-row CSV. Arrays of primitives become a single-column CSV, and rows with differing key sets are reconciled to a stable column order. The result can be copied to the clipboard or downloaded as a .csv file.\n\nThe entire conversion runs in your browser \u2014 nothing is uploaded, nothing is tracked.",
      seoBlockHeading: "About JSON to CSV conversion",
      seoBlockText: "Convert JSON data to CSV for use in spreadsheets and data tools. Handles nested objects by flattening keys with dot notation, and automatically extracts arrays from API response wrappers.",
      seoFeatures: ["Flat arrays of objects convert directly to CSV", "Nested objects flattened with dot notation (e.g. address.city)", "API wrappers like {data: [...]} auto-extracted", "Single objects converted to one-row CSV", "Download result as .csv file"],
    },
    es: {
      title: "Conversor JSON a CSV Online \u2014 Exportar a Hoja de C\u00e1lculo",
      description: "Convierte arrays JSON a CSV online gratis. Exporta datos JSON a CSV compatible con hojas de cálculo con aplanamiento automático. 100% en navegador.",
      seoHeading: "Exporta Datos JSON a CSV",
      seoText: "Pega un array JSON de objetos y el conversor produce un CSV con una fila de cabecera derivada de la uni\u00f3n de todas las claves entre filas, entrecomillando valores que contienen comas, comillas o saltos de l\u00ednea seg\u00fan RFC 4180 para que las hojas de c\u00e1lculo importen limpiamente. Los objetos anidados se aplanan en columnas con puntos (address.city, address.zip) para no perder informaci\u00f3n estructural.\n\n\u00dasalo cuando necesites cargar una respuesta de API en Excel, Google Sheets o una herramienta BI; construir una pivot r\u00e1pida desde un export JSON; entregar datos JSON a un compa\u00f1ero no t\u00e9cnico que solo trabaja con hojas de c\u00e1lculo; o producir un export de texto diffable para datos que viven como JSON. Tambi\u00e9n sirve para exports puntuales antes de una demo y para pipelines de extracci\u00f3n scripteados.\n\nLas formas de wrapper comunes como {\"data\": [...]} y {\"results\": [...]} se auto-detectan y desenvuelven para no tener que editar el input. Un objeto \u00fanico sin array envolvente se convierte en un CSV de una fila. Los arrays de primitivos se vuelven un CSV de una columna, y las filas con juegos de claves distintos se reconcilian a un orden estable de columnas. El resultado se puede copiar al portapapeles o descargar como archivo .csv.\n\nLa conversi\u00f3n entera corre en tu navegador \u2014 nada se sube, nada se trackea.",
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
      seoText: "Paste CSV content or upload a .csv file and the converter sniffs the delimiter (comma, tab, semicolon), reads the header row if present, and emits a JSON array of objects where each column becomes a key and each row becomes an element. Quoted fields, escaped quotes, and values containing the delimiter are parsed according to RFC 4180.\n\nUse this to turn a spreadsheet export into a JSON fixture, load CSV data into a JavaScript REPL, ingest a customer-provided .csv into an API that expects JSON, seed a database from a legacy extract, or normalise data from a SaaS tool that only exports CSV. It is also handy for quick exploration \u2014 inspect the JSON in the viewer once converted.\n\nType inference is opt-in and conservative: \"123\" is converted to a number, \"true\" and \"false\" to booleans, and empty cells become null so downstream consumers can distinguish empty from missing. Cells containing raw JSON like {\"id\": 1} are parsed into nested objects when possible. Headerless CSV is detected and columns are named col1, col2, etc. Malformed rows surface a clear error pointing to the offending line.\n\nThe file is parsed entirely in-browser \u2014 no upload to a remote server, which matters when the CSV contains customer data or PII.",
      seoBlockHeading: "About CSV to JSON conversion",
      seoBlockText: "Transform CSV and spreadsheet data into structured JSON. Automatically detects delimiters (comma, tab, semicolon), infers data types, and handles edge cases like embedded JSON in cells.",
      seoFeatures: ["Auto-detects comma, tab, and semicolon delimiters", "Numbers and booleans converted to proper JSON types", "Headerless CSV detected and handled", "Embedded JSON in cells parsed automatically", "Upload .csv files directly"],
    },
    es: {
      title: "Conversor CSV a JSON Online Gratis",
      description: "Convierte datos CSV a JSON online gratis. Detección automática de cabeceras, inferencia de tipos y previsualización instantánea. Sin subidas.",
      seoHeading: "Convierte Datos CSV de Hojas de C\u00e1lculo a JSON",
      seoText: "Pega contenido CSV o sube un archivo .csv y el conversor detecta el delimitador (coma, tabulaci\u00f3n, punto y coma), lee la fila de cabecera si existe, y emite un array JSON de objetos donde cada columna se vuelve clave y cada fila un elemento. Los campos entrecomillados, comillas escapadas y valores con el delimitador se parsean seg\u00fan RFC 4180.\n\n\u00dasalo para convertir un export de hoja de c\u00e1lculo en un fixture JSON, cargar datos CSV en un REPL JavaScript, ingerir un .csv proporcionado por cliente en una API que espera JSON, sembrar una base de datos desde un extract legacy, o normalizar datos de una herramienta SaaS que solo exporta CSV. Tambi\u00e9n sirve para exploraci\u00f3n r\u00e1pida \u2014 inspecciona el JSON en el visor una vez convertido.\n\nLa inferencia de tipos es opcional y conservadora: \"123\" se convierte en n\u00famero, \"true\" y \"false\" en booleanos, y las celdas vac\u00edas en null para que los consumidores distingan vac\u00edo de ausente. Las celdas con JSON crudo como {\"id\": 1} se parsean a objetos anidados cuando es posible. El CSV sin cabecera se detecta y las columnas se nombran col1, col2, etc. Las filas malformadas generan un error claro apuntando a la l\u00ednea problem\u00e1tica.\n\nEl archivo se parsea completamente en el navegador \u2014 sin subida a servidor remoto, lo que importa cuando el CSV contiene datos de clientes o PII.",
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
      seoText: "Paste JSON and the converter walks the tree and emits TOML v1.0-compliant output, turning nested objects into [section] headers and arrays of objects into [[array-of-table]] blocks. Scalar types are preserved: integers, floats, booleans, and ISO 8601 datetimes all round-trip to their TOML equivalents with the correct syntax.\n\nThis is the tool when you are generating Cargo.toml, pyproject.toml, Netlify config, or any TOML-based configuration from a script that produces JSON; translating a config from one tool's JSON format to another tool's TOML format; or generating a readable config file for a Rust/Python project from an API response. It is also useful when you prefer TOML's section syntax for human review.\n\nTOML is stricter than JSON in a few specific ways, and the converter handles each case so the output is always valid: JSON null (which TOML does not support) is replaced by an empty string with an inline warning pointing to the affected key, arrays with mixed types are normalised to a string array so TOML accepts them, and a root array is wrapped in an [items] table because TOML requires a table at the top level. The result can be downloaded as a .toml file.\n\nEverything runs client-side \u2014 no upload, no server, nothing stored.",
      seoBlockHeading: "About JSON to TOML conversion",
      seoBlockText: "Convert JSON data into TOML configuration format. Handles TOML-specific limitations automatically: null values are replaced, mixed-type arrays are normalized, and root arrays are wrapped.",
      seoFeatures: ["Nested objects mapped to TOML sections", "null values replaced with empty strings (with warnings)", "Mixed-type arrays safely converted to strings", "Root arrays wrapped in an [items] table", "Download result as .toml file"],
    },
    es: {
      title: "Conversor JSON a TOML Online Gratis",
      description: "Convierte JSON a formato TOML online gratis. Salida TOML limpia con secciones, arrays y tablas anidadas. Ideal para archivos de configuración.",
      seoHeading: "Convierte JSON a Configuraci\u00f3n TOML",
      seoText: "Pega JSON y el conversor recorre el \u00e1rbol y emite salida compatible con TOML v1.0, convirtiendo objetos anidados en cabeceras [section] y arrays de objetos en bloques [[array-of-table]]. Los tipos escalares se preservan: enteros, flotantes, booleanos y datetimes ISO 8601 hacen round-trip a sus equivalentes TOML con la sintaxis correcta.\n\nEs la herramienta cuando generas Cargo.toml, pyproject.toml, config de Netlify o cualquier configuraci\u00f3n basada en TOML desde un script que produce JSON; traduces un config del formato JSON de una herramienta al formato TOML de otra; o generas un archivo config legible para un proyecto Rust/Python desde una respuesta de API. Tambi\u00e9n sirve cuando prefieres la sintaxis de secciones de TOML para revisi\u00f3n humana.\n\nTOML es m\u00e1s estricto que JSON en algunos aspectos, y el conversor maneja cada caso para que la salida sea siempre v\u00e1lida: null JSON (que TOML no soporta) se reemplaza por cadena vac\u00eda con un aviso en l\u00ednea apuntando a la clave afectada, los arrays con tipos mixtos se normalizan a array de cadenas para que TOML los acepte, y un array ra\u00edz se envuelve en una tabla [items] porque TOML requiere tabla al nivel superior. El resultado se puede descargar como archivo .toml.\n\nTodo corre en el navegador \u2014 sin subida, sin servidor, sin almacenamiento.",
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
      seoText: "Paste TOML content or upload a .toml file and the parser processes it against the full TOML v1.0 spec \u2014 tables ([section]), arrays of tables ([[items]]), inline tables ({k = v}), multi-line strings, and all scalar types \u2014 then serialises the resulting object tree as valid JSON with proper indentation.\n\nUse this when you need to consume a Cargo.toml, pyproject.toml, or other TOML config from a tool that only speaks JSON; build a programmatic pipeline over a TOML-based config; diff two TOML files in a format that semantic JSON diff tools can read; or quickly inspect the data shape a TOML file produces before writing code to consume it.\n\nTyped values round-trip correctly: integers stay JSON numbers without precision loss for safe ranges, floats keep their fractional form, booleans map directly, and dates and datetimes are serialised as ISO 8601 strings that downstream JavaScript can parse with Date. Dotted keys and nested tables are resolved into proper nested objects rather than flat keys, and syntax errors surface a line-and-column message pointing to the specific problem.\n\nParsing runs locally in the browser \u2014 the TOML document never reaches a server, which matters for configs that contain credentials or hostnames.",
      seoBlockHeading: "About TOML to JSON conversion",
      seoBlockText: "Parse TOML configuration files and convert them to JSON. Supports all TOML features including tables, arrays of tables, inline tables, and typed values.",
      seoFeatures: ["Full TOML v1.0 support", "Tables and arrays of tables mapped to JSON objects", "Typed values preserved (strings, integers, floats, booleans, dates)", "Clear error messages for invalid TOML syntax"],
    },
    es: {
      title: "Conversor TOML a JSON Online Gratis",
      description: "Convierte archivos TOML a JSON online gratis. Soporte completo de TOML v1.0 con tablas, arrays y datetimes. Sin subidas, en tu navegador.",
      seoHeading: "Convierte Configuraci\u00f3n TOML a JSON",
      seoText: "Pega contenido TOML o sube un archivo .toml y el parser lo procesa contra la spec completa de TOML v1.0 \u2014 tablas ([section]), arrays de tablas ([[items]]), tablas en l\u00ednea ({k = v}), cadenas multil\u00ednea y todos los tipos escalares \u2014 luego serializa el \u00e1rbol de objetos resultante como JSON v\u00e1lido con sangr\u00eda correcta.\n\n\u00dasalo cuando necesites consumir un Cargo.toml, pyproject.toml u otro config TOML desde una herramienta que solo habla JSON; construir un pipeline program\u00e1tico sobre un config basado en TOML; comparar dos archivos TOML en un formato que las herramientas de diff sem\u00e1ntico JSON puedan leer; o inspeccionar r\u00e1pidamente la forma de los datos que produce un TOML antes de escribir c\u00f3digo para consumirlo.\n\nLos valores tipados hacen round-trip correctamente: los enteros siguen siendo n\u00fameros JSON sin p\u00e9rdida de precisi\u00f3n en rangos seguros, los flotantes mantienen su forma fraccionaria, los booleanos mapean directamente, y las fechas y datetimes se serializan como cadenas ISO 8601 que JavaScript puede parsear con Date. Las claves con puntos y tablas anidadas se resuelven en objetos anidados propios en vez de claves planas, y los errores de sintaxis generan un mensaje con l\u00ednea y columna apuntando al problema espec\u00edfico.\n\nEl parseo corre localmente en el navegador \u2014 el documento TOML nunca llega a un servidor, lo que importa para configs que contienen credenciales u hostnames.",
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
      seoText: "Enter a regex pattern, a flags string, and a test input and the tester compiles the pattern with the native JavaScript RegExp engine, then highlights every match in the input along with each numbered and named capture group. Matching re-runs on every keystroke so you can iterate the pattern until it does exactly what you need.\n\nReach for this when building a validator for email, URL, SKU, or ID formats; writing a search-and-replace expression before running it across a codebase; debugging a regex that matches too much or too little; extracting fields from log lines or freeform strings; or learning and teaching regex syntax against concrete examples. The output tells you exactly what matched where, which is usually the missing piece when a pattern misbehaves.\n\nAll five primary JavaScript flags are supported: g for global, i for case-insensitive, m to make ^ and $ match line boundaries, s (dotAll) to let . match newlines, and u for full Unicode matching. Each match reports its start and end index in the input, plus the values of every capture group \u2014 both positional and named (?<name>...) \u2014 so you can see the full structure without having to instrument code. Invalid patterns surface the same SyntaxError you would get at runtime, including the position of the offending character.\n\nThe pattern and the test input stay in your browser \u2014 no server-side execution, no request log.",
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
      seoText: "Introduce un patr\u00f3n regex, una cadena de flags y un input de prueba y el tester compila el patr\u00f3n con el motor RegExp nativo de JavaScript, luego resalta cada coincidencia en el input junto con cada grupo de captura numerado y nombrado. El matching se re-ejecuta en cada pulsaci\u00f3n para iterar el patr\u00f3n hasta que haga exactamente lo que necesitas.\n\n\u00dasalo cuando construyas un validador para formatos de email, URL, SKU o ID; escribas una expresi\u00f3n de buscar-y-reemplazar antes de ejecutarla sobre un codebase; depures un regex que hace match de m\u00e1s o de menos; extraigas campos de l\u00edneas de log o cadenas libres; o aprendas y ense\u00f1es sintaxis regex contra ejemplos concretos. La salida te dice exactamente qu\u00e9 hizo match y d\u00f3nde, que suele ser la pieza que falta cuando un patr\u00f3n se porta mal.\n\nLos cinco flags principales de JavaScript est\u00e1n soportados: g para global, i para insensible a may\u00fasculas, m para que ^ y $ hagan match en l\u00edmites de l\u00ednea, s (dotAll) para que . haga match con saltos de l\u00ednea, y u para matching Unicode completo. Cada coincidencia reporta su \u00edndice de inicio y fin en el input, m\u00e1s los valores de cada grupo de captura \u2014 posicional y nombrado (?<name>...) \u2014 para que veas la estructura completa sin instrumentar c\u00f3digo. Los patrones inv\u00e1lidos generan el mismo SyntaxError que ver\u00edas en runtime, incluyendo la posici\u00f3n del car\u00e1cter problem\u00e1tico.\n\nEl patr\u00f3n y el input de prueba se quedan en tu navegador \u2014 sin ejecuci\u00f3n en servidor, sin log de peticiones.",
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
      seoText: "Enter any text in the input and the tool encodes it to Base64 in real time, or paste a Base64 string and toggle to decode mode to recover the original bytes. UTF-8 is fully handled, so multi-byte characters (emoji, accented letters, CJK) round-trip correctly through the Web API TextEncoder/TextDecoder bridge \u2014 not the naive btoa/atob that corrupts anything above code point 255.\n\nThis is the tool for decoding the payload or signature half of a JWT to inspect its claims, preparing a small inline image as a data URL, reading a Base64-encoded secret from a Kubernetes manifest, decoding an HTTP Basic auth header, generating the body of a data:image/png;base64,... URL, or producing Base64 strings for email attachment experiments and API test fixtures.\n\nURL-safe Base64 is supported for values that travel in query strings or path segments: the variant uses - and _ in place of + and /, and padding = can be omitted. A one-click swap flips the direction so you can chain encode-then-decode to validate a round-trip, and the result can be copied to the clipboard without reformatting. Large inputs stream through incrementally so multi-megabyte text does not stall the UI.\n\nAll encoding and decoding runs client-side through browser APIs \u2014 your input never leaves the tab.",
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
      seoText: "Introduce cualquier texto en el input y la herramienta lo codifica a Base64 en tiempo real, o pega una cadena Base64 y alterna a modo decodificar para recuperar los bytes originales. UTF-8 se maneja completamente, as\u00ed que los caracteres multi-byte (emoji, letras acentuadas, CJK) hacen round-trip correctamente v\u00eda el puente Web API TextEncoder/TextDecoder \u2014 no el ingenuo btoa/atob que corrompe cualquier cosa por encima del code point 255.\n\nEs la herramienta para decodificar el payload o la firma de un JWT e inspeccionar sus claims, preparar una imagen peque\u00f1a inline como data URL, leer un secret codificado en Base64 desde un manifest de Kubernetes, decodificar una cabecera HTTP Basic auth, generar el cuerpo de una URL data:image/png;base64,..., o producir cadenas Base64 para experimentos con adjuntos de email y fixtures de tests de API.\n\nLa variante URL-safe de Base64 est\u00e1 soportada para valores que viajan en query strings o segmentos de ruta: usa - y _ en lugar de + y /, y el padding = puede omitirse. Un intercambio con un clic invierte la direcci\u00f3n para encadenar codificar-luego-decodificar y validar un round-trip, y el resultado se puede copiar al portapapeles sin reformatear. Los inputs grandes se procesan incrementalmente para que texto de varios megabytes no atasque la UI.\n\nToda la codificaci\u00f3n y decodificaci\u00f3n corre en el navegador v\u00eda APIs nativas \u2014 tu input nunca sale de la pesta\u00f1a.",
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
      seoText: "Paste a string and the tool percent-encodes any character outside the unreserved ASCII set so the result is safe to drop into a URL, a query string, a form body, or a header value. Paste a percent-encoded string and toggle to decode mode to recover the original text, with UTF-8 bytes decoded back to the correct multi-byte characters.\n\nTwo modes cover the two real-world needs: Component mode uses encodeURIComponent, escaping reserved characters like :, /, ?, #, &, and = \u2014 use this when building a single query-string value, a path segment, or any fragment that should survive intact inside a larger URL. Full URI mode uses encodeURI, which preserves URL structural characters \u2014 use this when you have a full URL that needs only its special characters (spaces, accented letters) escaped.\n\nThis is the tool for debugging a URL that 404s because of mis-encoded characters, preparing a redirect target that itself contains a URL, cleaning up a pasted URL with %20 and %2F so you can read it, building a share link for content with non-ASCII characters, or round-tripping a query string parameter through a log-paste-and-read loop. A swap button flips direction instantly and the output can be copied with a single click.\n\nEncoding and decoding run purely in the browser \u2014 no upload and no server request.",
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
      seoText: "Pega una cadena y la herramienta codifica con porcentaje cualquier car\u00e1cter fuera del conjunto ASCII no reservado para que el resultado sea seguro al meterlo en una URL, query string, cuerpo de formulario o valor de cabecera. Pega una cadena codificada y alterna a modo decodificar para recuperar el texto original, con los bytes UTF-8 decodificados de vuelta a los caracteres multi-byte correctos.\n\nDos modos cubren las dos necesidades reales: el modo Component usa encodeURIComponent, escapando caracteres reservados como :, /, ?, #, & y = \u2014 \u00fasalo al construir un valor de query string, un segmento de ruta o cualquier fragmento que deba sobrevivir intacto dentro de una URL mayor. El modo Full URI usa encodeURI, que preserva los caracteres estructurales de URL \u2014 \u00fasalo cuando tengas una URL completa y solo necesites escapar sus caracteres especiales (espacios, letras acentuadas).\n\nEs la herramienta para depurar una URL que da 404 por caracteres mal codificados, preparar un target de redirect que contiene otra URL, limpiar una URL pegada con %20 y %2F para leerla, construir un enlace de compartir para contenido con caracteres no-ASCII, o hacer round-trip de un par\u00e1metro de query string por un ciclo log-pegar-leer. Un bot\u00f3n de intercambio invierte la direcci\u00f3n al instante y la salida se copia con un solo clic.\n\nLa codificaci\u00f3n y decodificaci\u00f3n corren puramente en el navegador \u2014 sin subida y sin petici\u00f3n al servidor.",
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
      seoText: "Paste any text and the tool computes its MD5, SHA-1, SHA-256, SHA-384, and SHA-512 digests simultaneously in real time, displaying each as a lowercase hexadecimal string. SHA-family digests are computed via the browser's native Web Crypto API (SubtleCrypto.digest), which is fast and audited; MD5 uses a well-tested pure-JavaScript implementation because Web Crypto intentionally omits it.\n\nUse this when verifying a downloaded file's checksum against a published reference, generating deterministic cache keys or ETags from content, producing a fingerprint for deduplication, implementing a content-addressable lookup, checking that two arbitrary strings are identical without transmitting them, or demonstrating hash properties (avalanche effect, fixed output length) in teaching material. For password storage do not use raw SHA \u2014 use a slow KDF like Argon2 or bcrypt.\n\nInput is treated as UTF-8, so non-ASCII characters (emoji, accents, CJK) hash to the same digest you would get from any UTF-8 aware library in Python, Go, or Node. Each hash output can be copied independently with a single click, and the displayed hex matches the format produced by common CLI tools like sha256sum and md5sum byte-for-byte.\n\nAll computation is local \u2014 the input text is never sent to a server, which matters when hashing anything confidential.",
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
      seoText: "Pega cualquier texto y la herramienta calcula sus resumenes MD5, SHA-1, SHA-256, SHA-384 y SHA-512 simult\u00e1neamente en tiempo real, mostrando cada uno como cadena hexadecimal en min\u00fasculas. Los digests de la familia SHA se calculan v\u00eda la Web Crypto API nativa del navegador (SubtleCrypto.digest), que es r\u00e1pida y auditada; MD5 usa una implementaci\u00f3n pura en JavaScript bien probada porque Web Crypto lo omite a prop\u00f3sito.\n\n\u00dasalo al verificar el checksum de un archivo descargado contra una referencia publicada, generar claves de cach\u00e9 o ETags deterministas desde contenido, producir una huella para deduplicaci\u00f3n, implementar un lookup direccionable por contenido, comprobar que dos cadenas arbitrarias son id\u00e9nticas sin transmitirlas, o demostrar propiedades de hash (efecto avalancha, salida de longitud fija) en material docente. Para guardar contrase\u00f1as no uses SHA crudo \u2014 usa un KDF lento como Argon2 o bcrypt.\n\nEl input se trata como UTF-8, as\u00ed que los caracteres no-ASCII (emoji, acentos, CJK) hashean al mismo digest que obtendr\u00edas de cualquier librer\u00eda UTF-8-aware en Python, Go o Node. Cada salida de hash se puede copiar independientemente con un clic, y el hex mostrado coincide byte a byte con el formato producido por herramientas CLI comunes como sha256sum y md5sum.\n\nTodo el c\u00e1lculo es local \u2014 el texto de entrada nunca se env\u00eda a un servidor, lo que importa al hashear algo confidencial.",
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
      seoText: "Click generate and the tool produces one or up to one thousand RFC 4122 version 4 UUIDs in a batch, each 128 bits of cryptographic randomness rendered as a hyphenated lowercase hex string (8-4-4-4-12). The browser's native crypto.randomUUID() is the source of entropy, so the output is indistinguishable from random and safe to use as an identifier where uniqueness matters.\n\nUse this to seed a database with unique primary keys, mint request or trace IDs for debugging, produce correlation tokens for distributed tracing, generate unique asset names for an upload pipeline, create stable IDs for a spreadsheet or CSV export, or populate a fixture with a fresh batch of random IDs for test runs. For monotonic time-ordered IDs inside a database, UUID v7 or ULID is usually preferable \u2014 v4 is the right default when order does not matter.\n\nOptions control the surface of the output: toggle uppercase for the A-F hex digits, strip the dashes to get a 32-character compact form, and choose the batch size from 1 up to 1000 for bulk seeding. Each UUID has a one-click copy, and a copy-all button puts the entire batch on the clipboard as newline-separated values ready to paste into a shell, a file, or a SQL INSERT.\n\nGeneration runs entirely in your browser \u2014 no server is involved, so you can trust the values are only ever known to you.",
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
      seoText: "Pulsa generar y la herramienta produce uno o hasta mil UUIDs versi\u00f3n 4 seg\u00fan RFC 4122 en un lote, cada uno 128 bits de aleatoriedad criptogr\u00e1fica renderizados como cadena hex en min\u00fasculas con guiones (8-4-4-4-12). El crypto.randomUUID() nativo del navegador es la fuente de entrop\u00eda, as\u00ed que la salida es indistinguible de aleatoria y segura para usar como identificador donde la unicidad importa.\n\n\u00dasalo para sembrar una base de datos con claves primarias \u00fanicas, acu\u00f1ar IDs de petici\u00f3n o de traza para depuraci\u00f3n, producir tokens de correlaci\u00f3n para tracing distribuido, generar nombres \u00fanicos de assets para un pipeline de subida, crear IDs estables para un export de hoja de c\u00e1lculo o CSV, o poblar un fixture con un lote nuevo de IDs aleatorios para runs de test. Para IDs mon\u00f3tonos ordenados por tiempo dentro de una base de datos, UUID v7 o ULID suele ser preferible \u2014 v4 es el default correcto cuando el orden no importa.\n\nLas opciones controlan la forma de la salida: alterna may\u00fasculas para los d\u00edgitos hex A-F, elimina los guiones para obtener la forma compacta de 32 caracteres, y elige el tama\u00f1o del lote de 1 a 1000 para siembra masiva. Cada UUID tiene copia con un clic, y un bot\u00f3n de copiar todo pone el lote entero en el portapapeles como valores separados por saltos de l\u00ednea listos para pegar en una shell, un archivo o un INSERT SQL.\n\nLa generaci\u00f3n corre totalmente en tu navegador \u2014 no hay servidor involucrado, as\u00ed que puedes confiar en que los valores solo los conoces t\u00fa.",
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
      seoText: "Paste a Unix timestamp and the tool renders it simultaneously as a UTC string, your local time, an ISO 8601 instant, and a relative expression like \"3 hours ago\". Paste a date string or pick a date and the conversion runs the other way, producing the epoch value in both seconds and milliseconds. A live clock ticks the current timestamp in both units so you always have a reference value.\n\nThis is the tool for decoding the created_at field from an API response, reading a log line where the timestamp is numeric, scheduling something against a fixed epoch value, debugging a timezone mismatch where client and server disagree, or building a test fixture that requires a precise instant in both formats. It also helps explain to a teammate exactly which instant a numeric timestamp refers to.\n\nBoth second-precision and millisecond-precision inputs are detected automatically by magnitude \u2014 values above roughly 10^12 are treated as milliseconds and anything smaller as seconds. Negative timestamps (before 1970) and future timestamps are accepted. All formats are copyable in one click, and the ISO 8601 output is the safe choice when the destination system might be in a different timezone.\n\nConversion is pure JavaScript Date math running in your browser \u2014 no API, no tracking, no network.",
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
      seoText: "Pega un timestamp Unix y la herramienta lo renderiza simult\u00e1neamente como cadena UTC, tu hora local, un instante ISO 8601 y una expresi\u00f3n relativa como \"hace 3 horas\". Pega una fecha o elige una y la conversi\u00f3n corre en la otra direcci\u00f3n, produciendo el valor de epoch en segundos y milisegundos. Un reloj en vivo marca el timestamp actual en ambas unidades para tener siempre un valor de referencia.\n\nEs la herramienta para decodificar el campo created_at de una respuesta de API, leer una l\u00ednea de log donde el timestamp es num\u00e9rico, programar algo contra un valor de epoch fijo, depurar un mismatch de timezone donde cliente y servidor no coinciden, o construir un fixture de test que requiere un instante preciso en ambos formatos. Tambi\u00e9n ayuda a explicar a un compa\u00f1ero exactamente a qu\u00e9 instante se refiere un timestamp num\u00e9rico.\n\nLos inputs con precisi\u00f3n de segundos y milisegundos se detectan autom\u00e1ticamente por magnitud \u2014 valores por encima de ~10^12 se tratan como milisegundos y cualquier cosa menor como segundos. Se aceptan timestamps negativos (anteriores a 1970) y futuros. Todos los formatos son copiables con un clic, y la salida ISO 8601 es la opci\u00f3n segura cuando el sistema destino puede estar en otra zona horaria.\n\nLa conversi\u00f3n es matem\u00e1tica pura de Date JavaScript corriendo en tu navegador \u2014 sin API, sin tracking, sin red.",
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
      seoText: "Pick values field-by-field (minute, hour, day-of-month, month, day-of-week) or type a cron expression directly and the tool parses it, validates it, describes it in plain English, and previews the next five times the expression will fire starting from now. Edits propagate in real time between the visual builder and the text field so you can switch between the two freely.\n\nThis is the tool for authoring a Unix crontab line, a Kubernetes CronJob schedule, a GitHub Actions schedule trigger, an AWS EventBridge or Azure Scheduler rule, or a Supabase/Vercel cron definition \u2014 all of which share the classic five-field cron syntax. It is also good for debugging a schedule that runs more or less often than expected by showing the actual next-fire timestamps.\n\nThe full range of cron operators is supported: star for every value, comma lists (1,15,30), ranges (1-5), step values (*/5 or 0-30/10), and named values for months (JAN-DEC) and days of week (SUN-SAT). Twelve quick presets cover the common schedules (every minute, every 5/10/15/30 minutes, hourly, every N hours, daily at midnight, weekly, monthly, yearly) so you rarely need to write an expression from scratch.\n\nParsing and next-run calculation happen in your browser \u2014 no backend, so your schedule is never logged anywhere.",
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
      seoText: "Elige valores campo por campo (minuto, hora, d\u00eda-del-mes, mes, d\u00eda-de-semana) o escribe una expresi\u00f3n cron directamente y la herramienta la parsea, la valida, la describe en lenguaje natural y previsualiza las pr\u00f3ximas cinco veces que disparar\u00e1 empezando desde ahora. Las ediciones se propagan en tiempo real entre el constructor visual y el campo de texto para alternar libremente.\n\nEs la herramienta para escribir una l\u00ednea de crontab Unix, un schedule de CronJob de Kubernetes, un trigger de schedule de GitHub Actions, una regla de AWS EventBridge o Azure Scheduler, o una definici\u00f3n de cron de Supabase/Vercel \u2014 todos comparten la sintaxis cl\u00e1sica de cinco campos. Tambi\u00e9n sirve para depurar un schedule que corre m\u00e1s o menos de lo esperado mostrando los timestamps reales de las pr\u00f3ximas ejecuciones.\n\nSe soporta el rango completo de operadores cron: asterisco para cada valor, listas por comas (1,15,30), rangos (1-5), valores con paso (*/5 o 0-30/10) y valores nombrados para meses (JAN-DEC) y d\u00edas de semana (SUN-SAT). Doce presets r\u00e1pidos cubren los schedules comunes (cada minuto, cada 5/10/15/30 minutos, por hora, cada N horas, diario a medianoche, semanal, mensual, anual) para rara vez tener que escribir una expresi\u00f3n desde cero.\n\nEl parseo y el c\u00e1lculo de pr\u00f3xima ejecuci\u00f3n ocurren en tu navegador \u2014 sin backend, as\u00ed que tu schedule nunca se loguea en ning\u00fan sitio.",
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
      seoText: "Paste a JSON sample and the generator walks the tree and emits a set of TypeScript interface declarations that describe it: the root becomes a named interface, every nested object becomes its own named interface, arrays become T[], and primitives become their TypeScript equivalents (string, number, boolean, null). The output is ready to paste into a .ts file with no further editing.\n\nUse this to type the response of a new API you are integrating, seed interfaces for a form payload, produce types for a configuration file read at runtime, bootstrap models from a sample record in a mocked fixture, or generate the TypeScript side of a code-generation pipeline where you want to avoid writing interfaces by hand. It is also a fast sanity check when you suspect a backend endpoint is returning a different shape than the types claim.\n\nThe generator handles the common shape quirks: arrays of objects with differing keys produce a union type that covers the observed variants, arrays with null entries produce (T | null)[], keys missing from some objects become optional (key?: T), and empty arrays default to unknown[] so you tighten them manually. The full result can be copied or downloaded as a .ts file and regenerates live as you edit the input.\n\nThe JSON and the generated TypeScript stay in your browser \u2014 nothing is uploaded.",
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
      seoText: "Pega una muestra JSON y el generador recorre el \u00e1rbol y emite un conjunto de declaraciones de interface TypeScript que la describen: la ra\u00edz se vuelve una interface nombrada, cada objeto anidado se vuelve su propia interface nombrada, los arrays se vuelven T[] y los primitivos se vuelven sus equivalentes TypeScript (string, number, boolean, null). La salida est\u00e1 lista para pegar en un archivo .ts sin m\u00e1s edici\u00f3n.\n\n\u00dasalo para tipar la respuesta de una API nueva que integras, sembrar interfaces para un payload de formulario, producir tipos para un archivo de configuraci\u00f3n le\u00eddo en runtime, arrancar modelos desde un registro de muestra en un fixture mockeado, o generar el lado TypeScript de un pipeline de code-generation donde quieres evitar escribir interfaces a mano. Tambi\u00e9n es una comprobaci\u00f3n r\u00e1pida cuando sospechas que un endpoint devuelve una forma distinta a la que los tipos afirman.\n\nEl generador maneja los casos comunes: arrays de objetos con claves distintas producen un tipo uni\u00f3n que cubre las variantes observadas, arrays con entradas null producen (T | null)[], las claves ausentes en algunos objetos se vuelven opcionales (key?: T), y los arrays vac\u00edos caen a unknown[] para que los afines a mano. El resultado completo se puede copiar o descargar como archivo .ts y se regenera en vivo mientras editas el input.\n\nEl JSON y el TypeScript generado se quedan en tu navegador \u2014 nada se sube.",
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
      seoText: "Paste XML, drop a file, or upload a .xml document and the formatter parses it as a DOM, validates that every tag is well-formed, and re-emits it with consistent indentation using either 2-space or 4-space whitespace. A minify mode strips every non-essential whitespace character so the document collapses to a single line \u2014 useful for embedding XML as a payload inside another format or minimising transfer size.\n\nThis is the tool for making a SOAP response readable, inspecting a configuration file (pom.xml, web.xml, .csproj), debugging an RSS or Atom feed, cleaning up a sitemap or SVG before committing, reading an Android layout file pasted from a bug report, or preparing an XML fixture for a test suite that expects diffable text. It is also useful for reviewing differences between two XML documents once both are consistently formatted.\n\nWell-formedness is enforced: mismatched tags, unclosed elements, and invalid character entities each surface a specific error message pointing to the line where the parse broke. Attribute quoting is normalised to double quotes, CDATA sections and processing instructions are preserved, and XML comments pass through untouched. Once formatted, the result can be copied or downloaded as a .xml file.\n\nParsing runs via the browser's native DOMParser \u2014 no upload, no server, no tracking.",
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
      seoText: "Pega XML, arrastra un archivo o sube un documento .xml y el formateador lo parsea como DOM, valida que cada tag est\u00e9 bien formada y lo reescribe con sangr\u00eda consistente usando espacios de 2 o 4. Un modo minify elimina cada car\u00e1cter de espacio en blanco no esencial para que el documento colapse a una sola l\u00ednea \u2014 \u00fatil para embeber XML como payload dentro de otro formato o minimizar tama\u00f1o de transferencia.\n\nEs la herramienta para hacer legible una respuesta SOAP, inspeccionar un archivo de configuraci\u00f3n (pom.xml, web.xml, .csproj), depurar un feed RSS o Atom, limpiar un sitemap o SVG antes de commitear, leer un layout Android pegado desde un bug report, o preparar un fixture XML para una suite de tests que espera texto diffable. Tambi\u00e9n sirve para revisar diferencias entre dos documentos XML una vez ambos est\u00e1n formateados consistentemente.\n\nLa buena formaci\u00f3n se exige: tags mal cerradas, elementos sin cerrar y entidades de car\u00e1cter inv\u00e1lidas generan cada una un mensaje de error espec\u00edfico apuntando a la l\u00ednea donde se rompi\u00f3 el parseo. El quoting de atributos se normaliza a comillas dobles, las secciones CDATA e instrucciones de procesamiento se preservan, y los comentarios XML pasan sin tocarse. Una vez formateado, el resultado se puede copiar o descargar como archivo .xml.\n\nEl parseo corre v\u00eda el DOMParser nativo del navegador \u2014 sin subida, sin servidor, sin tracking.",
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
      seoText: "Paste a JSON array of objects and the converter produces a semantic HTML table with a thead containing the union of all keys as column headers and a tbody where each array element becomes a row. A live preview renders the table in the browser alongside the HTML source, so you can see exactly what consumers will see and verify formatting before copying or downloading.\n\nThis is the tool for generating a table to drop into documentation, a status page, a README, a report email body, or a static site; for building a quick HTML view of an API response during debugging; or for producing an exportable HTML view of a CSV or spreadsheet once it has been converted to JSON. It is also useful for demos where you need to show tabular data in a browser without wiring up a framework.\n\nOutput is produced with proper HTML escaping, so characters like <, >, &, and quotes in values cannot break layout or introduce XSS vectors in whichever page you paste the result into. Nested objects inside cells are serialised as inline JSON so no data is lost, missing keys render as empty cells, and the resulting markup includes minimal inline styles that survive copy-paste into most rich-text editors and static site generators.\n\nThe conversion is entirely client-side \u2014 no upload, no server processing, and no tracking of what you paste.",
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
      seoText: "Pega un array JSON de objetos y el conversor produce una tabla HTML sem\u00e1ntica con un thead que contiene la uni\u00f3n de todas las claves como cabeceras de columna y un tbody donde cada elemento del array se vuelve una fila. Una vista previa en vivo renderiza la tabla en el navegador junto al c\u00f3digo HTML para ver exactamente lo que ver\u00e1n los consumidores y verificar el formato antes de copiar o descargar.\n\nEs la herramienta para generar una tabla que meter en documentaci\u00f3n, una p\u00e1gina de estado, un README, el cuerpo de un email de informe o un sitio est\u00e1tico; para construir una vista HTML r\u00e1pida de una respuesta de API durante depuraci\u00f3n; o para producir una vista HTML exportable de un CSV o hoja de c\u00e1lculo una vez convertido a JSON. Tambi\u00e9n sirve para demos donde necesitas mostrar datos tabulares en navegador sin cablear un framework.\n\nLa salida se produce con escape HTML correcto, as\u00ed que caracteres como <, >, & y comillas en los valores no pueden romper el layout ni introducir vectores XSS en la p\u00e1gina donde pegues el resultado. Los objetos anidados dentro de celdas se serializan como JSON en l\u00ednea para no perder datos, las claves faltantes se renderizan como celdas vac\u00edas, y el markup resultante incluye estilos inline m\u00ednimos que sobreviven al copiar-pegar en la mayor\u00eda de editores rich-text y generadores de sitios est\u00e1ticos.\n\nLa conversi\u00f3n es enteramente en el navegador \u2014 sin subida, sin procesamiento en servidor y sin tracking de lo que pegas.",
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
      seoText: "Paste YAML or upload a .yaml/.yml file and the validator parses the document with a full YAML 1.2 parser, reporting either success with the parsed value rendered as JSON, or the exact line and column of the first syntax error along with a description of what the parser expected. Validation re-runs on every keystroke so you can fix errors incrementally.\n\nYAML's indentation-driven structure makes subtle mistakes easy and hard to spot: a space in the wrong column, a tab mixed with spaces, an unquoted string that starts with a yes/no/on/off keyword, a block that silently becomes a flow, a duplicate key. This tool catches each of these with a specific error message, which saves the round-trip of pushing to CI only to find out a Kubernetes manifest, Docker Compose file, GitHub Actions workflow, CircleCI config, Ansible playbook, or OpenAPI spec is malformed.\n\nMulti-document YAML separated by --- delimiters is fully supported: each document is validated independently and the parsed result becomes an array of document values. A JSON preview of the parsed structure appears below the editor so you can confirm not just that the syntax is valid but that it parsed to the data you expected \u2014 catching semantic bugs (wrong types, unintended null, key ambiguity) that pure syntax validation would miss.\n\nEverything runs locally \u2014 your YAML, which often contains environment names, hostnames, or image tags, never reaches a server.",
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
      seoText: "Pega YAML o sube un archivo .yaml/.yml y el validador parsea el documento con un parser YAML 1.2 completo, reportando o bien \u00e9xito con el valor parseado renderizado como JSON, o la l\u00ednea y columna exactas del primer error de sintaxis junto con una descripci\u00f3n de lo que el parser esperaba. La validaci\u00f3n se re-ejecuta en cada pulsaci\u00f3n para arreglar errores incrementalmente.\n\nLa estructura basada en sangr\u00eda de YAML hace que los errores sutiles sean f\u00e1ciles y dif\u00edciles de ver: un espacio en la columna equivocada, un tab mezclado con espacios, una cadena sin comillas que empieza con una palabra yes/no/on/off, un bloque que se convierte silenciosamente en flow, una clave duplicada. Esta herramienta captura cada uno con un mensaje de error espec\u00edfico, que ahorra el round-trip de empujar a CI solo para descubrir que un manifest de Kubernetes, archivo Docker Compose, workflow de GitHub Actions, config de CircleCI, playbook Ansible o spec OpenAPI est\u00e1 malformado.\n\nEl YAML multi-documento separado por delimitadores --- est\u00e1 totalmente soportado: cada documento se valida independientemente y el resultado parseado se vuelve un array de valores de documento. Una vista previa JSON de la estructura parseada aparece bajo el editor para confirmar no solo que la sintaxis es v\u00e1lida sino que parse\u00f3 a los datos esperados \u2014 capturando bugs sem\u00e1nticos (tipos equivocados, null no intencionado, ambig\u00fcedad de claves) que la validaci\u00f3n pura de sintaxis pasar\u00eda por alto.\n\nTodo corre localmente \u2014 tu YAML, que a menudo contiene nombres de entornos, hostnames o tags de imagen, nunca llega a un servidor.",
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
      seoText: "Paste a JSON document in one pane and a JSON Schema in the other, and the validator \u2014 powered by Ajv, the de-facto fastest JSON Schema engine \u2014 compiles the schema, runs the document against it, and produces the full list of validation errors in a single pass. Each error names the exact JSON Pointer path that failed and the specific keyword (type, required, enum, pattern, minLength) that rejected the value.\n\nUse this to validate an API request or response against its documented contract, verify a configuration file matches a published schema (OpenAPI component, package.json, tsconfig.json, a custom internal schema), check that a test fixture is still valid after a schema update, sanity-check data incoming from a third party, or explore a schema interactively by iterating on the data until validation passes.\n\nFull JSON Schema Draft-07 is supported including $ref, allOf/anyOf/oneOf/not, conditional if/then/else, pattern and format checks, and nested object constraints. All errors surface at once rather than stopping at the first failure, which saves round-trips when the data has several independent issues, and a sample schema with common patterns is available as a starting point when you are learning the specification.\n\nBoth the schema and the document stay in your browser \u2014 Ajv runs locally, which matters when either input contains proprietary structure or real customer data.",
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
      seoText: "Pega un documento JSON en un panel y un JSON Schema en el otro, y el validador \u2014 potenciado por Ajv, el motor de JSON Schema de facto m\u00e1s r\u00e1pido \u2014 compila el schema, ejecuta el documento contra \u00e9l y produce la lista completa de errores de validaci\u00f3n en una sola pasada. Cada error nombra la ruta JSON Pointer exacta que fall\u00f3 y la palabra clave espec\u00edfica (type, required, enum, pattern, minLength) que rechaz\u00f3 el valor.\n\n\u00dasalo para validar una petici\u00f3n o respuesta de API contra su contrato documentado, verificar que un archivo de configuraci\u00f3n cumple un schema publicado (componente OpenAPI, package.json, tsconfig.json, un schema interno propio), comprobar que un fixture de test sigue siendo v\u00e1lido tras una actualizaci\u00f3n de schema, hacer sanity-check de datos entrantes de terceros, o explorar un schema interactivamente iterando sobre los datos hasta que la validaci\u00f3n pase.\n\nSe soporta JSON Schema Draft-07 completo incluyendo $ref, allOf/anyOf/oneOf/not, if/then/else condicional, chequeos de pattern y format, y restricciones sobre objetos anidados. Todos los errores afloran a la vez en vez de parar en el primer fallo, lo que ahorra round-trips cuando los datos tienen varios problemas independientes, y un schema de ejemplo con patrones comunes est\u00e1 disponible como punto de partida al aprender la especificaci\u00f3n.\n\nTanto el schema como el documento se quedan en tu navegador \u2014 Ajv corre localmente, lo que importa cuando cualquiera de los inputs contiene estructura propietaria o datos reales de clientes.",
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
