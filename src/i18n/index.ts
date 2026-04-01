export type Lang = "en" | "es";
export const defaultLang: Lang = "en";
export const languages: Lang[] = ["en", "es"];

export function getLangFromUrl(pathname: string): Lang {
  if (pathname.startsWith("/es/") || pathname === "/es") return "es";
  return "en";
}

export function getAlternatePath(pathname: string): string {
  if (pathname.startsWith("/es/") || pathname === "/es") {
    const rest = pathname.replace(/^\/es\/?/, "/");
    return rest || "/";
  }
  if (pathname === "/") return "/es/";
  return "/es" + pathname;
}

export function getCanonicalPath(pathname: string): string {
  if (pathname.startsWith("/es/") || pathname === "/es") {
    const rest = pathname.replace(/^\/es\/?/, "/");
    return rest || "/";
  }
  return pathname;
}

export function localePath(path: string, lang: Lang): string {
  if (lang === "en") return path;
  if (path === "/") return "/es/";
  return "/es" + path;
}
