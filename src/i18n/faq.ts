import type { Lang } from "./index";

/**
 * FAQ content for the top 5 JSONCraft tools.
 * Consumed by Layout.astro to emit FAQPage JSON-LD for rich results.
 */

export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQContent {
  faqs: FAQ[];
}

type FAQByLang = Record<Lang, FAQContent>;

export const faqs: Record<string, FAQByLang> = {
  formatter: {
    en: {
      faqs: [
        {
          question: "How do I format and validate JSON?",
          answer: "Paste your JSON into the editor and the formatter parses it, highlights syntax errors with line numbers, and pretty-prints with configurable indent (2 or 4 spaces, or tabs). It also exposes a minify mode that strips whitespace for compact API payloads, and a 'sort keys' option useful for diffs. Parse errors are reported with the exact character position so you can spot a stray comma or unbalanced bracket immediately.",
        },
        {
          question: "Is the JSON formatter free?",
          answer: "Yes, completely free. No signup, no size limit beyond what your browser can handle (tens of MB is fine on a modern laptop), no watermarks on copied output. JSONCraft is fully open for every tool — formatter, diff, viewer, converters — with no premium tier. It is meant to be the quickest path from messy JSON to clean JSON.",
        },
        {
          question: "Does the formatter upload my JSON?",
          answer: "No. Every byte of your JSON is parsed and formatted locally in your browser using a client-side JavaScript parser. Nothing is uploaded, nothing is stored, no logs on the server side — there isn't even a server-side component for the formatter. This matters because JSON payloads often contain API keys, tokens or PII, and it would be unsafe to paste them into a tool that sends them away.",
        },
        {
          question: "Can it beautify minified JSON with thousands of lines?",
          answer: "Yes. The formatter uses CodeMirror 6 which handles multi-megabyte documents smoothly with syntax highlighting, line wrapping and code folding. Collapsible brackets let you navigate deeply nested structures, and search works across the full document. For very large files (50MB+) you may want to trim first, but typical API responses and config dumps format instantly.",
        },
        {
          question: "What's the difference between format, minify and lint?",
          answer: "Format (or beautify) re-indents the JSON with readable whitespace so humans can read it. Minify removes all whitespace to produce the smallest possible valid JSON for network transport. Lint validates without changing structure — it simply tells you if the JSON is syntactically correct and flags issues. The formatter does all three modes from a single pasted input.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo formateo y valido JSON?",
          answer: "Pega tu JSON en el editor y el formateador lo parsea, resalta errores de sintaxis con número de línea y lo embellece con indentación configurable (2 o 4 espacios, o tabulación). También ofrece un modo minify que quita espacios para payloads compactos, y una opción de ordenar claves útil para diffs. Los errores se reportan con la posición exacta del carácter para que detectes al instante una coma de más o una llave sin cerrar.",
        },
        {
          question: "¿El formateador JSON es gratis?",
          answer: "Sí, completamente gratis. Sin registro, sin límite de tamaño más allá de lo que aguante tu navegador (decenas de MB van bien en un portátil moderno), sin marcas de agua. JSONCraft está totalmente abierto para todas las herramientas — formateador, diff, viewer, convertidores — sin plan premium. Es la vía más rápida de JSON desordenado a JSON limpio.",
        },
        {
          question: "¿El formateador sube mi JSON?",
          answer: "No. Cada byte de tu JSON se parsea y formatea localmente en tu navegador con un parser JavaScript cliente. Nada se sube, nada se guarda, ni siquiera hay componente de servidor para el formateador. Esto importa porque los payloads JSON suelen contener claves API, tokens o PII, y sería peligroso pegarlos en una herramienta que los enviara fuera.",
        },
        {
          question: "¿Embellece JSON minificado de miles de líneas?",
          answer: "Sí. El formateador usa CodeMirror 6, que gestiona documentos de varios megabytes con resaltado de sintaxis, ajuste de línea y plegado de código. Los corchetes plegables permiten navegar estructuras muy anidadas, y la búsqueda funciona sobre todo el documento. Para archivos muy grandes (50MB+) puede convenir recortar primero, pero las respuestas API y dumps de configuración típicos se formatean al instante.",
        },
        {
          question: "¿Cuál es la diferencia entre formatear, minificar y validar?",
          answer: "Formatear (embellecer) reindenta el JSON con espacios legibles para humanos. Minificar quita todos los espacios para conseguir el JSON válido más pequeño posible para transporte en red. Validar (lint) comprueba sin cambiar la estructura — solo te dice si el JSON es sintácticamente correcto y marca los problemas. El formateador ofrece los tres modos desde una única entrada.",
        },
      ],
    },
  },
  viewer: {
    en: {
      faqs: [
        {
          question: "How does the JSON tree viewer work?",
          answer: "Paste JSON and the viewer renders it as an interactive, collapsible tree. Every object and array becomes a node you can expand or collapse, making it easy to navigate deeply nested API responses. Keys, strings, numbers, booleans and nulls are color-coded by type, and hovering a value shows the full path (e.g., data.user.profile.email) so you can reference it in code without counting dots.",
        },
        {
          question: "Is the JSON viewer free?",
          answer: "Yes, fully free and no signup. Explore JSON payloads of any size your browser can load — tens of megabytes on a modern machine. All of JSONCraft's tools are free with no premium tier and no artificial limits; the viewer is meant to replace the pain of scrolling through a minified blob in DevTools.",
        },
        {
          question: "Does the viewer upload my JSON to a server?",
          answer: "No. The tree is built entirely in your browser from the JSON you paste — nothing is sent anywhere. This is critical for API responses that may include bearer tokens, session IDs or customer data; the viewer treats your input the same way as DevTools would, fully client-side. There is no account, no history, no logging.",
        },
        {
          question: "Can I search and copy specific fields?",
          answer: "Yes. Full-text search highlights matches in keys and values, and every node has a click-to-copy action that copies either the value itself or the full JSONPath to it. That makes the viewer useful when you want to pull out one specific piece of a deeply nested response — the browser's native Ctrl+F works on the rendered tree as well.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo funciona el visor de árbol JSON?",
          answer: "Pega JSON y el visor lo muestra como un árbol interactivo plegable. Cada objeto y array se convierte en un nodo que puedes expandir o contraer, facilitando navegar respuestas API muy anidadas. Claves, cadenas, números, booleanos y nulls están coloreados por tipo, y al pasar el ratón sobre un valor ves su ruta completa (ej. data.user.profile.email) para referenciarla en código sin contar puntos.",
        },
        {
          question: "¿El visor JSON es gratuito?",
          answer: "Sí, totalmente gratis y sin registro. Explora payloads JSON del tamaño que tu navegador pueda cargar — decenas de megabytes en una máquina moderna. Todas las herramientas de JSONCraft son gratuitas, sin plan premium ni límites artificiales; el visor sustituye el dolor de recorrer un blob minificado en DevTools.",
        },
        {
          question: "¿El visor sube mi JSON a un servidor?",
          answer: "No. El árbol se construye íntegramente en tu navegador a partir del JSON que pegas — nada se envía a ningún sitio. Esto es crítico para respuestas API que puedan contener tokens, IDs de sesión o datos de cliente; el visor trata tu entrada igual que DevTools, en cliente puro. No hay cuenta, ni historial, ni logs.",
        },
        {
          question: "¿Puedo buscar y copiar campos específicos?",
          answer: "Sí. La búsqueda de texto resalta coincidencias en claves y valores, y cada nodo tiene una acción de copiar con un clic que copia el valor o la ruta JSONPath completa. Eso hace el visor útil cuando necesitas extraer una pieza concreta de una respuesta muy anidada — el Ctrl+F nativo del navegador también funciona sobre el árbol renderizado.",
        },
      ],
    },
  },
  diff: {
    en: {
      faqs: [
        {
          question: "How do I compare two JSON documents?",
          answer: "Paste JSON A on the left and JSON B on the right. The diff tool parses both, aligns matching keys, and highlights changes side by side: green for additions, red for removals, and yellow for value changes. It handles nested objects and arrays structurally — so adding an item in the middle doesn't mark everything after as changed, unlike text diffs. You can collapse equal sections to focus only on what's different.",
        },
        {
          question: "Is the JSON diff tool free?",
          answer: "Yes, fully free with no signup and no size limit beyond browser capacity. You can run as many comparisons as you want, which is why people use it for API response regression testing, config audits and schema change review. JSONCraft has no premium tier — every tool is open at full capability.",
        },
        {
          question: "Does the diff upload my JSON documents?",
          answer: "No. Both documents are parsed and compared locally in your browser. Nothing is sent to a server, nothing is stored. This is especially important when diffing API responses or config files that may contain credentials; you can safely compare two versions of a secrets.json without ever transmitting them.",
        },
        {
          question: "Does it do structural diff or just text diff?",
          answer: "It's a structural diff, not a line-by-line text diff. That means key order doesn't matter — {a:1, b:2} compared to {b:2, a:1} registers as equal. Array element moves are detected where possible, and nested objects are recursed into. You get an accurate picture of what actually changed semantically, not just what moved on screen.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo comparo dos documentos JSON?",
          answer: "Pega el JSON A a la izquierda y el JSON B a la derecha. La herramienta parsea ambos, alinea claves coincidentes y resalta los cambios lado a lado: verde para añadidos, rojo para eliminados, amarillo para cambios de valor. Gestiona objetos y arrays anidados de forma estructural — así, añadir un elemento en medio no marca todo lo siguiente como cambiado, a diferencia de los diffs de texto. Puedes plegar secciones iguales para centrarte solo en lo distinto.",
        },
        {
          question: "¿La herramienta diff JSON es gratis?",
          answer: "Sí, totalmente gratis, sin registro ni límite de tamaño más allá de la capacidad del navegador. Ejecuta cuantas comparaciones quieras, por eso se usa para regresión de respuestas API, auditorías de configuración y revisión de cambios de esquema. JSONCraft no tiene plan premium — cada herramienta funciona al 100%.",
        },
        {
          question: "¿El diff sube mis documentos JSON?",
          answer: "No. Ambos documentos se parsean y comparan localmente en tu navegador. Nada se envía a un servidor ni se guarda. Esto importa especialmente al comparar respuestas API o ficheros de configuración con credenciales; puedes comparar con seguridad dos versiones de secrets.json sin transmitirlas nunca.",
        },
        {
          question: "¿Hace diff estructural o solo textual?",
          answer: "Es un diff estructural, no línea a línea. Es decir, el orden de las claves no importa — {a:1, b:2} comparado con {b:2, a:1} aparece como igual. Los movimientos de elementos en arrays se detectan cuando es posible, y los objetos anidados se recorren recursivamente. Obtienes una imagen precisa de lo que cambió semánticamente, no solo de lo que se movió en pantalla.",
        },
      ],
    },
  },
  "yaml-to-json": {
    en: {
      faqs: [
        {
          question: "How do I convert YAML to JSON?",
          answer: "Paste a YAML document — Kubernetes manifest, GitHub Actions workflow, docker-compose file, or any config — and the converter parses it with a YAML 1.2 parser and outputs equivalent JSON. Anchors, aliases, multi-line strings and tag types are preserved where JSON permits. Use it when you have a YAML source but need JSON for a tool, API or schema validator that only accepts JSON.",
        },
        {
          question: "Is the YAML to JSON converter free?",
          answer: "Yes, completely free with no signup. Convert unlimited YAML files, any size your browser can parse. JSONCraft is fully free across every tool — formatter, diff, converters, viewer — there is no premium tier gating features or throttling usage.",
        },
        {
          question: "Does the converter upload my YAML file?",
          answer: "No. The YAML parser runs entirely in your browser. Nothing leaves your device — important for Kubernetes manifests that may contain secrets, or CI workflows that reference internal hostnames. You can convert sensitive configs without any data touching a server.",
        },
        {
          question: "What about round-tripping YAML → JSON → YAML?",
          answer: "The conversion is lossy in one direction: YAML comments and some formatting choices don't exist in JSON, so they are discarded. For round-tripping config, pair this tool with the JSON to YAML converter, but be aware that comments won't survive. For structural data (no comments, no custom tags) the round-trip is clean and produces semantically identical output.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo convierto YAML a JSON?",
          answer: "Pega un documento YAML — manifiesto de Kubernetes, workflow de GitHub Actions, docker-compose, cualquier configuración — y el conversor lo parsea con un parser YAML 1.2 y produce el JSON equivalente. Anclas, alias, cadenas multilínea y tipos de etiqueta se preservan en lo que JSON admita. Úsalo cuando tengas YAML de origen pero necesites JSON para una herramienta, API o validador de esquema que solo acepte JSON.",
        },
        {
          question: "¿El conversor YAML a JSON es gratis?",
          answer: "Sí, totalmente gratis, sin registro. Convierte tantos archivos YAML como quieras, del tamaño que aguante tu navegador. JSONCraft es gratuito en todas sus herramientas — formateador, diff, conversores, visor — sin plan premium limitando funciones ni uso.",
        },
        {
          question: "¿El conversor sube mi archivo YAML?",
          answer: "No. El parser YAML se ejecuta íntegramente en tu navegador. Nada sale de tu dispositivo — importante para manifiestos de Kubernetes que puedan contener secretos, o workflows de CI que referencian hostnames internos. Puedes convertir configuraciones sensibles sin que ningún dato llegue a un servidor.",
        },
        {
          question: "¿Qué pasa con el round-trip YAML → JSON → YAML?",
          answer: "La conversión pierde algo en una dirección: los comentarios YAML y ciertas decisiones de formato no existen en JSON, así que se descartan. Para round-trip de configuración, combina esta herramienta con el conversor JSON a YAML, pero ten en cuenta que los comentarios no sobreviven. Para datos estructurales (sin comentarios ni etiquetas personalizadas) el round-trip es limpio y produce salida semánticamente idéntica.",
        },
      ],
    },
  },
  "csv-to-json": {
    en: {
      faqs: [
        {
          question: "How do I convert CSV to JSON?",
          answer: "Paste CSV data (or upload a file) and the converter detects the delimiter, parses headers, and outputs a JSON array of objects — one object per row with header names as keys. It handles quoted fields, escaped quotes, line breaks inside cells and variable delimiters (comma, semicolon, tab). You can choose an alternative output shape too, such as an array of arrays if you prefer header-less rows.",
        },
        {
          question: "Is the CSV to JSON converter free?",
          answer: "Yes, fully free, no signup, no file size limit beyond what your browser can hold. JSONCraft has a single open tier across all tools — converters, formatter, diff, viewer. You can push spreadsheets exported from Excel, Google Sheets, or database dumps through it as often as you need.",
        },
        {
          question: "Does the converter upload my CSV data?",
          answer: "No. The CSV parser runs in your browser — even when you use the file upload button, the file is read with the FileReader API locally, never transmitted. This matters when the CSV contains customer records, email lists or financial data; converting via a server-side tool would send that data outside your control.",
        },
        {
          question: "How does it handle edge cases like quoted commas or mixed types?",
          answer: "Quoted fields are parsed per RFC 4180, so a comma inside 'Smith, John' doesn't break the row. Fields are output as strings by default, with an option to auto-detect numbers and booleans (true/false, 1/0). For real-world CSVs from Excel and Google Sheets, detection works well, but you can disable it if you have columns like ZIP codes that must stay as strings.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo convierto CSV a JSON?",
          answer: "Pega los datos CSV (o sube un archivo) y el conversor detecta el delimitador, parsea las cabeceras y devuelve un array JSON de objetos — un objeto por fila con los nombres de cabecera como claves. Gestiona campos entrecomillados, comillas escapadas, saltos de línea dentro de celdas y delimitadores variables (coma, punto y coma, tabulación). También puedes elegir una forma de salida alternativa, como array de arrays si prefieres filas sin cabecera.",
        },
        {
          question: "¿El conversor CSV a JSON es gratis?",
          answer: "Sí, totalmente gratis, sin registro, sin límite de tamaño más allá de lo que quepa en tu navegador. JSONCraft tiene un único plan abierto en todas sus herramientas — conversores, formateador, diff, visor. Puedes procesar hojas exportadas de Excel, Google Sheets o volcados de base de datos tantas veces como necesites.",
        },
        {
          question: "¿El conversor sube mis datos CSV?",
          answer: "No. El parser CSV se ejecuta en tu navegador — incluso cuando usas el botón de subir archivo, se lee con la FileReader API localmente, nunca se transmite. Esto importa cuando el CSV contiene registros de clientes, listas de emails o datos financieros; convertir con una herramienta de servidor enviaría esos datos fuera de tu control.",
        },
        {
          question: "¿Cómo gestiona casos límite como comas entrecomilladas o tipos mixtos?",
          answer: "Los campos entrecomillados se parsean según RFC 4180, así una coma dentro de 'Smith, John' no rompe la fila. Por defecto los campos se emiten como cadenas, con opción a detectar automáticamente números y booleanos (true/false, 1/0). Para CSVs reales de Excel y Google Sheets la detección funciona bien, pero puedes desactivarla si tienes columnas tipo código postal que deben quedar como cadena.",
        },
      ],
    },
  },
};
