import type { Lang } from "./index";

/**
 * FAQ content for JSONCraft tools.
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
          question: "\u00bfC\u00f3mo formateo y valido JSON?",
          answer: "Pega tu JSON en el editor y el formateador lo parsea, resalta errores de sintaxis con n\u00famero de l\u00ednea y lo embellece con indentaci\u00f3n configurable (2 o 4 espacios, o tabulaci\u00f3n). Tambi\u00e9n ofrece un modo minify que quita espacios para payloads compactos, y una opci\u00f3n de ordenar claves \u00fatil para diffs. Los errores se reportan con la posici\u00f3n exacta del car\u00e1cter para que detectes al instante una coma de m\u00e1s o una llave sin cerrar.",
        },
        {
          question: "\u00bfEl formateador JSON es gratis?",
          answer: "S\u00ed, completamente gratis. Sin registro, sin l\u00edmite de tama\u00f1o m\u00e1s all\u00e1 de lo que aguante tu navegador (decenas de MB van bien en un port\u00e1til moderno), sin marcas de agua. JSONCraft est\u00e1 totalmente abierto para todas las herramientas — formateador, diff, viewer, convertidores — sin plan premium. Es la v\u00eda m\u00e1s r\u00e1pida de JSON desordenado a JSON limpio.",
        },
        {
          question: "\u00bfEl formateador sube mi JSON?",
          answer: "No. Cada byte de tu JSON se parsea y formatea localmente en tu navegador con un parser JavaScript cliente. Nada se sube, nada se guarda, ni siquiera hay componente de servidor para el formateador. Esto importa porque los payloads JSON suelen contener claves API, tokens o PII, y ser\u00eda peligroso pegarlos en una herramienta que los enviara fuera.",
        },
        {
          question: "\u00bfEmbellece JSON minificado de miles de l\u00edneas?",
          answer: "S\u00ed. El formateador usa CodeMirror 6, que gestiona documentos de varios megabytes con resaltado de sintaxis, ajuste de l\u00ednea y plegado de c\u00f3digo. Los corchetes plegables permiten navegar estructuras muy anidadas, y la b\u00fasqueda funciona sobre todo el documento. Para archivos muy grandes (50MB+) puede convenir recortar primero, pero las respuestas API y dumps de configuraci\u00f3n t\u00edpicos se formatean al instante.",
        },
        {
          question: "\u00bfCu\u00e1l es la diferencia entre formatear, minificar y validar?",
          answer: "Formatear (embellecer) reindenta el JSON con espacios legibles para humanos. Minificar quita todos los espacios para conseguir el JSON v\u00e1lido m\u00e1s peque\u00f1o posible para transporte en red. Validar (lint) comprueba sin cambiar la estructura — solo te dice si el JSON es sint\u00e1cticamente correcto y marca los problemas. El formateador ofrece los tres modos desde una \u00fanica entrada.",
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
          question: "\u00bfC\u00f3mo funciona el visor de \u00e1rbol JSON?",
          answer: "Pega JSON y el visor lo muestra como un \u00e1rbol interactivo plegable. Cada objeto y array se convierte en un nodo que puedes expandir o contraer, facilitando navegar respuestas API muy anidadas. Claves, cadenas, n\u00fameros, booleanos y nulls est\u00e1n coloreados por tipo, y al pasar el rat\u00f3n sobre un valor ves su ruta completa (ej. data.user.profile.email) para referenciarla en c\u00f3digo sin contar puntos.",
        },
        {
          question: "\u00bfEl visor JSON es gratuito?",
          answer: "S\u00ed, totalmente gratis y sin registro. Explora payloads JSON del tama\u00f1o que tu navegador pueda cargar — decenas de megabytes en una m\u00e1quina moderna. Todas las herramientas de JSONCraft son gratuitas, sin plan premium ni l\u00edmites artificiales; el visor sustituye el dolor de recorrer un blob minificado en DevTools.",
        },
        {
          question: "\u00bfEl visor sube mi JSON a un servidor?",
          answer: "No. El \u00e1rbol se construye \u00edntegramente en tu navegador a partir del JSON que pegas — nada se env\u00eda a ning\u00fan sitio. Esto es cr\u00edtico para respuestas API que puedan contener tokens, IDs de sesi\u00f3n o datos de cliente; el visor trata tu entrada igual que DevTools, en cliente puro. No hay cuenta, ni historial, ni logs.",
        },
        {
          question: "\u00bfPuedo buscar y copiar campos espec\u00edficos?",
          answer: "S\u00ed. La b\u00fasqueda de texto resalta coincidencias en claves y valores, y cada nodo tiene una acci\u00f3n de copiar con un clic que copia el valor o la ruta JSONPath completa. Eso hace el visor \u00fatil cuando necesitas extraer una pieza concreta de una respuesta muy anidada — el Ctrl+F nativo del navegador tambi\u00e9n funciona sobre el \u00e1rbol renderizado.",
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
          question: "\u00bfC\u00f3mo comparo dos documentos JSON?",
          answer: "Pega el JSON A a la izquierda y el JSON B a la derecha. La herramienta parsea ambos, alinea claves coincidentes y resalta los cambios lado a lado: verde para a\u00f1adidos, rojo para eliminados, amarillo para cambios de valor. Gestiona objetos y arrays anidados de forma estructural — as\u00ed, a\u00f1adir un elemento en medio no marca todo lo siguiente como cambiado, a diferencia de los diffs de texto. Puedes plegar secciones iguales para centrarte solo en lo distinto.",
        },
        {
          question: "\u00bfLa herramienta diff JSON es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de tama\u00f1o m\u00e1s all\u00e1 de la capacidad del navegador. Ejecuta cuantas comparaciones quieras, por eso se usa para regresi\u00f3n de respuestas API, auditor\u00edas de configuraci\u00f3n y revisi\u00f3n de cambios de esquema. JSONCraft no tiene plan premium — cada herramienta funciona al 100%.",
        },
        {
          question: "\u00bfEl diff sube mis documentos JSON?",
          answer: "No. Ambos documentos se parsean y comparan localmente en tu navegador. Nada se env\u00eda a un servidor ni se guarda. Esto importa especialmente al comparar respuestas API o ficheros de configuraci\u00f3n con credenciales; puedes comparar con seguridad dos versiones de secrets.json sin transmitirlas nunca.",
        },
        {
          question: "\u00bfHace diff estructural o solo textual?",
          answer: "Es un diff estructural, no l\u00ednea a l\u00ednea. Es decir, el orden de las claves no importa — {a:1, b:2} comparado con {b:2, a:1} aparece como igual. Los movimientos de elementos en arrays se detectan cuando es posible, y los objetos anidados se recorren recursivamente. Obtienes una imagen precisa de lo que cambi\u00f3 sem\u00e1nticamente, no solo de lo que se movi\u00f3 en pantalla.",
        },
      ],
    },
  },
  graph: {
    en: {
      faqs: [
        {
          question: "How does the JSON graph visualizer work?",
          answer: "Paste JSON and the graph tool renders every object and array as a node, connecting parents to children with edges. You get an SVG canvas you can pan and zoom: scroll to zoom in on a deeply nested branch, drag to reposition. The layout is automatic so you don't need to arrange nodes manually, and primitive values are shown inside their owning node to keep the graph compact and readable.",
        },
        {
          question: "Is the graph visualizer free to use?",
          answer: "Yes, completely free with no signup or usage cap. Render as many JSON documents as you need — API responses, config trees, schema examples. JSONCraft has a single open tier for every tool including the graph viewer. No watermark appears on exported SVGs, and there's no artificial node limit; your browser's rendering capacity is the only constraint.",
        },
        {
          question: "Does the graph tool upload my JSON?",
          answer: "No. The JSON is parsed and laid out entirely in your browser — no network request, no server component. This matters when the JSON represents internal infrastructure, customer records or auth payloads; you can visualize sensitive data without it leaving your machine. There is no history, no account and no logging.",
        },
        {
          question: "Can it handle large JSON files smoothly?",
          answer: "For documents up to a few thousand nodes the SVG renderer stays interactive. Beyond that, browsers slow down because every node becomes a DOM element. For very large payloads you can collapse branches or pre-filter with JSONPath before feeding the graph. Pan and zoom remain responsive because the SVG is GPU-accelerated even with many elements on screen.",
        },
        {
          question: "When should I use the graph viewer instead of the tree viewer?",
          answer: "Use the tree viewer when you want to drill top-down into a single path and read values — it's compact and familiar. Use the graph viewer when you need to see the overall shape of the data, spot repeated substructures, or explain a JSON schema to a teammate visually. The graph is better for structure, the tree is better for values.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo funciona el visualizador de grafos JSON?",
          answer: "Pega JSON y la herramienta dibuja cada objeto y array como un nodo, conectando padres con hijos mediante aristas. Obtienes un lienzo SVG con pan y zoom: usa la rueda para acercar una rama muy anidada, arrastra para reposicionar. El layout es autom\u00e1tico, no necesitas colocar nodos a mano, y los valores primitivos se muestran dentro de su nodo due\u00f1o para mantener el grafo compacto y legible.",
        },
        {
          question: "\u00bfEl visualizador de grafos es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de uso. Renderiza tantos JSON como necesites — respuestas API, \u00e1rboles de configuraci\u00f3n, ejemplos de esquema. JSONCraft tiene un \u00fanico plan abierto para todas las herramientas, incluido el grafo. No hay marca de agua en los SVG exportados ni l\u00edmite artificial de nodos; la capacidad de renderizado del navegador es la \u00fanica restricci\u00f3n.",
        },
        {
          question: "\u00bfLa herramienta de grafos sube mi JSON?",
          answer: "No. El JSON se parsea y organiza \u00edntegramente en tu navegador — sin petici\u00f3n de red ni componente de servidor. Esto importa cuando el JSON representa infraestructura interna, registros de cliente o payloads de auth; puedes visualizar datos sensibles sin que salgan de tu m\u00e1quina. No hay historial, ni cuenta, ni logs.",
        },
        {
          question: "\u00bfManeja bien ficheros JSON grandes?",
          answer: "Para documentos de hasta unos miles de nodos el renderer SVG sigue siendo interactivo. A partir de ah\u00ed los navegadores se ralentizan porque cada nodo es un elemento DOM. Para payloads muy grandes puedes plegar ramas o prefiltrar con JSONPath antes de pasar al grafo. El pan y zoom siguen respondiendo porque el SVG est\u00e1 acelerado por GPU aunque haya muchos elementos en pantalla.",
        },
        {
          question: "\u00bfCu\u00e1ndo usar el grafo en vez del visor de \u00e1rbol?",
          answer: "Usa el visor de \u00e1rbol cuando quieras bajar top-down por una ruta y leer valores — es compacto y familiar. Usa el grafo cuando necesites ver la forma general de los datos, detectar subestructuras repetidas o explicar un esquema JSON a un compa\u00f1ero visualmente. El grafo es mejor para la estructura, el \u00e1rbol para los valores.",
        },
      ],
    },
  },
  jsonpath: {
    en: {
      faqs: [
        {
          question: "How do I query JSON with JSONPath?",
          answer: "Paste your JSON and write a JSONPath expression like $.store.book[0].title or $..author. The tool evaluates the query against the document and returns matching nodes in real time. It supports the usual operators: child (.), recursive descent (..), wildcard (*), array slicing ([0:3]), filter expressions ([?(@.price < 10)]) and multi-key selection ([title,author]). Results are shown as a JSON array of matches.",
        },
        {
          question: "Is the JSONPath evaluator free?",
          answer: "Yes, fully free with no signup. Run unlimited queries against JSON of any size your browser can load. JSONCraft is free across every tool — formatter, viewer, JSONPath, converters — no premium tier and no query cap. Power users run it all day to explore API responses without writing ad hoc JavaScript.",
        },
        {
          question: "Does the JSONPath tool upload my JSON?",
          answer: "No. Both the JSON document and the query expression stay in your browser. The evaluator runs locally in JavaScript with no network call. That's important because real queries often target production API payloads containing tokens or customer data; you can explore them safely without leaking anything.",
        },
        {
          question: "Can I use filter expressions and recursive descent?",
          answer: "Yes. Recursive descent $..book matches any 'book' key at any depth, which is often what you want when the structure varies. Filter expressions like $..book[?(@.price < 10)] evaluate a predicate against each candidate node using @ as the current item. Array slicing [0:5], negative indices [-1:], and union selectors [0,2,4] also work as in the standard Goessner spec.",
        },
        {
          question: "When should I use JSONPath instead of jq?",
          answer: "JSONPath is simpler and browser-native — great for quick ad hoc exploration and for embedding queries in tools or config. jq is a full programming language with variables, functions and transformations; better when you need to reshape output, not just select. If you're exploring or pulling specific values, JSONPath is faster; if you're producing a transformed document, reach for jq.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo consulto JSON con JSONPath?",
          answer: "Pega tu JSON y escribe una expresi\u00f3n JSONPath como $.store.book[0].title o $..author. La herramienta eval\u00faa la consulta sobre el documento y devuelve los nodos coincidentes en tiempo real. Soporta los operadores habituales: hijo (.), descenso recursivo (..), comod\u00edn (*), slicing de arrays ([0:3]), filtros ([?(@.price < 10)]) y selecci\u00f3n m\u00faltiple ([title,author]). Los resultados se muestran como array JSON de coincidencias.",
        },
        {
          question: "\u00bfEl evaluador JSONPath es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Ejecuta consultas ilimitadas sobre JSON del tama\u00f1o que tu navegador pueda cargar. JSONCraft es gratis en todas sus herramientas — formateador, visor, JSONPath, conversores — sin plan premium ni l\u00edmite de consultas. Los power users lo usan todo el d\u00eda para explorar respuestas API sin escribir JavaScript ad hoc.",
        },
        {
          question: "\u00bfLa herramienta JSONPath sube mi JSON?",
          answer: "No. Tanto el documento JSON como la expresi\u00f3n se quedan en tu navegador. El evaluador corre localmente en JavaScript sin llamada de red. Eso importa porque las consultas reales suelen apuntar a payloads de producci\u00f3n con tokens o datos de cliente; puedes explorarlos con seguridad sin filtrar nada.",
        },
        {
          question: "\u00bfPuedo usar filtros y descenso recursivo?",
          answer: "S\u00ed. El descenso recursivo $..book coincide con cualquier clave 'book' a cualquier profundidad, que suele ser lo que quieres cuando la estructura var\u00eda. Las expresiones de filtro como $..book[?(@.price < 10)] eval\u00faan un predicado contra cada candidato usando @ como el elemento actual. Slicing [0:5], \u00edndices negativos [-1:] y selectores de uni\u00f3n [0,2,4] tambi\u00e9n funcionan seg\u00fan la especificaci\u00f3n Goessner.",
        },
        {
          question: "\u00bfCu\u00e1ndo usar JSONPath en lugar de jq?",
          answer: "JSONPath es m\u00e1s simple y nativo del navegador — genial para exploraci\u00f3n ad hoc y para incrustar consultas en herramientas o configuraci\u00f3n. jq es un lenguaje de programaci\u00f3n completo con variables, funciones y transformaciones; mejor cuando necesitas remodelar la salida, no solo seleccionar. Si exploras o sacas valores concretos, JSONPath es m\u00e1s r\u00e1pido; si produces un documento transformado, usa jq.",
        },
      ],
    },
  },
  "yaml-to-json": {
    en: {
      faqs: [
        {
          question: "How do I convert YAML to JSON?",
          answer: "Paste a YAML document — Kubernetes manifest, GitHub Actions workflow, docker-compose file, or any config — and the converter parses it with a YAML 1.2 parser and outputs equivalent JSON. Type information is preserved: numbers stay numbers, booleans stay booleans, nulls stay null, strings stay strings. Anchors and aliases are dereferenced so the JSON output is self-contained, and nested mappings and sequences translate one-to-one.",
        },
        {
          question: "Is the YAML to JSON converter free?",
          answer: "Yes, completely free with no signup. Convert unlimited YAML files, any size your browser can parse. JSONCraft is fully free across every tool — formatter, diff, converters, viewer — there is no premium tier gating features or throttling usage. Useful for CI pipelines, Kubernetes work and general config translation.",
        },
        {
          question: "Does the converter upload my YAML file?",
          answer: "No. The YAML parser runs entirely in your browser. Nothing leaves your device — important for Kubernetes manifests that may contain secrets, or CI workflows that reference internal hostnames. You can convert sensitive configs without any data touching a server, and there is no history, account or logging of any kind.",
        },
        {
          question: "Does it support multi-document YAML files?",
          answer: "Multi-document YAML (streams separated by ---) is not supported as a single combined output; JSON has no native equivalent for document streams. If your file contains multiple documents, split them on --- and convert each independently. Single-document YAML with any depth of nested mappings and sequences, anchors, aliases and the standard scalar types works out of the box.",
        },
        {
          question: "What about round-tripping YAML to JSON to YAML?",
          answer: "The conversion is lossy in one direction: YAML comments and some formatting choices don't exist in JSON, so they are discarded. For round-tripping config, pair this tool with the JSON to YAML converter, but be aware comments won't survive. For pure structural data (no comments, no custom tags) the round-trip is clean and produces semantically identical output.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto YAML a JSON?",
          answer: "Pega un documento YAML — manifiesto de Kubernetes, workflow de GitHub Actions, docker-compose, cualquier configuraci\u00f3n — y el conversor lo parsea con un parser YAML 1.2 y produce el JSON equivalente. Los tipos se preservan: los n\u00fameros quedan como n\u00fameros, los booleanos como booleanos, los nulls como null, las cadenas como cadenas. Las anclas y alias se resuelven para que el JSON sea autocontenido, y los mapeos y secuencias anidados se traducen uno a uno.",
        },
        {
          question: "\u00bfEl conversor YAML a JSON es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Convierte tantos archivos YAML como quieras, del tama\u00f1o que aguante tu navegador. JSONCraft es gratuito en todas sus herramientas — formateador, diff, conversores, visor — sin plan premium limitando funciones ni uso. \u00datil para pipelines CI, trabajo con Kubernetes y traducci\u00f3n de configuraci\u00f3n en general.",
        },
        {
          question: "\u00bfEl conversor sube mi archivo YAML?",
          answer: "No. El parser YAML se ejecuta \u00edntegramente en tu navegador. Nada sale de tu dispositivo — importante para manifiestos de Kubernetes que puedan contener secretos, o workflows de CI que referencian hostnames internos. Puedes convertir configuraciones sensibles sin que ning\u00fan dato llegue a un servidor, y no hay historial, cuenta ni logs de ning\u00fan tipo.",
        },
        {
          question: "\u00bfSoporta archivos YAML multi-documento?",
          answer: "YAML multi-documento (streams separados por ---) no se soporta como salida combinada; JSON no tiene equivalente nativo para streams de documentos. Si tu archivo contiene varios documentos, dividelos por --- y convierte cada uno por separado. YAML de un \u00fanico documento con cualquier profundidad de mapeos y secuencias anidadas, anclas, alias y tipos escalares est\u00e1ndar funciona directamente.",
        },
        {
          question: "\u00bfQu\u00e9 pasa con el round-trip YAML a JSON a YAML?",
          answer: "La conversi\u00f3n pierde algo en una direcci\u00f3n: los comentarios YAML y ciertas decisiones de formato no existen en JSON, as\u00ed que se descartan. Para round-trip de configuraci\u00f3n, combina esta herramienta con el conversor JSON a YAML, pero ten en cuenta que los comentarios no sobreviven. Para datos puramente estructurales (sin comentarios ni etiquetas personalizadas) el round-trip es limpio y produce salida sem\u00e1nticamente id\u00e9ntica.",
        },
      ],
    },
  },
  "json-to-yaml": {
    en: {
      faqs: [
        {
          question: "How do I convert JSON to YAML?",
          answer: "Paste JSON and the converter emits YAML 1.2 with proper indentation, block-style mappings and sequences by default. Types are preserved: numbers, booleans and nulls are written in YAML's native syntax (true/false/null, not quoted), strings are quoted only when necessary. You can tweak indent width and choose between block and flow style for compact arrays. The output is ready to drop into Kubernetes, Ansible or any YAML-aware tool.",
        },
        {
          question: "Is the JSON to YAML converter free?",
          answer: "Yes, fully free with no signup, no size cap beyond browser memory. Convert as often as you need — it's common to run JSON to YAML repeatedly when iterating on Helm values or GitHub Actions workflows. JSONCraft has no premium tier; every converter is open at full capability, including this one.",
        },
        {
          question: "Does the converter upload my JSON?",
          answer: "No. Parsing and YAML emission run entirely in your browser. Nothing is sent to a server — relevant when your JSON is an API response, a secrets bundle or a deployment config. You can safely convert sensitive payloads; there is no history, no account and no logging.",
        },
        {
          question: "How are strings with special characters handled?",
          answer: "Strings containing YAML-significant characters (colons, dashes, hashes at start, multiline content) are automatically quoted or block-escaped so the output remains valid. Keys that look numeric or boolean are quoted to avoid accidental retyping when re-parsed. Control characters and non-printable bytes are escaped. The result round-trips through the YAML to JSON converter cleanly.",
        },
        {
          question: "When should I use YAML over JSON for config?",
          answer: "YAML wins when humans maintain the file: it allows comments, is less punctuation-heavy and reads cleanly at depth. JSON wins when machines exchange it: it's unambiguous, universally supported, and has no surprising type coercion (YAML famously parses 'no' as false). Use this converter when you have machine-generated JSON that a human now needs to edit, or the reverse.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto JSON a YAML?",
          answer: "Pega JSON y el conversor emite YAML 1.2 con la indentaci\u00f3n correcta, mapeos y secuencias en estilo bloque por defecto. Los tipos se preservan: n\u00fameros, booleanos y nulls se escriben en sintaxis nativa YAML (true/false/null, sin comillas), las cadenas se entrecomillan solo cuando hace falta. Puedes ajustar el ancho de indentaci\u00f3n y elegir entre estilo bloque y flow para arrays compactos. La salida est\u00e1 lista para Kubernetes, Ansible o cualquier herramienta YAML.",
        },
        {
          question: "\u00bfEl conversor JSON a YAML es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro, sin tope de tama\u00f1o m\u00e1s all\u00e1 de la memoria del navegador. Convierte cuantas veces necesites — es com\u00fan iterar JSON a YAML repetidamente al ajustar values de Helm o workflows de GitHub Actions. JSONCraft no tiene plan premium; cada conversor funciona al 100%, incluido este.",
        },
        {
          question: "\u00bfEl conversor sube mi JSON?",
          answer: "No. El parseo y la emisi\u00f3n YAML corren \u00edntegramente en tu navegador. Nada se env\u00eda a un servidor — relevante cuando tu JSON es una respuesta API, un bundle de secretos o un config de despliegue. Puedes convertir payloads sensibles con seguridad; no hay historial, ni cuenta, ni logs.",
        },
        {
          question: "\u00bfC\u00f3mo se manejan las cadenas con caracteres especiales?",
          answer: "Las cadenas con caracteres significativos en YAML (dos puntos, guiones, almohadillas al inicio, contenido multil\u00ednea) se entrecomillan o escapan en bloque autom\u00e1ticamente para que la salida siga siendo v\u00e1lida. Las claves con aspecto num\u00e9rico o booleano se entrecomillan para evitar retipado accidental al reparsear. Los caracteres de control y bytes no imprimibles se escapan. El resultado hace round-trip limpio con el conversor YAML a JSON.",
        },
        {
          question: "\u00bfCu\u00e1ndo conviene YAML sobre JSON para configuraci\u00f3n?",
          answer: "YAML gana cuando mantienen el archivo humanos: permite comentarios, tiene menos puntuaci\u00f3n y se lee mejor en profundidad. JSON gana cuando lo intercambian m\u00e1quinas: es inequ\u00edvoco, universalmente soportado y sin coerci\u00f3n sorprendente (YAML parsea 'no' como false). Usa este conversor cuando tengas JSON generado por m\u00e1quina que un humano necesita editar, o al rev\u00e9s.",
        },
      ],
    },
  },
  "json-to-csv": {
    en: {
      faqs: [
        {
          question: "How do I convert JSON to CSV?",
          answer: "Paste a JSON array of objects and the converter flattens each object into a row with keys as column headers. Nested objects are flattened with dot notation (user.profile.email becomes a single column), and arrays of primitives are joined with a configurable separator. The result is RFC 4180-compliant CSV that opens cleanly in Excel, Google Sheets or any database import. You can customize delimiter, quote character and line ending.",
        },
        {
          question: "Is the JSON to CSV converter free?",
          answer: "Yes, completely free with no signup or row limit. Export arrays of any length your browser can handle — tens of thousands of records work without trouble on a modern machine. JSONCraft has a single open tier for every tool, so there's no feature gate between you and a clean spreadsheet.",
        },
        {
          question: "Does the converter upload my JSON?",
          answer: "No. The flattening and CSV serialization run entirely in your browser. Nothing is transmitted — useful when the JSON contains customer records, analytics exports or internal audit data. You can safely convert then download the CSV without any byte leaving your device.",
        },
        {
          question: "How are nested objects and arrays handled?",
          answer: "Nested objects are flattened with dot-path keys: {user:{name:'A'}} becomes a 'user.name' column. Arrays of primitives (['red','blue']) are joined as a single cell with a configurable separator. Arrays of objects are more complex — you can choose to stringify them as JSON inside one cell, or expand to multiple rows. Values containing commas, quotes or newlines are escaped per RFC 4180.",
        },
        {
          question: "When should I use CSV over JSON for tabular data?",
          answer: "CSV when the data is genuinely flat (rows and columns) and the consumer is a spreadsheet or database — Excel and BI tools ingest CSV natively. JSON when the data is hierarchical or when types matter (CSV is string-only at the wire). This converter is most useful when an API returns JSON but your analyst needs a spreadsheet; it bridges the two without writing a script.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto JSON a CSV?",
          answer: "Pega un array JSON de objetos y el conversor aplana cada objeto en una fila con las claves como cabeceras. Los objetos anidados se aplanan con notaci\u00f3n de puntos (user.profile.email se convierte en una columna), y los arrays de primitivos se unen con un separador configurable. El resultado es CSV conforme a RFC 4180 que abre limpio en Excel, Google Sheets o cualquier importaci\u00f3n de base de datos. Puedes ajustar delimitador, car\u00e1cter de comillas y final de l\u00ednea.",
        },
        {
          question: "\u00bfEl conversor JSON a CSV es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de filas. Exporta arrays del tama\u00f1o que aguante tu navegador — decenas de miles de registros funcionan sin problema en una m\u00e1quina moderna. JSONCraft tiene un \u00fanico plan abierto para todas las herramientas, as\u00ed que no hay muro entre t\u00fa y una hoja limpia.",
        },
        {
          question: "\u00bfEl conversor sube mi JSON?",
          answer: "No. El aplanado y la serializaci\u00f3n CSV corren \u00edntegramente en tu navegador. Nada se transmite — \u00fatil cuando el JSON contiene registros de clientes, exportaciones de anal\u00edtica o datos de auditor\u00eda interna. Puedes convertir con seguridad y descargar el CSV sin que ning\u00fan byte salga de tu dispositivo.",
        },
        {
          question: "\u00bfC\u00f3mo se manejan objetos y arrays anidados?",
          answer: "Los objetos anidados se aplanan con claves en ruta de puntos: {user:{name:'A'}} se convierte en una columna 'user.name'. Los arrays de primitivos (['rojo','azul']) se unen en una celda con separador configurable. Los arrays de objetos son m\u00e1s complejos — puedes elegir serializarlos como JSON dentro de una celda o expandir a varias filas. Los valores con comas, comillas o saltos de l\u00ednea se escapan seg\u00fan RFC 4180.",
        },
        {
          question: "\u00bfCu\u00e1ndo usar CSV sobre JSON para datos tabulares?",
          answer: "CSV cuando los datos son realmente planos (filas y columnas) y el consumidor es una hoja de c\u00e1lculo o base de datos — Excel y herramientas BI ingieren CSV de forma nativa. JSON cuando los datos son jer\u00e1rquicos o cuando los tipos importan (CSV es solo cadenas a nivel de cable). Este conversor es m\u00e1s \u00fatil cuando una API devuelve JSON pero tu analista necesita una hoja; los une sin escribir un script.",
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
        {
          question: "When should I convert CSV to JSON instead of importing directly?",
          answer: "Convert to JSON when the downstream is an API, a document database (MongoDB, CouchDB) or a JavaScript frontend — they all consume JSON natively. Stay in CSV when the downstream is a spreadsheet or a SQL bulk loader. If your CSV has nested-intent columns (user.name, user.email), this converter can be paired with a post-processor to re-nest them, which the flat JSON output makes straightforward.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto CSV a JSON?",
          answer: "Pega los datos CSV (o sube un archivo) y el conversor detecta el delimitador, parsea las cabeceras y devuelve un array JSON de objetos — un objeto por fila con los nombres de cabecera como claves. Gestiona campos entrecomillados, comillas escapadas, saltos de l\u00ednea dentro de celdas y delimitadores variables (coma, punto y coma, tabulaci\u00f3n). Tambi\u00e9n puedes elegir una forma de salida alternativa, como array de arrays si prefieres filas sin cabecera.",
        },
        {
          question: "\u00bfEl conversor CSV a JSON es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro, sin l\u00edmite de tama\u00f1o m\u00e1s all\u00e1 de lo que quepa en tu navegador. JSONCraft tiene un \u00fanico plan abierto en todas sus herramientas — conversores, formateador, diff, visor. Puedes procesar hojas exportadas de Excel, Google Sheets o volcados de base de datos tantas veces como necesites.",
        },
        {
          question: "\u00bfEl conversor sube mis datos CSV?",
          answer: "No. El parser CSV se ejecuta en tu navegador — incluso cuando usas el bot\u00f3n de subir archivo, se lee con la FileReader API localmente, nunca se transmite. Esto importa cuando el CSV contiene registros de clientes, listas de emails o datos financieros; convertir con una herramienta de servidor enviar\u00eda esos datos fuera de tu control.",
        },
        {
          question: "\u00bfC\u00f3mo gestiona casos l\u00edmite como comas entrecomilladas o tipos mixtos?",
          answer: "Los campos entrecomillados se parsean seg\u00fan RFC 4180, as\u00ed una coma dentro de 'Smith, John' no rompe la fila. Por defecto los campos se emiten como cadenas, con opci\u00f3n a detectar autom\u00e1ticamente n\u00fameros y booleanos (true/false, 1/0). Para CSVs reales de Excel y Google Sheets la detecci\u00f3n funciona bien, pero puedes desactivarla si tienes columnas tipo c\u00f3digo postal que deben quedar como cadena.",
        },
        {
          question: "\u00bfCu\u00e1ndo convertir CSV a JSON en vez de importar directo?",
          answer: "Convierte a JSON cuando el destino es una API, una base de datos documental (MongoDB, CouchDB) o un frontend JavaScript — todos consumen JSON nativamente. Mantente en CSV cuando el destino es una hoja de c\u00e1lculo o un bulk loader SQL. Si tu CSV tiene columnas con intenci\u00f3n anidada (user.name, user.email), este conversor puede combinarse con un postproceso para renidarlas, algo directo con el JSON plano de salida.",
        },
      ],
    },
  },
  "json-to-toml": {
    en: {
      faqs: [
        {
          question: "How do I convert JSON to TOML?",
          answer: "Paste JSON and the converter emits TOML 1.0 spec-compliant output. Top-level object keys become TOML tables, nested objects become nested tables with dotted headers, and arrays of objects become TOML array-of-tables using the [[section]] syntax. Primitive types map directly: strings are quoted, numbers stay numbers, booleans stay true/false, and JSON dates (if formatted as ISO 8601) become TOML date-time literals.",
        },
        {
          question: "Is the JSON to TOML converter free?",
          answer: "Yes, fully free with no signup. Convert as often as you need — useful for Cargo.toml, pyproject.toml, Hugo config and other TOML-based tooling. JSONCraft is free across every tool, no premium tier, no limits. Output has no watermarks and can be dropped straight into your repo.",
        },
        {
          question: "Does the converter upload my JSON?",
          answer: "No. Conversion runs entirely in your browser with no server round-trip. This matters when your JSON represents sensitive project config or credentials; you can convert to TOML safely without anything leaving your machine. There is no history, account or logging.",
        },
        {
          question: "How are arrays of objects and mixed-type arrays handled?",
          answer: "Arrays of objects become TOML array-of-tables (repeated [[name]] sections), which is the idiomatic way to represent them. Arrays of primitives use the inline [a, b, c] syntax. Mixed-type arrays are rejected by the strict TOML spec (arrays must be homogeneous), so the converter flags them as an error with the offending path so you can fix the JSON before converting.",
        },
        {
          question: "Why would I choose TOML over JSON or YAML?",
          answer: "TOML targets human-edited config: it supports comments, has simpler semantics than YAML (no significant whitespace, no type surprises) and a more readable surface than JSON for multi-section files. Rust (Cargo), Python (pyproject) and Hugo have standardized on it. Use this converter when a tool you depend on demands TOML but your data source emits JSON.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto JSON a TOML?",
          answer: "Pega JSON y el conversor emite salida conforme a TOML 1.0. Las claves del objeto ra\u00edz se vuelven tablas TOML, los objetos anidados se vuelven tablas anidadas con cabeceras punteadas, y los arrays de objetos se convierten en array-of-tables con sintaxis [[section]]. Los tipos primitivos se mapean directamente: las cadenas se entrecomillan, los n\u00fameros se quedan como n\u00fameros, los booleanos true/false, y las fechas JSON (si est\u00e1n en ISO 8601) se vuelven literales date-time TOML.",
        },
        {
          question: "\u00bfEl conversor JSON a TOML es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Convierte cuantas veces necesites — \u00fatil para Cargo.toml, pyproject.toml, configuraci\u00f3n de Hugo y otras herramientas basadas en TOML. JSONCraft es gratis en todas sus herramientas, sin plan premium ni l\u00edmites. La salida no tiene marca de agua y puede ir directa a tu repo.",
        },
        {
          question: "\u00bfEl conversor sube mi JSON?",
          answer: "No. La conversi\u00f3n corre \u00edntegramente en tu navegador sin ida y vuelta al servidor. Esto importa cuando tu JSON representa configuraci\u00f3n sensible del proyecto o credenciales; puedes convertir a TOML con seguridad sin que nada salga de tu m\u00e1quina. No hay historial, cuenta ni logs.",
        },
        {
          question: "\u00bfC\u00f3mo se manejan arrays de objetos y arrays de tipos mixtos?",
          answer: "Los arrays de objetos se vuelven array-of-tables TOML (secciones [[nombre]] repetidas), la forma idiom\u00e1tica de representarlos. Los arrays de primitivos usan sintaxis inline [a, b, c]. Los arrays de tipos mixtos los rechaza la spec estricta de TOML (deben ser homog\u00e9neos), as\u00ed que el conversor los marca como error con la ruta infractora para que corrijas el JSON antes de convertir.",
        },
        {
          question: "\u00bfPor qu\u00e9 elegir TOML sobre JSON o YAML?",
          answer: "TOML apunta a configuraci\u00f3n editada por humanos: soporta comentarios, tiene sem\u00e1ntica m\u00e1s simple que YAML (sin espacios significativos, sin sorpresas de tipo) y una superficie m\u00e1s legible que JSON para archivos de varias secciones. Rust (Cargo), Python (pyproject) y Hugo lo han estandarizado. Usa este conversor cuando una herramienta que dependes de ella exija TOML pero tu origen emita JSON.",
        },
      ],
    },
  },
  "toml-to-json": {
    en: {
      faqs: [
        {
          question: "How do I convert TOML to JSON?",
          answer: "Paste a TOML document (Cargo.toml, pyproject.toml, Hugo config) and the converter parses it per the TOML 1.0 spec and emits equivalent JSON. Tables become nested objects, array-of-tables ([[section]]) become JSON arrays of objects, and scalar types (strings, numbers, booleans, date-times) convert to their JSON counterparts. Inline tables and inline arrays work identically to their block-form equivalents.",
        },
        {
          question: "Is the TOML to JSON converter free?",
          answer: "Yes, completely free with no signup or usage cap. JSONCraft is fully free across every tool — formatter, diff, converters, viewer. Use this converter whenever you need to read a TOML config from a JavaScript tool, feed pyproject.toml metadata to a schema validator, or normalize mixed-config repos into a single JSON view.",
        },
        {
          question: "Does the converter upload my TOML?",
          answer: "No. The TOML parser runs entirely in your browser. Nothing is sent to a server — relevant because TOML configs often contain build settings, deploy targets or registry credentials. You can convert sensitive files safely; there's no history, no account and no logging.",
        },
        {
          question: "Does it preserve TOML date-time literals?",
          answer: "TOML has native date-time, local date, local time and local date-time types — richer than JSON, which has only strings. The converter emits them as ISO 8601 strings, which is the de facto JSON convention and round-trips cleanly through the JSON to TOML converter. If your downstream needs a JavaScript Date, you'll need to parse the string there, but no information is lost.",
        },
        {
          question: "What TOML features may not round-trip to JSON?",
          answer: "Comments and original formatting (key order in inline tables, literal versus basic strings) are not preserved — JSON has neither. Array-of-tables versus inline tables distinction collapses in JSON (both become arrays of objects). Numeric precision is preserved for integers up to 2^53 (JSON's safe range); larger TOML integers become strings to avoid silent truncation.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto TOML a JSON?",
          answer: "Pega un documento TOML (Cargo.toml, pyproject.toml, config de Hugo) y el conversor lo parsea seg\u00fan la spec TOML 1.0 y emite el JSON equivalente. Las tablas se vuelven objetos anidados, los array-of-tables ([[section]]) se vuelven arrays JSON de objetos, y los tipos escalares (cadenas, n\u00fameros, booleanos, date-times) se convierten a sus hom\u00f3logos JSON. Las inline tables y arrays inline funcionan igual que sus equivalentes en bloque.",
        },
        {
          question: "\u00bfEl conversor TOML a JSON es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de uso. JSONCraft es gratis en todas sus herramientas — formateador, diff, conversores, visor. Usa este conversor siempre que necesites leer una configuraci\u00f3n TOML desde una herramienta JavaScript, pasar metadatos de pyproject.toml a un validador de esquema o normalizar repos de configuraci\u00f3n mixta en una \u00fanica vista JSON.",
        },
        {
          question: "\u00bfEl conversor sube mi TOML?",
          answer: "No. El parser TOML corre \u00edntegramente en tu navegador. Nada se env\u00eda a un servidor — relevante porque las configuraciones TOML contienen a menudo ajustes de build, targets de deploy o credenciales de registry. Puedes convertir archivos sensibles con seguridad; no hay historial, cuenta ni logs.",
        },
        {
          question: "\u00bfPreserva los literales date-time de TOML?",
          answer: "TOML tiene tipos nativos date-time, local date, local time y local date-time — m\u00e1s ricos que JSON, que solo tiene cadenas. El conversor los emite como cadenas ISO 8601, la convenci\u00f3n de facto en JSON, y hacen round-trip limpio por el conversor JSON a TOML. Si tu downstream necesita un Date de JavaScript, tendr\u00e1s que parsear la cadena all\u00ed, pero no se pierde informaci\u00f3n.",
        },
        {
          question: "\u00bfQu\u00e9 caracter\u00edsticas TOML pueden no hacer round-trip a JSON?",
          answer: "Los comentarios y el formato original (orden de claves en inline tables, cadenas literales frente a b\u00e1sicas) no se preservan — JSON no tiene ninguno. La distinci\u00f3n array-of-tables frente a inline tables colapsa en JSON (ambos se vuelven arrays de objetos). La precisi\u00f3n num\u00e9rica se preserva para enteros hasta 2^53 (el rango seguro de JSON); los enteros TOML m\u00e1s grandes se vuelven cadenas para evitar truncamiento silencioso.",
        },
      ],
    },
  },
  regex: {
    en: {
      faqs: [
        {
          question: "How do I test a regex online?",
          answer: "Open the JSONCraft regex tester, paste your pattern (without slashes or delimiters) into the pattern field, paste a sample string into the test input, and the tool highlights every match in real time. Toggle flags (g, i, m, s, u, y) with one click and read capture groups in the table below. Nothing is uploaded — the entire match runs in your browser using JavaScript's native RegExp engine, so you can paste production log lines or sensitive samples safely.",
        },
        {
          question: "How do I test a regex pattern?",
          answer: "Paste your pattern (without delimiters) and a test string; the tester compiles the regex with JavaScript's RegExp engine and highlights every match in the string, listing capture groups and named groups below. Flags g, i, m, s, u and y are toggleable. A replace field lets you preview substitution output live with $1, $<name> backreferences. Syntax errors are reported inline with the offending character position.",
        },
        {
          question: "Is the regex tester free?",
          answer: "Yes, completely free with no signup or query cap. Test as many patterns as you want — useful for debugging validation rules, scraping patterns or sed-style replacements. JSONCraft has a single open tier; the regex tester is as unrestricted as the formatter and diff.",
        },
        {
          question: "Does the regex tester upload my pattern or input?",
          answer: "No. Everything runs in your browser using the native RegExp engine. Nothing is transmitted — important because test strings often contain log excerpts, email addresses or other real data you're trying to pattern-match. You can paste production samples without leaking them.",
        },
        {
          question: "Does it support named capture groups and lookbehind?",
          answer: "Yes. Named groups (?<name>...) are supported and displayed by name in the match table. Lookahead (?=...) and negative lookahead (?!...) have always worked; lookbehind (?<=...) and negative lookbehind (?<!...) work in all modern browsers. Unicode property escapes like \\p{Emoji} work when the u flag is set. The engine is whatever ES2022-era JavaScript your browser ships.",
        },
        {
          question: "How is JavaScript regex different from PCRE or Python re?",
          answer: "Most syntax is shared, but JavaScript lacks some PCRE features: no possessive quantifiers, no recursive patterns, no atomic groups, no \\K. Inline modifiers like (?i) are not supported — flags go on the regex literal. Named groups use (?<name>...) syntax (same as .NET), not (?P<name>...) like Python. If you're porting a pattern, watch for these; most simple patterns transfer cleanly.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo probar regex online?",
          answer: "Abre el tester de regex de JSONCraft, pega tu patr\u00f3n (sin barras ni delimitadores) en el campo de patr\u00f3n, pega una cadena de muestra en el input de prueba y la herramienta resalta cada coincidencia en tiempo real. Conmuta flags (g, i, m, s, u, y) con un clic y lee los grupos de captura en la tabla. Nada se sube \u2014 todo el matching corre en tu navegador con el motor RegExp nativo de JavaScript, as\u00ed que puedes pegar l\u00edneas de log de producci\u00f3n o muestras sensibles sin riesgo.",
        },
        {
          question: "\u00bfC\u00f3mo pruebo un patr\u00f3n regex?",
          answer: "Pega tu patr\u00f3n (sin delimitadores) y una cadena de prueba; el tester compila el regex con el motor RegExp de JavaScript y resalta cada coincidencia en la cadena, listando grupos de captura y grupos nombrados debajo. Los flags g, i, m, s, u e y son conmutables. Un campo de reemplazo permite previsualizar la sustituci\u00f3n en vivo con retrorreferencias $1, $<name>. Los errores de sintaxis se reportan con la posici\u00f3n del car\u00e1cter.",
        },
        {
          question: "\u00bfEl tester regex es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de consultas. Prueba tantos patrones como quieras — \u00fatil para depurar reglas de validaci\u00f3n, patrones de scraping o reemplazos tipo sed. JSONCraft tiene un \u00fanico plan abierto; el tester regex no est\u00e1 m\u00e1s restringido que el formateador o el diff.",
        },
        {
          question: "\u00bfEl tester sube mi patr\u00f3n o entrada?",
          answer: "No. Todo corre en tu navegador usando el motor nativo RegExp. Nada se transmite — importante porque las cadenas de prueba suelen contener extractos de logs, direcciones de email u otros datos reales que intentas patr\u00f3n-matchear. Puedes pegar muestras de producci\u00f3n sin filtrarlas.",
        },
        {
          question: "\u00bfSoporta grupos nombrados y lookbehind?",
          answer: "S\u00ed. Los grupos nombrados (?<nombre>...) est\u00e1n soportados y se muestran por nombre en la tabla de coincidencias. El lookahead (?=...) y el lookahead negativo (?!...) siempre han funcionado; el lookbehind (?<=...) y el lookbehind negativo (?<!...) funcionan en todos los navegadores modernos. Los escapes Unicode como \\p{Emoji} funcionan con el flag u. El motor es el que provea tu JavaScript era ES2022.",
        },
        {
          question: "\u00bfEn qu\u00e9 se diferencia regex JavaScript de PCRE o Python re?",
          answer: "La mayor\u00eda de sintaxis es compartida, pero JavaScript carece de algunas caracter\u00edsticas de PCRE: sin cuantificadores posesivos, sin patrones recursivos, sin grupos at\u00f3micos, sin \\K. Los modificadores inline como (?i) no se soportan — los flags van en el literal regex. Los grupos nombrados usan (?<nombre>...) (como .NET), no (?P<nombre>...) como Python. Al portar un patr\u00f3n, ten cuidado con esto; la mayor\u00eda de patrones simples se transfieren limpiamente.",
        },
      ],
    },
  },
  base64: {
    en: {
      faqs: [
        {
          question: "How do I encode or decode base64?",
          answer: "Paste text or upload a file, pick encode or decode, and the tool runs the operation instantly. Encode converts text to base64 using UTF-8 by default; decode accepts both standard and URL-safe base64 (with - and _ instead of + and /) and auto-detects padding. For files, encoding produces a base64 string you can embed in data URLs or HTTP payloads; decoding a base64 string produces a downloadable binary.",
        },
        {
          question: "Is the base64 tool free?",
          answer: "Yes, fully free with no signup. Encode and decode unlimited text or files, any size your browser can hold in memory. JSONCraft has a single open tier across every tool; base64 is as unrestricted as the JSON formatter and converters. Useful for data URLs, JWTs, HTTP basic auth and email MIME payloads.",
        },
        {
          question: "Does the base64 tool upload my data?",
          answer: "No. All encoding and decoding happen in your browser. File uploads go through the FileReader API locally; text input never leaves the page. This is crucial for base64-encoded secrets — JWTs, API keys, certificate payloads — where you absolutely don't want the raw value hitting a third-party server.",
        },
        {
          question: "What's the difference between standard and URL-safe base64?",
          answer: "Standard base64 uses + and / and = padding, which breaks in URLs and filenames (they have reserved meanings). URL-safe base64 (RFC 4648 section 5) replaces + with - and / with _ and often drops padding. The tool encodes to standard by default with a toggle for URL-safe; the decoder auto-detects both so you can paste any variant.",
        },
        {
          question: "How does charset handling work for non-ASCII text?",
          answer: "Text is encoded as UTF-8 before base64, which is the modern standard. So encoding 'caf\u00e9' produces 'Y2Fmw6k=' (UTF-8 bytes), not a latin-1 variant. Decoding reverses this: base64 bytes are interpreted as UTF-8 text by default. If your input is known to be a different charset (rare today), decode as binary and convert the bytes yourself.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo codifico o decodifico base64?",
          answer: "Pega texto o sube un archivo, elige codificar o decodificar y la herramienta ejecuta la operaci\u00f3n al instante. Codificar convierte texto a base64 usando UTF-8 por defecto; decodificar acepta base64 est\u00e1ndar y URL-safe (con - y _ en vez de + y /) y autodetecta el padding. Para archivos, codificar produce una cadena base64 para data URLs o payloads HTTP; decodificar produce un binario descargable.",
        },
        {
          question: "\u00bfLa herramienta base64 es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Codifica y decodifica texto o archivos ilimitados, del tama\u00f1o que tu navegador pueda cargar en memoria. JSONCraft tiene un \u00fanico plan abierto en todas las herramientas; base64 no est\u00e1 m\u00e1s restringido que el formateador JSON. \u00datil para data URLs, JWTs, HTTP basic auth y payloads MIME de email.",
        },
        {
          question: "\u00bfLa herramienta base64 sube mis datos?",
          answer: "No. Toda la codificaci\u00f3n y decodificaci\u00f3n ocurren en tu navegador. Las subidas de archivo pasan por la FileReader API localmente; la entrada de texto nunca sale de la p\u00e1gina. Esto es cr\u00edtico para secretos en base64 — JWTs, claves API, payloads de certificado — donde no quieres que el valor bruto llegue a un servidor ajeno.",
        },
        {
          question: "\u00bfCu\u00e1l es la diferencia entre base64 est\u00e1ndar y URL-safe?",
          answer: "Base64 est\u00e1ndar usa + y / y padding =, que rompen en URLs y nombres de archivo (tienen significado reservado). URL-safe (RFC 4648 secci\u00f3n 5) reemplaza + por - y / por _ y a menudo quita el padding. La herramienta codifica a est\u00e1ndar por defecto con un toggle para URL-safe; el decodificador autodetecta ambos as\u00ed que puedes pegar cualquier variante.",
        },
        {
          question: "\u00bfC\u00f3mo se maneja el charset para texto no-ASCII?",
          answer: "El texto se codifica como UTF-8 antes de base64, el est\u00e1ndar moderno. As\u00ed codificar 'caf\u00e9' produce 'Y2Fmw6k=' (bytes UTF-8), no una variante latin-1. Decodificar invierte esto: los bytes base64 se interpretan como texto UTF-8 por defecto. Si sabes que tu entrada es otro charset (raro hoy), decodifica como binario y convierte los bytes t\u00fa mismo.",
        },
      ],
    },
  },
  "url-encode": {
    en: {
      faqs: [
        {
          question: "How do I URL-encode or decode a string?",
          answer: "Paste the string and pick encode or decode; the tool applies encodeURIComponent for encoding and decodeURIComponent for decoding. Every character that isn't a URL-safe unreserved character (letters, digits, -, _, ., ~) becomes percent-escaped (%20 for space, %3A for colon, %C3%A9 for \u00e9 as UTF-8). Decoding reverses this so you can read what a raw query string actually contains.",
        },
        {
          question: "Is the URL encoder free?",
          answer: "Yes, fully free, no signup, no usage cap. Encode and decode as many strings as you need — useful for building query parameters, inspecting redirect chains, debugging OAuth callback URLs. JSONCraft is free across every tool including this one; no premium feature gate applies.",
        },
        {
          question: "Does the URL encoder upload my input?",
          answer: "No. Encoding and decoding run in your browser using native JavaScript functions. Nothing is transmitted — useful because URLs often carry session tokens, signed query parameters or access tokens you don't want logged anywhere else. You can paste a production callback URL safely to inspect it.",
        },
        {
          question: "What's the difference between encodeURI and encodeURIComponent?",
          answer: "encodeURI encodes a full URL and leaves reserved URL characters alone (:, /, ?, #, =, &) because they have structural meaning. encodeURIComponent encodes every reserved character because it assumes you're encoding a single component (a query value, a path segment) that must not be mistaken for URL structure. This tool uses encodeURIComponent by default — the right choice when you're building one parameter at a time.",
        },
        {
          question: "When should I URL-encode versus HTML-encode?",
          answer: "URL-encode when the string is going into a URL (query string, path segment, data URL). HTML-encode when it's going into HTML markup (inside a tag or attribute) to prevent script injection. They are different escape layers — a value can need both if it's going into an HTML attribute that holds a URL. This tool handles the URL layer; HTML encoding is separate and uses &lt;, &gt;, &amp; etc.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo codifico o decodifico una URL?",
          answer: "Pega la cadena y elige codificar o decodificar; la herramienta aplica encodeURIComponent para codificar y decodeURIComponent para decodificar. Cada car\u00e1cter que no sea unreserved en URL (letras, d\u00edgitos, -, _, ., ~) se convierte en porcentaje (%20 para espacio, %3A para dos puntos, %C3%A9 para \u00e9 como UTF-8). Decodificar invierte esto para que veas lo que contiene realmente una query string cruda.",
        },
        {
          question: "\u00bfEl codificador URL es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de uso. Codifica y decodifica tantas cadenas como necesites — \u00fatil para construir par\u00e1metros de consulta, inspeccionar cadenas de redirecci\u00f3n o depurar callbacks de OAuth. JSONCraft es gratis en todas las herramientas, incluida esta; no hay muro de funciones premium.",
        },
        {
          question: "\u00bfEl codificador sube mi entrada?",
          answer: "No. Codificar y decodificar corren en tu navegador con funciones JavaScript nativas. Nada se transmite — \u00fatil porque las URLs llevan a menudo tokens de sesi\u00f3n, par\u00e1metros firmados o access tokens que no quieres loguear en otro sitio. Puedes pegar una URL de callback de producci\u00f3n con seguridad para inspeccionarla.",
        },
        {
          question: "\u00bfCu\u00e1l es la diferencia entre encodeURI y encodeURIComponent?",
          answer: "encodeURI codifica una URL completa y deja intactos los caracteres reservados (:, /, ?, #, =, &) porque tienen significado estructural. encodeURIComponent codifica todos los caracteres reservados porque asume que codificas un \u00fanico componente (un valor de query, un segmento de ruta) que no debe confundirse con estructura de URL. Esta herramienta usa encodeURIComponent por defecto — la opci\u00f3n correcta al construir un par\u00e1metro a la vez.",
        },
        {
          question: "\u00bfCu\u00e1ndo codificar URL frente a codificar HTML?",
          answer: "Codifica URL cuando la cadena va dentro de una URL (query string, segmento de ruta, data URL). Codifica HTML cuando va dentro de marcado HTML (dentro de una etiqueta o atributo) para prevenir inyecci\u00f3n. Son capas de escape distintas — un valor puede necesitar ambas si va en un atributo HTML que contiene una URL. Esta herramienta cubre la capa URL; la codificaci\u00f3n HTML va aparte y usa &lt;, &gt;, &amp;, etc.",
        },
      ],
    },
  },
  hash: {
    en: {
      faqs: [
        {
          question: "How do I compute a hash?",
          answer: "Paste text or upload a file, pick an algorithm (MD5, SHA-1, SHA-256, SHA-384, SHA-512), and the tool computes the digest using the browser's SubtleCrypto API (MD5 uses a JS shim since browsers dropped it). Output is lowercase hexadecimal by default with an option for uppercase. For files, the entire content is hashed byte-for-byte, matching what shasum or openssl dgst would produce on the same bytes.",
        },
        {
          question: "Is the hash tool free?",
          answer: "Yes, fully free with no signup. Hash unlimited text or files, any size your browser can load. JSONCraft is free across every tool; the hash tool has no rate limit or size cap beyond browser memory. Useful for verifying downloads, generating cache keys, building content-addressed identifiers or debugging signature mismatches.",
        },
        {
          question: "Does the hash tool upload my input?",
          answer: "No. All hashing runs in your browser via SubtleCrypto. Files are read with FileReader locally, never sent over the network. This matters when you're hashing a secret or a private document to produce a fingerprint; you get the same hex output a server-side tool would, without the data ever leaving your device.",
        },
        {
          question: "Which algorithm should I use?",
          answer: "SHA-256 is the safe default for new work — widely supported, fast and collision-resistant. SHA-384 and SHA-512 offer more output bits when you need them (e.g., HMAC with long keys). SHA-1 is deprecated for security but still appears in legacy systems (Git, old TLS). MD5 is broken cryptographically but fine for non-security checksums (CDN cache keys, file deduplication). The tool offers all five so you can match what your upstream expects.",
        },
        {
          question: "How does hashing text compare to hashing a file?",
          answer: "Text input is hashed as its UTF-8 byte representation. A file is hashed as its raw bytes — the exact content the file system stores. For a text file, encoding matters: a file saved as UTF-8 with BOM differs from UTF-8 without BOM and will hash differently. If you're verifying a download, always hash the file, not the text; copy-paste can silently change whitespace or encoding.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo calculo un hash?",
          answer: "Pega texto o sube un archivo, elige un algoritmo (MD5, SHA-1, SHA-256, SHA-384, SHA-512) y la herramienta calcula el digest usando la SubtleCrypto API del navegador (MD5 usa un shim JS porque los navegadores lo quitaron). La salida es hexadecimal en min\u00fasculas por defecto con opci\u00f3n a may\u00fasculas. Para archivos, todo el contenido se hashea byte a byte, coincidiendo con lo que producir\u00edan shasum u openssl dgst sobre los mismos bytes.",
        },
        {
          question: "\u00bfLa herramienta hash es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Hashea texto o archivos ilimitados, del tama\u00f1o que tu navegador pueda cargar. JSONCraft es gratis en todas las herramientas; la de hash no tiene l\u00edmite de frecuencia ni de tama\u00f1o m\u00e1s all\u00e1 de la memoria del navegador. \u00datil para verificar descargas, generar claves de cach\u00e9, construir identificadores content-addressed o depurar desajustes de firma.",
        },
        {
          question: "\u00bfLa herramienta hash sube mi entrada?",
          answer: "No. Todo el hashing corre en tu navegador v\u00eda SubtleCrypto. Los archivos se leen con FileReader localmente, nunca se env\u00edan por red. Esto importa cuando hasheas un secreto o un documento privado para obtener una huella; obtienes la misma salida hex que dar\u00eda una herramienta de servidor, sin que los datos salgan de tu dispositivo.",
        },
        {
          question: "\u00bfQu\u00e9 algoritmo usar?",
          answer: "SHA-256 es el valor por defecto seguro para trabajo nuevo — ampliamente soportado, r\u00e1pido y resistente a colisiones. SHA-384 y SHA-512 ofrecen m\u00e1s bits de salida cuando los necesites (ej. HMAC con claves largas). SHA-1 est\u00e1 deprecado para seguridad pero aparece en sistemas legacy (Git, TLS antiguo). MD5 est\u00e1 roto criptogr\u00e1ficamente pero sirve para checksums no-seguridad (claves de cach\u00e9 CDN, deduplicaci\u00f3n de archivos). La herramienta ofrece los cinco para que coincidas con lo que tu upstream espera.",
        },
        {
          question: "\u00bfC\u00f3mo se compara hashear texto con hashear un archivo?",
          answer: "La entrada de texto se hashea como su representaci\u00f3n en bytes UTF-8. Un archivo se hashea como sus bytes brutos — el contenido exacto que guarda el sistema de archivos. Para un archivo de texto, la codificaci\u00f3n importa: un archivo guardado UTF-8 con BOM difiere de UTF-8 sin BOM y dar\u00e1 hash distinto. Si verificas una descarga, hashea siempre el archivo, no el texto; copiar y pegar puede cambiar espacios o codificaci\u00f3n silenciosamente.",
        },
      ],
    },
  },
  uuid: {
    en: {
      faqs: [
        {
          question: "How do I generate a UUID?",
          answer: "Click generate and the tool produces a new RFC 4122 version 4 UUID instantly using the browser's crypto.randomUUID() — 122 bits of cryptographic randomness rendered as a hyphenated lowercase hex string in canonical 8-4-4-4-12 form. A bulk mode generates up to 1000 UUIDs at once, useful for seeding test data or fixtures. Options let you toggle uppercase or strip the dashes for the 32-character compact form.",
        },
        {
          question: "Is the UUID generator free?",
          answer: "Yes, completely free, no signup, no limit on how many UUIDs you generate. JSONCraft is free across every tool including this one. People run bulk generation all day for test fixtures, migration scripts and seed data; nothing is rate-limited because nothing touches a server.",
        },
        {
          question: "Does the UUID generator upload anything?",
          answer: "No. UUID generation is a pure local operation using the browser's crypto.randomUUID(). Nothing is transmitted, nothing is logged, and there is no server-side component. Since UUIDs are frequently used as primary keys, tokens, or correlation IDs that end up in databases and logs, keeping generation client-side means the values never transit a third party.",
        },
        {
          question: "When should I use UUID v4 vs something like v7 or ULID?",
          answer: "v4 (what this tool generates) is the safe default for most cases — no information leakage, fully random, globally unique with overwhelming probability. If you need monotonic, timestamp-ordered IDs for database primary keys (better insert locality on Postgres/MySQL B-trees), UUID v7 or ULID are preferable — they sort chronologically so inserts stay near the index tail. For ordering-insensitive workloads, stick with v4.",
        },
        {
          question: "What's the collision probability of UUID v4?",
          answer: "Astronomically small. A UUID v4 has 122 random bits, giving 2^122 (~5.3 \u00d7 10^36) possible values. To have a 50% chance of one collision you'd need to generate around 2^61 UUIDs — more than 2 billion per second for 36 years. For practical systems, treat collisions as impossible; no retry or uniqueness check is needed in normal workloads.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo genero un UUID?",
          answer: "Pulsa generar y la herramienta produce al instante un UUID versi\u00f3n 4 seg\u00fan RFC 4122 usando crypto.randomUUID() del navegador — 122 bits de aleatoriedad criptogr\u00e1fica renderizados como cadena hex en min\u00fasculas con guiones en forma can\u00f3nica 8-4-4-4-12. El modo masivo genera hasta 1000 UUIDs a la vez, \u00fatil para datos semilla o fixtures. Las opciones permiten alternar may\u00fasculas o eliminar los guiones para la forma compacta de 32 caracteres.",
        },
        {
          question: "\u00bfEl generador de UUID es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro, sin l\u00edmite de UUIDs generados. JSONCraft es gratis en todas las herramientas incluida esta. La gente ejecuta generaci\u00f3n masiva todo el d\u00eda para fixtures de test, scripts de migraci\u00f3n y datos semilla; no hay rate-limit porque nada llega a un servidor.",
        },
        {
          question: "\u00bfEl generador de UUID sube algo?",
          answer: "No. La generaci\u00f3n de UUID es una operaci\u00f3n puramente local usando crypto.randomUUID() del navegador. Nada se transmite, nada se registra y no hay componente de servidor. Dado que los UUIDs acaban con frecuencia como claves primarias, tokens o IDs de correlaci\u00f3n en bases de datos y logs, mantener la generaci\u00f3n en cliente asegura que los valores no pasen nunca por un tercero.",
        },
        {
          question: "\u00bfCu\u00e1ndo usar UUID v4 frente a v7 o ULID?",
          answer: "v4 (lo que genera esta herramienta) es el valor por defecto seguro para la mayor\u00eda de casos — sin fuga de informaci\u00f3n, totalmente aleatorio, globalmente \u00fanico con probabilidad abrumadora. Si necesitas IDs mon\u00f3tonos ordenados por tiempo para claves primarias (mejor localidad de inserts en B-trees de Postgres/MySQL), UUID v7 o ULID son preferibles — ordenan cronol\u00f3gicamente, as\u00ed los inserts se quedan cerca del final del \u00edndice. Para cargas insensibles al orden, qu\u00e9date con v4.",
        },
        {
          question: "\u00bfCu\u00e1l es la probabilidad de colisi\u00f3n de UUID v4?",
          answer: "Astron\u00f3micamente peque\u00f1a. Un UUID v4 tiene 122 bits aleatorios, dando 2^122 (~5.3 \u00d7 10^36) valores posibles. Para tener un 50% de probabilidad de una colisi\u00f3n necesitar\u00edas generar unos 2^61 UUIDs — m\u00e1s de 2000 millones por segundo durante 36 a\u00f1os. Para sistemas pr\u00e1cticos, trata las colisiones como imposibles; no hace falta reintento ni comprobaci\u00f3n de unicidad en cargas normales.",
        },
      ],
    },
  },
  timestamp: {
    en: {
      faqs: [
        {
          question: "How do I convert between Unix epoch and ISO 8601?",
          answer: "Paste a Unix timestamp (seconds or milliseconds) and the tool converts it to ISO 8601 in UTC plus your local timezone. Or paste an ISO 8601 string (2026-04-16T12:00:00Z) and it converts back to epoch. Millisecond precision is preserved both directions. The tool auto-detects whether your input is seconds (10 digits) or milliseconds (13 digits) so you don't have to pick.",
        },
        {
          question: "Is the timestamp converter free?",
          answer: "Yes, fully free, no signup, no usage cap. Convert as many timestamps as you like — useful for log analysis, database debugging, API payload inspection. JSONCraft has a single open tier across every tool; the timestamp converter is as unrestricted as the rest.",
        },
        {
          question: "Does the timestamp converter upload my input?",
          answer: "No. Conversions run in your browser using native Date math and Intl.DateTimeFormat. Nothing is transmitted — relevant because log timestamps often come alongside user IDs, trace IDs or request bodies you're debugging. You can paste whole log lines to extract and convert the timestamp without leaking the surrounding context.",
        },
        {
          question: "How are timezones handled?",
          answer: "Unix epoch is timezone-agnostic (always UTC). ISO 8601 output shows both UTC (with Z suffix) and your browser's local timezone with the offset (-05:00, +01:00). You can also pick a specific timezone from a dropdown to convert into, which is handy when scheduling or debugging across regions. Millisecond values round-trip exactly; sub-millisecond precision is truncated (JavaScript Date's limit).",
        },
        {
          question: "What's the difference between seconds and milliseconds in epoch time?",
          answer: "Unix tradition (C time_t, most shell tools) uses seconds since 1970-01-01 UTC — 10-digit values in current era. JavaScript, Java and most modern APIs use milliseconds — 13-digit values. Mixing them is a common bug: a seconds timestamp interpreted as milliseconds yields a date in 1970; milliseconds as seconds yields a date in the year 33,658. The tool auto-detects based on magnitude to avoid this.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto entre Unix epoch e ISO 8601?",
          answer: "Pega un timestamp Unix (segundos o milisegundos) y la herramienta lo convierte a ISO 8601 en UTC m\u00e1s tu zona horaria local. O pega una cadena ISO 8601 (2026-04-16T12:00:00Z) y la convierte de vuelta a epoch. La precisi\u00f3n en milisegundos se preserva en ambas direcciones. La herramienta autodetecta si tu entrada son segundos (10 d\u00edgitos) o milisegundos (13 d\u00edgitos) para que no tengas que elegir.",
        },
        {
          question: "\u00bfEl conversor de timestamp es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de uso. Convierte tantos timestamps como quieras — \u00fatil para an\u00e1lisis de logs, depuraci\u00f3n de base de datos, inspecci\u00f3n de payloads API. JSONCraft tiene un \u00fanico plan abierto en todas las herramientas; el conversor de timestamp est\u00e1 tan sin restricciones como el resto.",
        },
        {
          question: "\u00bfEl conversor sube mi entrada?",
          answer: "No. Las conversiones corren en tu navegador con Date nativo e Intl.DateTimeFormat. Nada se transmite — relevante porque los timestamps de log suelen venir junto a IDs de usuario, trace IDs o cuerpos de petici\u00f3n que est\u00e1s depurando. Puedes pegar l\u00edneas de log enteras para extraer y convertir el timestamp sin filtrar el contexto.",
        },
        {
          question: "\u00bfC\u00f3mo se manejan las zonas horarias?",
          answer: "Unix epoch es agn\u00f3stico a zona horaria (siempre UTC). La salida ISO 8601 muestra tanto UTC (sufijo Z) como tu zona horaria local con el offset (-05:00, +01:00). Tambi\u00e9n puedes elegir una zona espec\u00edfica de un desplegable para convertir, \u00fatil al programar o depurar entre regiones. Los valores en milisegundos hacen round-trip exacto; la precisi\u00f3n sub-milisegundo se trunca (l\u00edmite de Date en JavaScript).",
        },
        {
          question: "\u00bfCu\u00e1l es la diferencia entre segundos y milisegundos en epoch?",
          answer: "La tradici\u00f3n Unix (time_t de C, la mayor\u00eda de herramientas de shell) usa segundos desde 1970-01-01 UTC — valores de 10 d\u00edgitos en la era actual. JavaScript, Java y la mayor\u00eda de APIs modernas usan milisegundos — valores de 13 d\u00edgitos. Mezclarlos es un bug com\u00fan: un timestamp de segundos interpretado como milisegundos da una fecha en 1970; milisegundos como segundos da una fecha en el a\u00f1o 33.658. La herramienta autodetecta por magnitud para evitarlo.",
        },
      ],
    },
  },
  cron: {
    en: {
      faqs: [
        {
          question: "How do I read a cron expression?",
          answer: "Paste a 5-field cron expression (minute, hour, day-of-month, month, day-of-week) and the tool emits a human-readable description and the next 5 scheduled run times in your local timezone. It supports standard operators — *, */n, a-b, a,b,c — and the common aliases @hourly, @daily, @weekly, @monthly, @yearly. Syntax errors are flagged with the field and reason so you can fix them immediately.",
        },
        {
          question: "Is the cron parser free?",
          answer: "Yes, fully free with no signup. Parse unlimited expressions — handy when migrating schedulers, reviewing infrastructure-as-code, or making sure a \"0 2 * * *\" really does mean 2 AM. JSONCraft is free across every tool; the cron parser matches the rest with no gated features.",
        },
        {
          question: "Does the cron parser upload my expression?",
          answer: "No. Parsing runs entirely in your browser. Nothing is transmitted or logged. Cron expressions rarely contain secrets themselves but often appear next to job names that reveal internal architecture; keeping them local is always the safer default.",
        },
        {
          question: "Does it support aliases and extended syntax?",
          answer: "Standard aliases (@hourly, @daily, @weekly, @monthly, @yearly, @annually, @reboot) are recognized. The parser covers classic Unix 5-field cron; 6-field (with seconds, used by Quartz and Kubernetes CronJob in some variants) and 7-field (with year) are not standard and are not parsed. Day-of-week uses 0-6 where 0 is Sunday, matching most Unix crontabs.",
        },
        {
          question: "When are day-of-month and day-of-week both restricted?",
          answer: "A classic gotcha: when both day-of-month and day-of-week are restricted (not *), cron treats them with OR — the job runs if either condition matches, not both. So '0 0 1 * 1' runs every 1st of the month AND every Monday. The parser spells this out in the human-readable description so you don't get bitten by the OR versus AND confusion.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo leo una expresi\u00f3n cron?",
          answer: "Pega una expresi\u00f3n cron de 5 campos (minuto, hora, d\u00eda del mes, mes, d\u00eda de la semana) y la herramienta emite una descripci\u00f3n legible y las pr\u00f3ximas 5 ejecuciones en tu zona horaria local. Soporta los operadores est\u00e1ndar — *, */n, a-b, a,b,c — y los alias comunes @hourly, @daily, @weekly, @monthly, @yearly. Los errores de sintaxis se marcan con el campo y la raz\u00f3n para que los corrijas al instante.",
        },
        {
          question: "\u00bfEl parser de cron es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Parsea expresiones ilimitadas — \u00fatil al migrar schedulers, revisar infraestructura como c\u00f3digo o asegurarte de que \"0 2 * * *\" realmente significa 2 AM. JSONCraft es gratis en todas las herramientas; el parser cron va en l\u00ednea con el resto, sin funciones cerradas.",
        },
        {
          question: "\u00bfEl parser cron sube mi expresi\u00f3n?",
          answer: "No. El parseo corre \u00edntegramente en tu navegador. Nada se transmite ni registra. Las expresiones cron rara vez contienen secretos, pero a menudo aparecen junto a nombres de job que revelan arquitectura interna; mantenerlas locales es siempre la opci\u00f3n m\u00e1s segura.",
        },
        {
          question: "\u00bfSoporta alias y sintaxis extendida?",
          answer: "Los alias est\u00e1ndar (@hourly, @daily, @weekly, @monthly, @yearly, @annually, @reboot) se reconocen. El parser cubre cron Unix cl\u00e1sico de 5 campos; el de 6 campos (con segundos, usado por Quartz y algunas variantes de CronJob de Kubernetes) y el de 7 (con a\u00f1o) no son est\u00e1ndar y no se parsean. El d\u00eda de la semana usa 0-6 con 0 como domingo, como la mayor\u00eda de crontabs Unix.",
        },
        {
          question: "\u00bfQu\u00e9 pasa cuando d\u00eda del mes y d\u00eda de semana est\u00e1n ambos restringidos?",
          answer: "Un gotcha cl\u00e1sico: cuando ambos est\u00e1n restringidos (no *), cron los trata con OR — el job corre si cualquiera coincide, no ambos. As\u00ed '0 0 1 * 1' corre cada d\u00eda 1 del mes Y cada lunes. El parser lo deja claro en la descripci\u00f3n legible para que no te pille la confusi\u00f3n OR frente a AND.",
        },
      ],
    },
  },
  "json-to-typescript": {
    en: {
      faqs: [
        {
          question: "How do I generate TypeScript types from JSON?",
          answer: "Paste a JSON sample and the tool infers the shape and emits TypeScript interface declarations. Each object becomes an interface, nested objects become nested interfaces (with auto-generated names), and arrays are typed as T[]. Optional fields are detected when the tool sees the same key present in some objects and absent in others across an array of samples. Mixed-type arrays become union types like (string | number)[].",
        },
        {
          question: "Is the JSON to TypeScript converter free?",
          answer: "Yes, completely free with no signup. Generate as many interfaces as you need — useful when an API has no published types and you want to bootstrap a typed client. JSONCraft has no premium tier; every tool is unrestricted. Copy the generated interfaces straight into your project.",
        },
        {
          question: "Does the converter upload my JSON?",
          answer: "No. Inference and code generation run entirely in your browser. Nothing is sent anywhere, which matters because API responses that you'd want to type often include real data — user IDs, tokens, internal URLs. You can paste production samples safely to generate interfaces for them.",
        },
        {
          question: "How are optional fields and unions detected?",
          answer: "Pass an array of samples (not a single object) and the tool compares keys across items: keys present in all items are required, keys present in some are marked optional with ?. For primitive values that vary in type across samples (number sometimes, null sometimes), you get a union like number | null. For arrays containing mixed types, you get a union inside the array. A single sample yields all-required interfaces, so always paste arrays when possible.",
        },
        {
          question: "Should I use interfaces or type aliases?",
          answer: "The tool emits interfaces by default because they are declaration-merged (you can reopen them later) and produce clearer tsc error messages. For union-heavy or mapped shapes, a type alias is more flexible. The practical advice: generate interfaces here, then rename or switch to type where your codebase conventions call for it. Both compile to identical runtime (nothing — TypeScript types are erased).",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo genero tipos TypeScript desde JSON?",
          answer: "Pega una muestra JSON y la herramienta infiere la forma y emite declaraciones de interface TypeScript. Cada objeto se vuelve una interface, los objetos anidados se vuelven interfaces anidadas (con nombres autogenerados) y los arrays se tipan como T[]. Los campos opcionales se detectan cuando la herramienta ve la misma clave presente en algunos objetos y ausente en otros dentro de un array de muestras. Los arrays de tipos mixtos se vuelven uniones como (string | number)[].",
        },
        {
          question: "\u00bfEl conversor JSON a TypeScript es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Genera tantas interfaces como necesites — \u00fatil cuando una API no tiene tipos publicados y quieres arrancar un cliente tipado. JSONCraft no tiene plan premium; cada herramienta no tiene restricciones. Copia las interfaces generadas directamente a tu proyecto.",
        },
        {
          question: "\u00bfEl conversor sube mi JSON?",
          answer: "No. La inferencia y la generaci\u00f3n de c\u00f3digo corren \u00edntegramente en tu navegador. Nada se env\u00eda a ning\u00fan sitio, algo que importa porque las respuestas API que querr\u00edas tipar incluyen a menudo datos reales — IDs de usuario, tokens, URLs internas. Puedes pegar muestras de producci\u00f3n con seguridad para generar interfaces.",
        },
        {
          question: "\u00bfC\u00f3mo se detectan campos opcionales y uniones?",
          answer: "Pasa un array de muestras (no un \u00fanico objeto) y la herramienta compara claves entre items: las claves presentes en todos son requeridas, las que est\u00e1n en algunos se marcan opcionales con ?. Para valores primitivos que var\u00edan de tipo entre muestras (a veces n\u00famero, a veces null), obtienes una uni\u00f3n como number | null. Para arrays con tipos mixtos, obtienes una uni\u00f3n dentro del array. Una sola muestra da interfaces con todo requerido, as\u00ed que pega arrays siempre que puedas.",
        },
        {
          question: "\u00bfUsar interface o type alias?",
          answer: "La herramienta emite interfaces por defecto porque se pueden fusionar por declaraci\u00f3n (las puedes reabrir despu\u00e9s) y producen mensajes de error m\u00e1s claros en tsc. Para formas con muchas uniones o mapped types, un type alias es m\u00e1s flexible. Consejo pr\u00e1ctico: genera interfaces aqu\u00ed y luego renombra o pasa a type donde tus convenciones de c\u00f3digo lo pidan. Ambas compilan a lo mismo en runtime (nada — los tipos de TypeScript se borran).",
        },
      ],
    },
  },
  "xml-formatter": {
    en: {
      faqs: [
        {
          question: "How do I format or minify XML?",
          answer: "Paste XML and the tool parses it, validates well-formedness, and pretty-prints with configurable indent. Attributes stay on their opening tags, self-closing tags are preserved, and CDATA sections are left untouched. A minify mode strips all inter-tag whitespace for network transport. Parse errors are reported with line and column position so you can find an unclosed tag or bad attribute quickly.",
        },
        {
          question: "Is the XML formatter free?",
          answer: "Yes, fully free with no signup or size cap beyond browser memory. Format or minify as often as you need — useful for SOAP payloads, RSS feeds, SVG files and Android layouts. JSONCraft is free across every tool including this one; no premium gate applies.",
        },
        {
          question: "Does the XML formatter upload my input?",
          answer: "No. Parsing and formatting run entirely in your browser using the native DOMParser. Nothing is transmitted, which is important because XML payloads often carry SOAP headers with auth tokens or API credentials. You can format production samples safely without leaking anything.",
        },
        {
          question: "How are CDATA sections and attributes handled?",
          answer: "CDATA content is preserved verbatim — no reformatting, no escaping changes — because changing it would break consumers that treat it as opaque data. Attributes stay on the opening tag in original order by default, with an option to sort alphabetically for diff-friendly output. Entity references (&amp;, &lt;, etc.) are kept as-is, not expanded. Declarations like <?xml version=\"1.0\"?> and DOCTYPE are preserved on the first line.",
        },
        {
          question: "Does it validate against a schema (XSD/DTD)?",
          answer: "No, the tool validates well-formedness (balanced tags, quoted attributes, valid entities) but not conformance to a schema. That's intentional — most users want quick structural checking, not a full XSD engine in the browser. For schema validation, use a dedicated XML tool or xmllint locally. The formatter is the right choice for indent/minify/lint; schema validation is a different workflow.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo formateo o minifico XML?",
          answer: "Pega XML y la herramienta lo parsea, valida que est\u00e9 bien formado y lo embellece con indentaci\u00f3n configurable. Los atributos quedan en su etiqueta de apertura, las etiquetas auto-cerradas se preservan y las secciones CDATA quedan intactas. Un modo minify quita todo el espacio entre etiquetas para transporte en red. Los errores de parseo se reportan con l\u00ednea y columna para que encuentres r\u00e1pido una etiqueta sin cerrar o un atributo mal.",
        },
        {
          question: "\u00bfEl formateador XML es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni tope de tama\u00f1o m\u00e1s all\u00e1 de la memoria del navegador. Formatea o minifica cuantas veces necesites — \u00fatil para payloads SOAP, feeds RSS, archivos SVG y layouts Android. JSONCraft es gratis en todas las herramientas incluida esta; no hay muro premium.",
        },
        {
          question: "\u00bfEl formateador XML sube mi entrada?",
          answer: "No. Parseo y formateo corren \u00edntegramente en tu navegador con el DOMParser nativo. Nada se transmite, importante porque los payloads XML llevan a menudo cabeceras SOAP con tokens de auth o credenciales API. Puedes formatear muestras de producci\u00f3n con seguridad sin filtrar nada.",
        },
        {
          question: "\u00bfC\u00f3mo se manejan CDATA y atributos?",
          answer: "El contenido CDATA se preserva al pie de la letra — sin reformatear, sin cambios de escape — porque cambiarlo romper\u00eda a consumidores que lo tratan como datos opacos. Los atributos quedan en la etiqueta de apertura en su orden original por defecto, con opci\u00f3n de ordenar alfab\u00e9ticamente para salida diff-friendly. Las referencias a entidades (&amp;, &lt;, etc.) se mantienen, no se expanden. Las declaraciones como <?xml version=\"1.0\"?> y DOCTYPE se preservan en la primera l\u00ednea.",
        },
        {
          question: "\u00bfValida contra un esquema (XSD/DTD)?",
          answer: "No, la herramienta valida que est\u00e9 bien formado (etiquetas balanceadas, atributos entrecomillados, entidades v\u00e1lidas) pero no conformidad con un esquema. Es intencional — la mayor\u00eda quiere revisi\u00f3n estructural r\u00e1pida, no un motor XSD completo en el navegador. Para validaci\u00f3n de esquema usa una herramienta XML dedicada o xmllint en local. El formateador es la opci\u00f3n correcta para indentar/minificar/validar; la validaci\u00f3n contra esquema es otro flujo.",
        },
      ],
    },
  },
  "json-to-html-table": {
    en: {
      faqs: [
        {
          question: "How do I convert JSON to an HTML table?",
          answer: "Paste a JSON array of objects and the tool produces a <table> with headers from the union of all keys across rows, and one <tr> per object. Nested objects are flattened with dot-notation column names (user.email), arrays of primitives are joined with commas, and arrays of objects are rendered as comma-separated summaries. The output is semantic HTML ready to paste into a page, email or documentation.",
        },
        {
          question: "Is the JSON to HTML table converter free?",
          answer: "Yes, completely free, no signup, no row limit beyond browser memory. Convert as often as you need — useful for quick reports, blog post tables, dashboards, documentation. JSONCraft has a single open tier across every tool; this converter has no premium features to unlock.",
        },
        {
          question: "Does the converter upload my JSON?",
          answer: "No. Parsing and HTML generation run entirely in your browser. Nothing is transmitted — relevant because the JSON often contains customer data, analytics or reports you're building internally. You can generate the HTML, review it, and paste the result wherever you need without any data reaching a server.",
        },
        {
          question: "How does it handle objects with different keys?",
          answer: "The tool takes the union of all keys across all objects as column headers, so if item 1 has {a, b} and item 2 has {a, c}, the table has columns a, b, c. Missing values render as empty cells (not 'undefined' or 'null'). This is the common friendly behavior for heterogeneous API responses — it shows you both the shared and varying fields without hiding either.",
        },
        {
          question: "Should the HTML include inline styles?",
          answer: "The output is semantic HTML only — <table>, <thead>, <tbody>, <tr>, <th>, <td> — with no inline styles or classes. That keeps it portable: paste into a styled page and it inherits the host CSS, paste into a plain email and it still makes sense. If you need styling, wrap the table in a class yourself or use a pre-built table CSS. Semantic first is the right default for an export tool.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo convierto JSON a tabla HTML?",
          answer: "Pega un array JSON de objetos y la herramienta produce una <table> con cabeceras de la uni\u00f3n de todas las claves entre filas, y un <tr> por objeto. Los objetos anidados se aplanan con nombres de columna en notaci\u00f3n de puntos (user.email), los arrays de primitivos se unen con comas y los arrays de objetos se muestran como res\u00famenes separados por comas. La salida es HTML sem\u00e1ntico listo para pegar en una p\u00e1gina, email o documentaci\u00f3n.",
        },
        {
          question: "\u00bfEl conversor JSON a tabla HTML es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de filas m\u00e1s all\u00e1 de la memoria del navegador. Convierte cuantas veces necesites — \u00fatil para informes r\u00e1pidos, tablas de blog, dashboards, documentaci\u00f3n. JSONCraft tiene un \u00fanico plan abierto en todas las herramientas; este conversor no tiene funciones premium que desbloquear.",
        },
        {
          question: "\u00bfEl conversor sube mi JSON?",
          answer: "No. El parseo y la generaci\u00f3n HTML corren \u00edntegramente en tu navegador. Nada se transmite — relevante porque el JSON lleva a menudo datos de cliente, anal\u00edtica o informes que construyes internamente. Puedes generar el HTML, revisarlo y pegarlo donde necesites sin que ning\u00fan dato llegue a un servidor.",
        },
        {
          question: "\u00bfC\u00f3mo maneja objetos con claves distintas?",
          answer: "La herramienta toma la uni\u00f3n de todas las claves entre todos los objetos como cabeceras, as\u00ed que si el item 1 tiene {a, b} y el item 2 tiene {a, c}, la tabla tiene columnas a, b, c. Los valores ausentes se muestran como celdas vac\u00edas (no 'undefined' ni 'null'). Es el comportamiento amable habitual para respuestas API heterog\u00e9neas — te ense\u00f1a tanto los campos compartidos como los variables sin ocultar ninguno.",
        },
        {
          question: "\u00bfEl HTML deber\u00eda incluir estilos inline?",
          answer: "La salida es HTML sem\u00e1ntico puro — <table>, <thead>, <tbody>, <tr>, <th>, <td> — sin estilos inline ni clases. Eso lo hace port\u00e1til: pegado en una p\u00e1gina con estilos hereda el CSS del host, pegado en un email plano sigue teniendo sentido. Si necesitas estilos, envuelve la tabla en una clase o usa un CSS de tabla prefabricado. Semantic-first es el valor por defecto correcto para una herramienta de export.",
        },
      ],
    },
  },
  "yaml-validator": {
    en: {
      faqs: [
        {
          question: "How do I validate YAML syntax?",
          answer: "Paste a YAML document and the validator parses it with a YAML 1.2-compliant parser and reports any syntax errors with line and column numbers. Common issues like inconsistent indentation, unclosed flow sequences, tab characters where spaces are required and bad anchor references are flagged with a human-readable reason. If the document is valid, you get a green check plus a count of keys and depth.",
        },
        {
          question: "Is the YAML validator free?",
          answer: "Yes, fully free with no signup. Validate unlimited documents — Kubernetes manifests, GitHub Actions workflows, Ansible playbooks, docker-compose files. JSONCraft is free across every tool including this one; no premium tier gating rules. Useful in a pre-commit workflow or during review of config PRs.",
        },
        {
          question: "Does the validator upload my YAML?",
          answer: "No. Validation runs entirely in your browser. Nothing is transmitted — crucial for YAML files that contain secrets, TLS certificates or cluster endpoints. You can validate a sealed-secrets.yaml before applying it without any byte leaving your machine; there is no history, no account and no logging.",
        },
        {
          question: "What YAML spec does it validate against?",
          answer: "YAML 1.2, the current standard. It accepts 1.2's stricter rules (no more 'no' parsing as false by default, explicit nulls, fewer implicit typings) and flags the common YAML 1.1 habits that 1.2 rejects. Tab characters in indentation are an error regardless of version (YAML forbids tabs for indent). Custom tags beyond the core schema are allowed syntactically but not type-checked.",
        },
        {
          question: "Does validation check schema or just syntax?",
          answer: "This validator checks YAML syntax only — is the document a well-formed YAML parse tree? It does not know whether keys and values match an expected schema (a Kubernetes Pod spec, a GitHub Actions workflow). For that, use a schema-aware linter like kubeval, actionlint or the JSON Schema validator tool. Syntax validation here is the fast first gate; schema validation is the deeper second pass.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo valido sintaxis YAML?",
          answer: "Pega un documento YAML y el validador lo parsea con un parser compatible con YAML 1.2 y reporta errores de sintaxis con n\u00famero de l\u00ednea y columna. Problemas comunes como indentaci\u00f3n inconsistente, secuencias flow sin cerrar, tabulaciones donde deber\u00eda haber espacios y referencias de ancla mal se marcan con raz\u00f3n legible. Si el documento es v\u00e1lido, ves una marca verde y un conteo de claves y profundidad.",
        },
        {
          question: "\u00bfEl validador YAML es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro. Valida documentos ilimitados — manifiestos Kubernetes, workflows de GitHub Actions, playbooks de Ansible, docker-compose. JSONCraft es gratis en todas las herramientas incluida esta; sin plan premium cerrando reglas. \u00datil en un flujo pre-commit o durante revisi\u00f3n de PRs de configuraci\u00f3n.",
        },
        {
          question: "\u00bfEl validador sube mi YAML?",
          answer: "No. La validaci\u00f3n corre \u00edntegramente en tu navegador. Nada se transmite — crucial para archivos YAML que contengan secretos, certificados TLS o endpoints de cluster. Puedes validar un sealed-secrets.yaml antes de aplicarlo sin que ning\u00fan byte salga de tu m\u00e1quina; no hay historial, cuenta ni logs.",
        },
        {
          question: "\u00bfContra qu\u00e9 versi\u00f3n de YAML valida?",
          answer: "YAML 1.2, el est\u00e1ndar actual. Acepta las reglas m\u00e1s estrictas de 1.2 (ya no se parsea 'no' como false por defecto, nulls expl\u00edcitos, menos tipados impl\u00edcitos) y marca los h\u00e1bitos comunes de YAML 1.1 que 1.2 rechaza. Las tabulaciones en indentaci\u00f3n son error sea cual sea la versi\u00f3n (YAML proh\u00edbe tabs para indent). Las etiquetas personalizadas fuera del core schema se permiten sint\u00e1cticamente pero no se tipan.",
        },
        {
          question: "\u00bfValida esquema o solo sintaxis?",
          answer: "Este validador solo comprueba sintaxis YAML — \u00bfes el documento un \u00e1rbol YAML bien formado? No sabe si claves y valores coinciden con un esquema esperado (un Pod spec de Kubernetes, un workflow de GitHub Actions). Para eso, usa un linter con esquema como kubeval, actionlint o la herramienta JSON Schema validator. La validaci\u00f3n de sintaxis aqu\u00ed es la primera puerta r\u00e1pida; la validaci\u00f3n de esquema es el segundo paso m\u00e1s profundo.",
        },
      ],
    },
  },
  "json-schema-validator": {
    en: {
      faqs: [
        {
          question: "How do I validate JSON against a JSON Schema?",
          answer: "Paste the schema on one side and the data on the other; the validator runs the data against the schema (draft-07 by default) and reports every violation with a JSON Pointer path, the failing keyword (type, required, minLength, pattern, etc.) and a human-readable reason. If the data is valid, you get a green check. Both inputs are live — editing either re-runs validation instantly.",
        },
        {
          question: "Is the JSON Schema validator free?",
          answer: "Yes, fully free with no signup or usage cap. Validate unlimited documents against unlimited schemas — useful for API contract testing, OpenAPI spec validation, config linting and CI pipelines. JSONCraft has a single open tier; every tool including this one is fully available with no premium features behind a gate.",
        },
        {
          question: "Does the validator upload my schema or data?",
          answer: "No. Validation runs entirely in your browser using a client-side JSON Schema implementation. Nothing is sent anywhere, which matters because schemas often describe internal data models (user records, payment payloads) and the sample data often is real production output. You can validate safely without any data or schema structure leaking.",
        },
        {
          question: "Does it support $ref and remote schemas?",
          answer: "Local $ref to other definitions in the same schema works out of the box — use $ref: \"#/definitions/Foo\" style pointers. Remote $ref to external URLs is intentionally not fetched — that would require a network call and the tool is strictly client-side. If your schema uses external $ref, inline those definitions into a single combined schema before validating here.",
        },
        {
          question: "Which draft of JSON Schema does it support?",
          answer: "Draft-07 is the default because it has the widest tool support and is what most OpenAPI 3.0 specs use. Later drafts (2019-09, 2020-12) introduced significant changes like $defs replacing definitions and unevaluatedProperties; if your schema uses those keywords explicitly, targeting draft-07 will be stricter about unknown keywords. For pure draft-07 data/schema pairs, the validator is 100% spec-compliant.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "\u00bfC\u00f3mo valido JSON contra un JSON Schema?",
          answer: "Pega el esquema a un lado y los datos al otro; el validador ejecuta los datos contra el esquema (draft-07 por defecto) y reporta cada violaci\u00f3n con una ruta JSON Pointer, la palabra clave que falla (type, required, minLength, pattern, etc.) y una raz\u00f3n legible. Si los datos son v\u00e1lidos, marca verde. Ambas entradas son en vivo — al editar cualquiera se re-ejecuta la validaci\u00f3n al instante.",
        },
        {
          question: "\u00bfEl validador de JSON Schema es gratis?",
          answer: "S\u00ed, totalmente gratis, sin registro ni l\u00edmite de uso. Valida documentos ilimitados contra esquemas ilimitados — \u00fatil para testing de contratos de API, validaci\u00f3n de OpenAPI, linting de configuraci\u00f3n y pipelines CI. JSONCraft tiene un \u00fanico plan abierto; cada herramienta incluida esta est\u00e1 disponible sin funciones premium tras un muro.",
        },
        {
          question: "\u00bfEl validador sube mi esquema o datos?",
          answer: "No. La validaci\u00f3n corre \u00edntegramente en tu navegador con una implementaci\u00f3n de JSON Schema cliente. Nada se env\u00eda a ning\u00fan sitio, importante porque los esquemas describen a menudo modelos de datos internos (registros de usuario, payloads de pago) y la muestra suele ser salida real de producci\u00f3n. Puedes validar con seguridad sin que se filtren datos ni estructura.",
        },
        {
          question: "\u00bfSoporta $ref y esquemas remotos?",
          answer: "Las $ref locales a otras definiciones del mismo esquema funcionan directo — usa punteros estilo $ref: \"#/definitions/Foo\". Las $ref remotas a URLs externas no se descargan intencionalmente — requerir\u00eda llamada de red y la herramienta es estrictamente cliente. Si tu esquema usa $ref externa, inlinea esas definiciones en un \u00fanico esquema combinado antes de validar aqu\u00ed.",
        },
        {
          question: "\u00bfQu\u00e9 draft de JSON Schema soporta?",
          answer: "Draft-07 es el valor por defecto porque tiene el soporte de herramientas m\u00e1s amplio y es lo que usan la mayor\u00eda de specs OpenAPI 3.0. Drafts posteriores (2019-09, 2020-12) introdujeron cambios significativos como $defs reemplazando a definitions y unevaluatedProperties; si tu esquema usa esas palabras expl\u00edcitamente, apuntar a draft-07 ser\u00e1 m\u00e1s estricto sobre palabras clave desconocidas. Para pares datos/esquema puramente draft-07, el validador es 100% conforme a la spec.",
        },
      ],
    },
  },
};
