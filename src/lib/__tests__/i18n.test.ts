/**
 * Tests for i18n completeness — ensures every tool/page has both EN and ES,
 * all common keys exist in both languages, and no empty values.
 */
import { describe, it, expect } from 'vitest';
import { getPageSeo } from '../../i18n/pages';
import { getToolName, tt } from '../../i18n/tools';
import { t } from '../../i18n/common';
import type { Lang } from '../../i18n/index';
import type { CommonKey } from '../../i18n/common';

// All tool IDs referenced across the app
const toolIds = [
  'formatter', 'diff', 'viewer', 'graph', 'jsonpath',
  'yaml-to-json', 'json-to-yaml', 'json-to-csv', 'csv-to-json',
  'json-to-toml', 'toml-to-json',
  'regex', 'base64', 'url-encode', 'hash', 'uuid', 'timestamp', 'cron',
  'json-to-typescript', 'xml-formatter', 'json-to-html-table',
  'yaml-validator', 'json-schema-validator',
];

const langs: Lang[] = ['en', 'es'];

// ─── pages.ts: every tool has EN and ES SEO entries ──────────

describe('pages.ts: EN and ES entries for every tool', () => {
  for (const id of toolIds) {
    for (const lang of langs) {
      it(`${id} has ${lang} page SEO`, () => {
        const seo = getPageSeo(id, lang);
        expect(seo).toBeDefined();
        expect(seo!.title).toBeTruthy();
        expect(seo!.description).toBeTruthy();
        expect(seo!.seoHeading).toBeTruthy();
        expect(seo!.seoText).toBeTruthy();
        expect(seo!.seoBlockHeading).toBeTruthy();
        expect(seo!.seoBlockText).toBeTruthy();
        expect(seo!.seoFeatures.length).toBeGreaterThan(0);
      });
    }
  }
});

// ─── pages.ts: no empty seoFeatures items ────────────────────

describe('pages.ts: no empty seoFeatures', () => {
  for (const id of toolIds) {
    for (const lang of langs) {
      it(`${id} (${lang}) has no empty seoFeatures`, () => {
        const seo = getPageSeo(id, lang);
        expect(seo).toBeDefined();
        for (const feature of seo!.seoFeatures) {
          expect(feature.trim().length).toBeGreaterThan(0);
        }
      });
    }
  }
});

// ─── tools.ts: every tool has EN and ES name ─────────────────

describe('tools.ts: tool names in both languages', () => {
  for (const id of toolIds) {
    for (const lang of langs) {
      it(`${id} has ${lang} tool name`, () => {
        const name = getToolName(id, lang);
        expect(name).toBeTruthy();
        // Should not fall back to the raw ID
        expect(name).not.toBe(id);
      });
    }
  }
});

// ─── common.ts: all keys exist in both languages ─────────────

describe('common.ts: all keys in both languages', () => {
  // Known common keys (from reading the source)
  const commonKeys: CommonKey[] = [
    'headerBadge', 'footerTagline', 'footerCoffee', 'footerPrivacy',
    'feedbackPlaceholder', 'feedbackSend',
    'sidebarPrivacy',
    'copy', 'copied', 'clear', 'sample', 'upload', 'download',
    'swap', 'format', 'minify', 'convert', 'compare', 'evaluate', 'generate',
    'encode', 'decode',
    'input', 'output', 'result', 'indent',
    'validJson', 'processing', 'comparing', 'parsing', 'evaluating',
    'computing', 'processingLarge',
    'related', 'aboutThisTool', 'seoBlockPrivacy',
    'toggleTheme', 'toggleMenu',
    'langToggleLabel', 'langToggleTitle',
    'groupCore', 'groupConverters', 'groupDevTools',
  ];

  for (const key of commonKeys) {
    for (const lang of langs) {
      it(`common key "${key}" exists in ${lang}`, () => {
        const val = t(lang, key);
        expect(val).toBeTruthy();
        expect(typeof val).toBe('string');
        expect(val.trim().length).toBeGreaterThan(0);
      });
    }
  }
});

// ─── tools.ts: component translation keys are non-empty ──────

describe('tools.ts: component-level translation values are non-empty', () => {
  // Tool components with known translation keys
  const toolComponents: Record<string, string[]> = {
    formatter: ['spaces2', 'spaces4', 'tab', 'inputPlaceholder', 'outputPlaceholder', 'copyInput', 'copyOutput', 'downloadOutput', 'onlyJson'],
    diff: ['leftOriginal', 'rightModified', 'leftPlaceholder', 'rightPlaceholder', 'differences', 'noDifferences'],
    viewer: ['expandAll', 'collapseAll', 'tree', 'copyPath', 'pasteHint', 'inputPlaceholder'],
    graph: ['expandAll', 'collapseAll', 'fitView', 'graph', 'nodes', 'depth', 'inputPlaceholder', 'pasteHint'],
    jsonpath: ['path', 'jsonInput', 'inputPlaceholder', 'resultPlaceholder', 'match', 'matches', 'examples'],
    regex: ['enterPattern', 'testString', 'matchesHighlighted', 'matchesPlaceholder'],
    base64: ['text', 'invalidBase64', 'encodePlaceholder', 'decodePlaceholder', 'resultPlaceholder', 'urlSafe'],
    urlEncode: ['component', 'fullUri', 'form', 'modeHint', 'inputPlaceholder', 'resultPlaceholder'],
    hash: ['pasteToHash', 'hashes', 'inputPlaceholder', 'emptyHint', 'modeText', 'modeFile', 'modeHmac'],
    uuid: ['count', 'uppercase', 'noDashes', 'copyAll'],
    timestamp: ['currentUnix', 'tsToDate', 'dateToTs', 'now', 'seconds', 'millis'],
    cron: ['quickPresets', 'fields', 'next5Runs', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
    converter: ['copyInput', 'copyOutput', 'downloadOutput'],
    jsonToTypescript: ['inputPlaceholder', 'outputPlaceholder'],
    xmlFormatter: ['spaces2', 'spaces4', 'inputPlaceholder', 'outputPlaceholder'],
    jsonToHtmlTable: ['inputPlaceholder', 'emptyHint', 'showCode', 'showPreview'],
    yamlValidator: ['inputPlaceholder', 'outputPlaceholder', 'validYaml', 'invalidYaml'],
    jsonSchemaValidator: ['jsonPlaceholder', 'schemaPlaceholder', 'valid', 'invalid'],
  };

  // Keys where the EN translation value legitimately equals the key name
  const keyEqualsValue = new Set(['matches', 'match']);

  for (const [tool, keys] of Object.entries(toolComponents)) {
    for (const key of keys) {
      for (const lang of langs) {
        it(`tt("${tool}", "${lang}", "${key}") is non-empty`, () => {
          const val = tt(tool, lang, key);
          expect(val).toBeTruthy();
          expect(val.trim().length).toBeGreaterThan(0);
          // Should not fall back to the raw key name (unless it legitimately equals it)
          if (!keyEqualsValue.has(key)) {
            expect(val).not.toBe(key);
          }
        });
      }
    }
  }
});
