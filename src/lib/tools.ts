export interface Tool {
  id: string;
  name: string;
  path: string;
  description: string;
  icon: string;
  keywords: string[];
}

export const tools: Tool[] = [
  {
    id: "formatter",
    name: "JSON Formatter",
    path: "/",
    description: "Validate, format, beautify and minify JSON instantly",
    icon: "{ }",
    keywords: ["json formatter", "json validator", "json beautifier", "json prettify", "json minify", "json lint"],
  },
  {
    id: "diff",
    name: "JSON Diff",
    path: "/diff",
    description: "Compare two JSON documents side by side and spot differences",
    icon: "<>",
    keywords: ["json diff", "json compare", "json difference", "compare json online"],
  },
  {
    id: "viewer",
    name: "JSON Tree Viewer",
    path: "/viewer",
    description: "Explore JSON as an interactive collapsible tree",
    icon: "{}",
    keywords: ["json viewer", "json tree", "json explorer", "json visualizer"],
  },
  {
    id: "jsonpath",
    name: "JSONPath Tester",
    path: "/jsonpath",
    description: "Test and evaluate JSONPath expressions interactively",
    icon: "$..",
    keywords: ["jsonpath tester", "jsonpath query", "jsonpath evaluator", "jsonpath playground"],
  },
  {
    id: "yaml-to-json",
    name: "YAML to JSON",
    path: "/yaml-to-json",
    description: "Convert YAML configuration files to JSON format instantly",
    icon: "Y>J",
    keywords: ["yaml to json", "yaml converter", "yaml to json online"],
  },
  {
    id: "json-to-yaml",
    name: "JSON to YAML",
    path: "/json-to-yaml",
    description: "Convert JSON data to clean, readable YAML format",
    icon: "J>Y",
    keywords: ["json to yaml", "json converter", "json to yaml online"],
  },
  {
    id: "json-to-csv",
    name: "JSON to CSV",
    path: "/json-to-csv",
    description: "Convert JSON arrays to spreadsheet-friendly CSV format",
    icon: "J>C",
    keywords: ["json to csv", "json converter", "json to csv online", "json to spreadsheet"],
  },
  {
    id: "csv-to-json",
    name: "CSV to JSON",
    path: "/csv-to-json",
    description: "Convert CSV spreadsheet data to structured JSON format",
    icon: "C>J",
    keywords: ["csv to json", "csv converter", "csv to json online"],
  },
  {
    id: "json-to-toml",
    name: "JSON to TOML",
    path: "/json-to-toml",
    description: "Convert JSON data to TOML configuration format",
    icon: "J>T",
    keywords: ["json to toml", "json converter", "toml config generator"],
  },
  {
    id: "toml-to-json",
    name: "TOML to JSON",
    path: "/toml-to-json",
    description: "Convert TOML configuration files to JSON format",
    icon: "T>J",
    keywords: ["toml to json", "toml converter", "toml parser online"],
  },

  // ── Dev Tools ──
  {
    id: "regex",
    name: "Regex Tester",
    path: "/regex",
    description: "Test regular expressions with real-time matching and capture groups",
    icon: "/./",
    keywords: ["regex tester", "regex online", "regular expression tester", "regex playground"],
  },
  {
    id: "base64",
    name: "Base64 Encode/Decode",
    path: "/base64",
    description: "Encode text to Base64 or decode Base64 strings instantly",
    icon: "b64",
    keywords: ["base64 encoder", "base64 decoder", "base64 encode online", "base64 converter"],
  },
  {
    id: "url-encode",
    name: "URL Encoder/Decoder",
    path: "/url-encode",
    description: "Encode or decode URLs and query strings for safe transmission",
    icon: "%20",
    keywords: ["url encoder", "url decoder", "url encode online", "percent encoding"],
  },
  {
    id: "hash",
    name: "Hash Generator",
    path: "/hash",
    description: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from any text",
    icon: "#h",
    keywords: ["hash generator", "sha256 generator", "md5 hash online", "sha1 hash"],
  },
  {
    id: "uuid",
    name: "UUID Generator",
    path: "/uuid",
    description: "Generate random UUIDs (v4) instantly with bulk generation support",
    icon: "id",
    keywords: ["uuid generator", "uuid v4", "guid generator", "random uuid online"],
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    path: "/timestamp",
    description: "Convert Unix timestamps to dates and dates to timestamps",
    icon: "Ts",
    keywords: ["unix timestamp converter", "epoch converter", "timestamp to date", "unix time"],
  },
  {
    id: "cron",
    name: "Cron Expression Builder",
    path: "/cron",
    description: "Build and test cron expressions with a visual editor and next-run preview",
    icon: "**",
    keywords: ["cron expression builder", "cron generator", "crontab guru", "cron schedule"],
  },
];
