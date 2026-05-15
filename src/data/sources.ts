/**
 * Canonical specifications + standards each JC tool implements.
 *
 * Citations follow Bar D factual rigor — every entry must correspond to
 * an inspectable spec/RFC/standard URL within 60 seconds. Day-level
 * dates are NOT fabricated; only year + month are stated when the spec
 * itself only publishes that granularity.
 *
 * Wave 2.3 (CV) caught 2 P0 fabrications (Bernoulli year wrong, Hess
 * pages wrong) during the post-implementation reviewer-agent pass. This
 * file was assembled via 12 parallel research agents (one per tool) each
 * WebFetching the canonical source + cross-verifying against Wikipedia
 * or alternate authoritative source, then aggregated + Marco-approved
 * 2026-05-15.
 */
export interface Source {
  authors: string;
  year: string;
  title: string;
  venue?: string;
}

const SOURCES: Record<string, Source[]> = {
  "formatter": [
    {
      authors: "Bray, T.",
      year: "2017",
      title: "The JavaScript Object Notation (JSON) Data Interchange Format",
      venue: "RFC 8259, IETF, December 2017",
    },
    {
      authors: "Ecma International",
      year: "2017",
      title: "The JSON Data Interchange Syntax",
      venue: "Standard ECMA-404, 2nd Edition, December 2017",
    },
  ],
  "hash": [
    {
      authors: "National Institute of Standards and Technology",
      year: "2015",
      title: "Secure Hash Standard (SHS)",
      venue: "FIPS PUB 180-4, U.S. Department of Commerce, August 2015",
    },
    {
      authors: "Krawczyk, H., Bellare, M., & Canetti, R.",
      year: "1997",
      title: "HMAC: Keyed-Hashing for Message Authentication",
      venue: "RFC 2104, IETF, February 1997",
    },
    {
      authors: "Eastlake, D. 3rd, & Hansen, T.",
      year: "2011",
      title: "US Secure Hash Algorithms (SHA and SHA-based HMAC and HKDF)",
      venue: "RFC 6234, IETF, May 2011",
    },
    {
      authors: "Rivest, R.",
      year: "1992",
      title: "The MD5 Message-Digest Algorithm",
      venue: "RFC 1321, IETF, April 1992",
    },
  ],
  "uuid": [
    {
      authors: "Leach, P., Mealling, M., & Salz, R.",
      year: "2005",
      title: "A Universally Unique IDentifier (UUID) URN Namespace",
      venue: "RFC 4122, IETF, July 2005",
    },
    {
      authors: "Davis, K., Peabody, B., & Leach, P.",
      year: "2024",
      title: "Universally Unique IDentifiers (UUIDs)",
      venue: "RFC 9562, IETF, May 2024",
    },
  ],
  "base64": [
    {
      authors: "Josefsson, S.",
      year: "2006",
      title: "The Base16, Base32, and Base64 Data Encodings",
      venue: "RFC 4648, IETF, October 2006",
    },
  ],
  "url-encode": [
    {
      authors: "Berners-Lee, T., Fielding, R., & Masinter, L.",
      year: "2005",
      title: "Uniform Resource Identifier (URI): Generic Syntax",
      venue: "RFC 3986, IETF, January 2005 (STD 66)",
    },
  ],
  "timestamp": [
    {
      authors: "Klyne, G., & Newman, C.",
      year: "2002",
      title: "Date and Time on the Internet: Timestamps",
      venue: "RFC 3339, IETF, July 2002",
    },
    {
      authors: "International Organization for Standardization",
      year: "2019",
      title: "Date and time — Representations for information interchange — Part 1: Basic rules",
      venue: "ISO 8601-1:2019 (with ISO 8601-2:2019 Part 2: Extensions)",
    },
  ],
  "xml-formatter": [
    {
      authors: "Bray, T., Paoli, J., Sperberg-McQueen, C.M., Maler, E., & Yergeau, F.",
      year: "2008",
      title: "Extensible Markup Language (XML) 1.0 (Fifth Edition)",
      venue: "W3C Recommendation, 26 November 2008",
    },
  ],
  "yaml-validator": [
    {
      authors: "Ben-Kiki, O., Evans, C., & döt Net, I.",
      year: "2021",
      title: "YAML Ain't Markup Language (YAML™) version 1.2, Revision 1.2.2",
      venue: "YAML Language Development Team (yaml.org), October 2021",
    },
  ],
  "json-schema-validator": [
    {
      authors: "Wright, A., Andrews, H., Hutton, B., & Dennis, G.",
      year: "2022",
      title: "JSON Schema: A Media Type for Describing JSON Documents",
      venue: "Internet-Draft draft-bhutton-json-schema-01, IETF (2020-12 dialect, json-schema.org)",
    },
  ],
  "regex": [
    {
      authors: "Ecma International (TC39)",
      year: "2025",
      title: "ECMAScript 2025 Language Specification — RegExp (Regular Expression) Objects (§22.2)",
      venue: "ECMA-262, 16th Edition, June 2025",
    },
    {
      authors: "IEEE and The Open Group",
      year: "2017",
      title: "Regular Expressions (Chapter 9)",
      venue: "POSIX.1-2017 / IEEE Std 1003.1-2017, Open Group Base Specifications Issue 7",
    },
  ],
  "cron": [
    {
      authors: "IEEE and The Open Group",
      year: "2017",
      title: "crontab — schedule periodic background work",
      venue: "POSIX.1-2017 / IEEE Std 1003.1-2017, Shell and Utilities",
    },
  ],
  "jsonpath": [
    {
      authors: "Gössner, S., Normington, G., & Bormann, C. (Eds.)",
      year: "2024",
      title: "JSONPath: Query Expressions for JSON",
      venue: "RFC 9535, IETF, February 2024",
    },
  ],
};

export function getSources(slug: string): Source[] {
  return SOURCES[slug] ?? [];
}
