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
    name: "Formatter",
    path: "/",
    description: "Validate, format, and minify JSON instantly",
    icon: "{ }",
    keywords: ["json formatter", "json validator", "json prettify", "json minify"],
  },
  {
    id: "diff",
    name: "Diff",
    path: "/diff",
    description: "Compare two JSON documents side by side",
    icon: "<>",
    keywords: ["json diff", "json compare"],
  },
  {
    id: "viewer",
    name: "Tree Viewer",
    path: "/viewer",
    description: "Explore JSON as an interactive collapsible tree",
    icon: "{}",
    keywords: ["json viewer", "json tree", "json explorer"],
  },
  {
    id: "jsonpath",
    name: "JSONPath",
    path: "/jsonpath",
    description: "Test JSONPath expressions interactively",
    icon: "$..",
    keywords: ["jsonpath tester", "jsonpath query"],
  },
  {
    id: "yaml-to-json",
    name: "YAML to JSON",
    path: "/yaml-to-json",
    description: "Convert YAML to JSON format",
    icon: "Y>J",
    keywords: ["yaml to json", "yaml converter"],
  },
  {
    id: "json-to-yaml",
    name: "JSON to YAML",
    path: "/json-to-yaml",
    description: "Convert JSON to YAML format",
    icon: "J>Y",
    keywords: ["json to yaml", "json converter"],
  },
  {
    id: "json-to-csv",
    name: "JSON to CSV",
    path: "/json-to-csv",
    description: "Convert JSON arrays to CSV format",
    icon: "J>C",
    keywords: ["json to csv", "json converter"],
  },
  {
    id: "csv-to-json",
    name: "CSV to JSON",
    path: "/csv-to-json",
    description: "Convert CSV data to JSON format",
    icon: "C>J",
    keywords: ["csv to json", "csv converter"],
  },
  {
    id: "json-to-toml",
    name: "JSON to TOML",
    path: "/json-to-toml",
    description: "Convert JSON to TOML format",
    icon: "J>T",
    keywords: ["json to toml"],
  },
  {
    id: "toml-to-json",
    name: "TOML to JSON",
    path: "/toml-to-json",
    description: "Convert TOML to JSON format",
    icon: "T>J",
    keywords: ["toml to json"],
  },
];
