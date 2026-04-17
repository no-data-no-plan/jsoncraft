import { getCollection, type CollectionEntry } from "astro:content";

export type Doc = CollectionEntry<"docs">;
export type Category = Doc["data"]["category"];
export type DocLang = "en" | "es";

export const CATEGORY_ORDER: Category[] = [
  "fundamentals",
  "schema",
  "formats",
  "security",
  "performance",
  "ecosystem",
];

export const CATEGORY_LABELS: Record<DocLang, Record<Category, string>> = {
  en: {
    fundamentals: "Fundamentals",
    schema: "Schema & Validation",
    formats: "Formats & Conversion",
    security: "Security",
    performance: "Performance",
    ecosystem: "Ecosystem",
  },
  es: {
    fundamentals: "Fundamentos",
    schema: "Schema y validaci\u00f3n",
    formats: "Formatos y conversi\u00f3n",
    security: "Seguridad",
    performance: "Rendimiento",
    ecosystem: "Ecosistema",
  },
};

export async function getAllDocs(lang: DocLang): Promise<Doc[]> {
  const all = await getCollection("docs");
  return all
    .filter((d) => d.data.lang === lang)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getDocBySlug(slug: string, lang: DocLang): Promise<Doc | undefined> {
  const all = await getCollection("docs");
  return all.find((d) => d.data.lang === lang && docSlug(d) === slug);
}

export async function getDocsByCategory(category: Category, lang: DocLang): Promise<Doc[]> {
  const docs = await getAllDocs(lang);
  return docs.filter((d) => d.data.category === category);
}

export async function getDocsReferencingTool(toolId: string, lang: DocLang, limit = 4): Promise<Doc[]> {
  const docs = await getAllDocs(lang);
  return docs.filter((d) => d.data.relatedToolIds.includes(toolId)).slice(0, limit);
}

export function docSlug(doc: Doc): string {
  const parts = doc.id.split("/");
  return parts[parts.length - 1];
}

export function docPath(doc: Doc): string {
  const slug = docSlug(doc);
  return doc.data.lang === "es" ? `/es/docs/${slug}/` : `/docs/${slug}/`;
}

export function formatDate(date: Date, lang: DocLang): string {
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
