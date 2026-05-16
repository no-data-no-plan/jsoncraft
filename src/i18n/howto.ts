import type { Lang } from "./index";

/**
 * HowTo schema step definitions per tool. Each tool gets 4-5 steps in both
 * English and Spanish. Emitted as JSON-LD HowTo schema from Layout.astro for
 * tool pages — eligible for Google HowTo rich results (text-only snippet
 * since Google deprecated the visual snippet on mobile in 2023).
 *
 * Structure: `howtoSteps[toolId][lang]` = { name, steps: [{ name, text }] }
 */

export interface HowToStep {
  name: string;
  text: string;
}

export interface ToolHowTo {
  name: string;
  steps: HowToStep[];
}

type HowToByLang = Record<Lang, ToolHowTo>;

export const howtoSteps: Record<string, HowToByLang> = {
  formatter: {
    en: {
      name: "How to Format and Validate JSON",
      steps: [
        { name: "Paste your JSON", text: "Paste your raw JSON into the editor or drop a .json file onto the page." },
        { name: "Review errors", text: "JSONCraft highlights syntax errors with the exact line and column of any issue." },
        { name: "Choose indentation", text: "Pick 2 spaces, 4 spaces, or tabs for the output format." },
        { name: "Beautify or minify", text: "Click Beautify for formatted output or Minify to strip whitespace for production." },
        { name: "Copy or download", text: "Copy the result to clipboard or download as a .json file." },
      ],
    },
    es: {
      name: "Cómo formatear y validar JSON",
      steps: [
        { name: "Pega tu JSON", text: "Pega tu JSON en el editor o suelta un archivo .json sobre la página." },
        { name: "Revisa errores", text: "JSONCraft resalta errores de sintaxis con la línea y columna exactas del problema." },
        { name: "Elige sangría", text: "Selecciona 2 espacios, 4 espacios o tabulaciones para el formato de salida." },
        { name: "Embellece o minifica", text: "Haz clic en Embellecer para formato legible o Minificar para producción." },
        { name: "Copia o descarga", text: "Copia el resultado al portapapeles o descárgalo como .json." },
      ],
    },
  },
  diff: {
    en: {
      name: "How to Compare Two JSON Documents",
      steps: [
        { name: "Paste the original JSON", text: "Paste your first JSON document into the left pane." },
        { name: "Paste the modified JSON", text: "Paste your second JSON document into the right pane." },
        { name: "Review the diff", text: "Additions, deletions, and changes are highlighted side by side in real time." },
        { name: "Navigate changes", text: "Click any highlighted diff to jump to that location in both panes." },
      ],
    },
    es: {
      name: "Cómo comparar dos documentos JSON",
      steps: [
        { name: "Pega el JSON original", text: "Pega tu primer documento JSON en el panel izquierdo." },
        { name: "Pega el JSON modificado", text: "Pega tu segundo documento JSON en el panel derecho." },
        { name: "Revisa el diff", text: "Adiciones, eliminaciones y cambios se resaltan lado a lado en tiempo real." },
        { name: "Recorre los cambios", text: "Haz clic en cualquier diff resaltado para saltar a esa ubicación." },
      ],
    },
  },
  viewer: {
    en: {
      name: "How to View JSON as an Interactive Tree",
      steps: [
        { name: "Paste or upload JSON", text: "Paste your JSON or drop a .json file onto the page." },
        { name: "Navigate the tree", text: "Click nodes to expand or collapse nested objects and arrays." },
        { name: "Search values", text: "Use the search to find specific keys or values within the tree." },
        { name: "Copy any branch", text: "Right-click any node to copy its subtree as JSON or path." },
      ],
    },
    es: {
      name: "Cómo ver JSON como árbol interactivo",
      steps: [
        { name: "Pega o sube JSON", text: "Pega tu JSON o suelta un archivo .json en la página." },
        { name: "Navega el árbol", text: "Haz clic en los nodos para expandir o colapsar objetos y arrays anidados." },
        { name: "Busca valores", text: "Usa la búsqueda para encontrar claves o valores específicos en el árbol." },
        { name: "Copia cualquier rama", text: "Haz clic derecho en un nodo para copiar su subárbol como JSON o ruta." },
      ],
    },
  },
  graph: {
    en: {
      name: "How to Visualize JSON as a Graph",
      steps: [
        { name: "Paste JSON", text: "Paste your JSON into the input area." },
        { name: "Generate the graph", text: "JSONCraft renders an interactive SVG tree diagram of your data." },
        { name: "Pan and zoom", text: "Drag to pan around the graph, scroll to zoom in and out." },
        { name: "Export as SVG", text: "Download the graph as an SVG file for documentation or presentations." },
      ],
    },
    es: {
      name: "Cómo visualizar JSON como un grafo",
      steps: [
        { name: "Pega JSON", text: "Pega tu JSON en el área de entrada." },
        { name: "Genera el grafo", text: "JSONCraft renderiza un diagrama SVG interactivo de tu estructura." },
        { name: "Mueve y haz zoom", text: "Arrastra para moverte por el grafo, rueda para acercar o alejar." },
        { name: "Exporta como SVG", text: "Descarga el grafo como archivo SVG para documentación o presentaciones." },
      ],
    },
  },
  jsonpath: {
    en: {
      name: "How to Test JSONPath Expressions",
      steps: [
        { name: "Paste your JSON data", text: "Paste your JSON into the data panel." },
        { name: "Write a JSONPath query", text: "Type a JSONPath expression like $.users[*].name in the query input." },
        { name: "See live results", text: "Matching values appear instantly with a count of total matches." },
        { name: "Try example queries", text: "Click any built-in example to learn JSONPath syntax hands-on." },
      ],
    },
    es: {
      name: "Cómo probar expresiones JSONPath",
      steps: [
        { name: "Pega tus datos JSON", text: "Pega tu JSON en el panel de datos." },
        { name: "Escribe una consulta JSONPath", text: "Escribe una expresión como $.users[*].name en el campo de consulta." },
        { name: "Ve resultados en vivo", text: "Los valores coincidentes aparecen al instante con un conteo total." },
        { name: "Prueba ejemplos", text: "Haz clic en cualquier ejemplo integrado para aprender la sintaxis." },
      ],
    },
  },
  "yaml-to-json": {
    en: {
      name: "How to Convert YAML to JSON",
      steps: [
        { name: "Paste YAML", text: "Paste your YAML or upload a .yaml/.yml file." },
        { name: "Review conversion", text: "JSONCraft instantly converts to JSON, preserving nested structures and types." },
        { name: "Copy JSON output", text: "Copy the JSON result to clipboard or download as .json." },
      ],
    },
    es: {
      name: "Cómo convertir YAML a JSON",
      steps: [
        { name: "Pega YAML", text: "Pega tu YAML o sube un archivo .yaml/.yml." },
        { name: "Revisa la conversión", text: "JSONCraft convierte al instante a JSON conservando estructuras y tipos." },
        { name: "Copia el JSON", text: "Copia el resultado al portapapeles o descárgalo como .json." },
      ],
    },
  },
  "json-to-yaml": {
    en: {
      name: "How to Convert JSON to YAML",
      steps: [
        { name: "Paste JSON", text: "Paste your JSON data into the input area." },
        { name: "Get YAML output", text: "Clean, readable YAML appears instantly with 2-space indentation." },
        { name: "Copy or download", text: "Copy to clipboard or download as a .yaml file." },
      ],
    },
    es: {
      name: "Cómo convertir JSON a YAML",
      steps: [
        { name: "Pega JSON", text: "Pega tus datos JSON en el área de entrada." },
        { name: "Obtén YAML", text: "YAML limpio y legible aparece al instante con sangría de 2 espacios." },
        { name: "Copia o descarga", text: "Copia al portapapeles o descárgalo como archivo .yaml." },
      ],
    },
  },
  "json-to-csv": {
    en: {
      name: "How to Convert JSON to CSV",
      steps: [
        { name: "Paste JSON array", text: "Paste a JSON array of objects — each object becomes a row." },
        { name: "Auto-flattening", text: "Nested fields are automatically flattened into separate columns." },
        { name: "Download CSV", text: "Download the result as a .csv file ready for Excel or Google Sheets." },
      ],
    },
    es: {
      name: "Cómo convertir JSON a CSV",
      steps: [
        { name: "Pega un array JSON", text: "Pega un array JSON de objetos — cada objeto se convierte en fila." },
        { name: "Aplanamiento automático", text: "Los campos anidados se aplanan automáticamente en columnas separadas." },
        { name: "Descarga CSV", text: "Descarga el resultado como .csv listo para Excel o Google Sheets." },
      ],
    },
  },
  "csv-to-json": {
    en: {
      name: "How to Convert CSV to JSON",
      steps: [
        { name: "Paste or upload CSV", text: "Paste CSV text or drop a .csv file." },
        { name: "Auto-detect headers", text: "JSONCraft detects the header row and column delimiters automatically." },
        { name: "Review JSON preview", text: "Check the JSON output — types are inferred from values." },
        { name: "Copy or download", text: "Copy to clipboard or download as a .json file." },
      ],
    },
    es: {
      name: "Cómo convertir CSV a JSON",
      steps: [
        { name: "Pega o sube CSV", text: "Pega el texto CSV o suelta un archivo .csv." },
        { name: "Detección automática", text: "JSONCraft detecta cabeceras y delimitadores automáticamente." },
        { name: "Revisa la previsualización", text: "Revisa el JSON — los tipos se infieren de los valores." },
        { name: "Copia o descarga", text: "Copia al portapapeles o descárgalo como .json." },
      ],
    },
  },
  "json-to-toml": {
    en: {
      name: "How to Convert JSON to TOML",
      steps: [
        { name: "Paste JSON", text: "Paste your JSON into the input area." },
        { name: "Review TOML output", text: "Clean TOML with sections, arrays, and nested tables is generated instantly." },
        { name: "Download config file", text: "Download as .toml ready to use as a configuration file." },
      ],
    },
    es: {
      name: "Cómo convertir JSON a TOML",
      steps: [
        { name: "Pega JSON", text: "Pega tu JSON en el área de entrada." },
        { name: "Revisa el TOML", text: "TOML limpio con secciones, arrays y tablas anidadas se genera al instante." },
        { name: "Descarga config", text: "Descarga como .toml listo para usar como archivo de configuración." },
      ],
    },
  },
  "toml-to-json": {
    en: {
      name: "How to Convert TOML to JSON",
      steps: [
        { name: "Paste TOML", text: "Paste your TOML configuration or upload a .toml file." },
        { name: "Review conversion", text: "Full TOML v1.0 support including tables, arrays, and datetimes." },
        { name: "Download JSON", text: "Copy or download the resulting JSON file." },
      ],
    },
    es: {
      name: "Cómo convertir TOML a JSON",
      steps: [
        { name: "Pega TOML", text: "Pega tu configuración TOML o sube un archivo .toml." },
        { name: "Revisa la conversión", text: "Soporte completo de TOML v1.0 incluyendo tablas, arrays y datetimes." },
        { name: "Descarga JSON", text: "Copia o descarga el JSON resultante." },
      ],
    },
  },
  "json-to-typescript": {
    en: {
      name: "How to Generate TypeScript Interfaces from JSON",
      steps: [
        { name: "Paste JSON sample", text: "Paste a JSON sample of your API response or data structure." },
        { name: "Get TypeScript interfaces", text: "Clean interfaces and type aliases are generated instantly." },
        { name: "Customize naming", text: "Set the root interface name if needed." },
        { name: "Copy to your code", text: "Copy the interfaces directly into your TypeScript project." },
      ],
    },
    es: {
      name: "Cómo generar interfaces TypeScript desde JSON",
      steps: [
        { name: "Pega muestra JSON", text: "Pega una muestra JSON de tu respuesta API o estructura de datos." },
        { name: "Obtén interfaces TypeScript", text: "Interfaces limpias y type aliases se generan al instante." },
        { name: "Personaliza nombres", text: "Establece el nombre de la interfaz raíz si lo necesitas." },
        { name: "Copia a tu código", text: "Copia las interfaces directamente en tu proyecto TypeScript." },
      ],
    },
  },
  "json-to-html-table": {
    en: {
      name: "How to Convert JSON to an HTML Table",
      steps: [
        { name: "Paste JSON array", text: "Paste a JSON array of objects to convert." },
        { name: "Preview the table", text: "A rendered HTML table appears with all your data." },
        { name: "Copy HTML or download", text: "Copy the HTML source or download as a standalone .html file." },
      ],
    },
    es: {
      name: "Cómo convertir JSON a tabla HTML",
      steps: [
        { name: "Pega array JSON", text: "Pega un array JSON de objetos para convertir." },
        { name: "Previsualiza la tabla", text: "Aparece una tabla HTML renderizada con todos tus datos." },
        { name: "Copia HTML o descarga", text: "Copia el HTML o descárgalo como archivo .html independiente." },
      ],
    },
  },
  "json-schema-validator": {
    en: {
      name: "How to Validate JSON Against a Schema",
      steps: [
        { name: "Paste your JSON", text: "Paste the JSON document you want to validate." },
        { name: "Paste the schema", text: "Paste your JSON Schema (Draft 7, 2019-09, or 2020-12)." },
        { name: "Run validation", text: "JSONCraft reports any validation errors with detailed paths." },
        { name: "Fix and re-validate", text: "Edit either document and re-run to check changes." },
      ],
    },
    es: {
      name: "Cómo validar JSON contra un schema",
      steps: [
        { name: "Pega tu JSON", text: "Pega el documento JSON que quieres validar." },
        { name: "Pega el schema", text: "Pega tu JSON Schema (Draft 7, 2019-09 o 2020-12)." },
        { name: "Ejecuta validación", text: "JSONCraft informa de errores de validación con rutas detalladas." },
        { name: "Corrige y re-valida", text: "Edita cualquier documento y re-ejecuta para comprobar cambios." },
      ],
    },
  },
  "xml-formatter": {
    en: {
      name: "How to Format XML",
      steps: [
        { name: "Paste XML", text: "Paste your raw XML into the editor." },
        { name: "Beautify or minify", text: "Click Beautify for indented output or Minify to compact it." },
        { name: "Copy result", text: "Copy the formatted XML to clipboard." },
      ],
    },
    es: {
      name: "Cómo formatear XML",
      steps: [
        { name: "Pega XML", text: "Pega tu XML en el editor." },
        { name: "Embellece o minifica", text: "Haz clic en Embellecer para sangría o Minificar para compactar." },
        { name: "Copia el resultado", text: "Copia el XML formateado al portapapeles." },
      ],
    },
  },
  regex: {
    en: {
      name: "How to Test Regular Expressions",
      steps: [
        { name: "Enter your pattern", text: "Type your regex pattern in the expression field." },
        { name: "Set flags", text: "Toggle flags i (ignore case), g (global), m (multiline), s, u, y." },
        { name: "Paste test string", text: "Paste the text you want to search against." },
        { name: "View matches", text: "See matches highlighted in real time with capture group details." },
      ],
    },
    es: {
      name: "Cómo probar expresiones regulares",
      steps: [
        { name: "Escribe tu patrón", text: "Escribe tu regex en el campo de expresión." },
        { name: "Activa flags", text: "Activa flags i (ignora mayúsculas), g (global), m (multilínea), s, u, y." },
        { name: "Pega texto de prueba", text: "Pega el texto donde quieres buscar." },
        { name: "Ve coincidencias", text: "Ve coincidencias resaltadas en tiempo real con grupos de captura." },
      ],
    },
  },
  base64: {
    en: {
      name: "How to Encode or Decode Base64",
      steps: [
        { name: "Choose mode", text: "Select Encode (text → base64) or Decode (base64 → text)." },
        { name: "Enter your input", text: "Paste or type your text or base64 string." },
        { name: "Copy the output", text: "The result updates instantly — copy to clipboard." },
      ],
    },
    es: {
      name: "Cómo codificar o decodificar Base64",
      steps: [
        { name: "Elige modo", text: "Selecciona Codificar (texto → base64) o Decodificar (base64 → texto)." },
        { name: "Escribe tu entrada", text: "Pega o escribe tu texto o cadena base64." },
        { name: "Copia el resultado", text: "El resultado se actualiza al instante — copia al portapapeles." },
      ],
    },
  },
  "url-encode": {
    en: {
      name: "How to URL Encode or Decode Text",
      steps: [
        { name: "Paste your text", text: "Paste the text or URL you want to encode or decode." },
        { name: "See instant result", text: "Encoding and decoding happen as you type." },
        { name: "Copy output", text: "Copy the encoded or decoded result to clipboard." },
      ],
    },
    es: {
      name: "Cómo codificar o decodificar URL",
      steps: [
        { name: "Pega tu texto", text: "Pega el texto o URL que quieres codificar o decodificar." },
        { name: "Resultado instantáneo", text: "La codificación y decodificación ocurren mientras escribes." },
        { name: "Copia el resultado", text: "Copia el resultado codificado o decodificado al portapapeles." },
      ],
    },
  },
  hash: {
    en: {
      name: "How to Generate Hash Values",
      steps: [
        { name: "Enter your text", text: "Paste or type the text you want to hash." },
        { name: "Choose algorithm", text: "All hashes (MD5, SHA-1, SHA-256, SHA-512) are computed simultaneously." },
        { name: "Copy any hash", text: "Click the copy button next to any hash value to copy it." },
      ],
    },
    es: {
      name: "Cómo generar valores hash",
      steps: [
        { name: "Escribe tu texto", text: "Pega o escribe el texto que quieres hashear." },
        { name: "Elige algoritmo", text: "Todos los hashes (MD5, SHA-1, SHA-256, SHA-512) se calculan a la vez." },
        { name: "Copia cualquier hash", text: "Haz clic en el botón de copiar junto al valor que quieras." },
      ],
    },
  },
  uuid: {
    en: {
      name: "How to Generate UUIDs",
      steps: [
        { name: "Click Generate", text: "Click the Generate button to create a new UUID v4." },
        { name: "Bulk generate", text: "Set a count (1-1000) to generate multiple UUIDs at once." },
        { name: "Copy results", text: "Copy individual UUIDs or the entire list with one click." },
      ],
    },
    es: {
      name: "Cómo generar UUIDs",
      steps: [
        { name: "Haz clic en Generar", text: "Haz clic en Generar para crear un nuevo UUID v4." },
        { name: "Generación masiva", text: "Establece un conteo (1-1000) para generar múltiples UUIDs a la vez." },
        { name: "Copia resultados", text: "Copia UUIDs individuales o la lista entera con un clic." },
      ],
    },
  },
  timestamp: {
    en: {
      name: "How to Convert Unix Timestamps",
      steps: [
        { name: "Enter timestamp", text: "Paste a Unix timestamp (seconds or milliseconds) or a date string." },
        { name: "See conversion", text: "The converter shows both seconds, milliseconds, ISO 8601, and human-readable." },
        { name: "Pick a timezone", text: "Switch between UTC and your local timezone for the output." },
      ],
    },
    es: {
      name: "Cómo convertir timestamps Unix",
      steps: [
        { name: "Introduce timestamp", text: "Pega un timestamp Unix (segundos o ms) o una fecha." },
        { name: "Ve la conversión", text: "El conversor muestra segundos, milisegundos, ISO 8601 y formato humano." },
        { name: "Elige zona horaria", text: "Alterna entre UTC y tu zona local para la salida." },
      ],
    },
  },
  cron: {
    en: {
      name: "How to Build and Test Cron Expressions",
      steps: [
        { name: "Use the visual builder", text: "Set minute, hour, day, month, and weekday via dropdowns." },
        { name: "Or paste an expression", text: "Paste a cron expression directly to parse it." },
        { name: "See natural language", text: "The expression is translated to plain English or Spanish." },
        { name: "Preview next runs", text: "See the next 5 scheduled execution times." },
      ],
    },
    es: {
      name: "Cómo construir y probar expresiones cron",
      steps: [
        { name: "Usa el constructor visual", text: "Configura minuto, hora, día, mes y día de la semana con dropdowns." },
        { name: "O pega una expresión", text: "Pega una expresión cron directamente para analizarla." },
        { name: "Ve el lenguaje natural", text: "La expresión se traduce a español o inglés claro." },
        { name: "Previsualiza ejecuciones", text: "Ve los próximos 5 tiempos de ejecución programados." },
      ],
    },
  },
  "yaml-validator": {
    en: {
      name: "How to Validate YAML Syntax",
      steps: [
        { name: "Paste YAML", text: "Paste your YAML content or upload a .yaml file." },
        { name: "See errors", text: "JSONCraft highlights syntax errors with exact line and column numbers." },
        { name: "Fix and re-validate", text: "Edit the YAML and see validation update instantly." },
      ],
    },
    es: {
      name: "Cómo validar sintaxis YAML",
      steps: [
        { name: "Pega YAML", text: "Pega tu contenido YAML o sube un archivo .yaml." },
        { name: "Ve errores", text: "JSONCraft resalta errores de sintaxis con línea y columna exactas." },
        { name: "Corrige y re-valida", text: "Edita el YAML y ve la validación actualizarse al instante." },
      ],
    },
  },
};

export function getHowTo(toolId: string, lang: Lang): ToolHowTo | undefined {
  return howtoSteps[toolId]?.[lang];
}
