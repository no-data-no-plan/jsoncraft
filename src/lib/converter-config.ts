export type Format = "json" | "yaml" | "toml" | "csv";

export const formatLabels: Record<Format, string> = {
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  csv: "CSV",
};

// Picker `accept` per source format. MIME-only where a universal type exists
// (json/csv) so mobile browsers don't widen the picker to camera/mic; yaml/toml
// keep extension tokens because they have no widely-recognized MIME (MIME-only
// would grey out the file in desktop pickers). Content is validated after read.
export const extMap: Record<Format, string> = {
  json: "application/json",
  yaml: ".yaml,.yml",
  toml: ".toml",
  csv: "text/csv,application/vnd.ms-excel",
};

export const downloadExtMap: Record<Format, string> = {
  json: "output.json",
  yaml: "output.yaml",
  toml: "output.toml",
  csv: "output.csv",
};

export const langMap: Record<Format, "json" | "yaml" | "text"> = {
  json: "json",
  yaml: "yaml",
  toml: "text",
  csv: "text",
};

export const sampleData: Record<Format, (toFormat: Format) => string> = {
  json: (to) =>
    JSON.stringify(
      to === "csv"
        ? [
            { name: "Alice", age: 30, city: "London", active: true },
            { name: "Bob", age: 25, city: "Paris", active: false },
            { name: "Charlie", age: 35, city: "Berlin", active: true },
          ]
        : {
            server: { host: "localhost", port: 8080 },
            database: { url: "postgres://localhost/db", pool_size: 5 },
            features: ["auth", "logging", "cache"],
          },
      null,
      2,
    ),
  yaml: () => `server:
  host: localhost
  port: 8080
database:
  url: postgres://localhost/db
  pool_size: 5
features:
  - auth
  - logging
  - cache`,
  toml: () => `[server]
host = "localhost"
port = 8080

[database]
url = "postgres://localhost/db"
pool_size = 5

features = ["auth", "logging", "cache"]`,
  csv: () => `name,age,city,active
Alice,30,London,true
Bob,25,Paris,false
Charlie,35,Berlin,true`,
};
