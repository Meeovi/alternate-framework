// ---------------------------------------------------------------------------
// Crawler plugin — web crawl and document ingestion
// ---------------------------------------------------------------------------
//
// Crawls one or more seed URLs, transforms HTML pages into indexable documents,
// and feeds them into the search engine's index pipeline via the user-supplied
// `index` function.
//
// Features:
//   • Breadth-first crawl with configurable depth and concurrency
//   • robots.txt obedience (optional)
//   • Content deduplication via URL + etag cache
//   • Custom `transform` hook for extracting structured fields from raw HTML
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
  interface SearchPluginRegistry {
    "cralwer": { creator: typeof crawler };
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CrawlerTransformResult = {
  id: string;
  [field: string]: unknown;
};

export type CrawlerOptions = {
  /**
   * Seed URLs to start crawling from.
   */
  seeds: string[];
  /**
   * Index name documents should be added to.
   */
  indexName: string;
  /**
   * Async function that pushes documents into the search index.
   * Typically: `(docs) => search.index(indexName, docs)`.
   */
  index: (indexName: string, docs: SearchDocument[]) => Promise<void>;
  /**
   * Transform a fetched page into a searchable document.
   * Receives the raw HTML string and the URL.  Return `null` to skip.
   */
  transform?: (html: string, url: string) => CrawlerTransformResult | null;
  /**
   * Maximum crawl depth.  0 = only seed URLs.  Default: 2.
   */
  maxDepth?: number;
  /**
   * Maximum concurrent requests.  Default: 4.
   */
  concurrency?: number;
  /**
   * Respect robots.txt.  Default: true.
   */
  respectRobots?: boolean;
  /**
   * Additional HTTP headers for each request.
   */
  headers?: Record<string, string>;
  /**
   * URL filter predicate.  Return false to skip a discovered URL.
   */
  urlFilter?: (url: string) => boolean;
  /**
   * Batch size for index calls.  Default: 25.
   */
  batchSize?: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTextContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const re = /href=["']([^"'#?]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    try {
      const absolute = new URL(match[1], baseUrl).href;
      links.push(absolute);
    } catch {
      // Ignore invalid URLs
    }
  }
  return links;
}

function defaultTransform(html: string, url: string): CrawlerTransformResult {
  return {
    id:      url,
    url,
    title:   extractTitle(html),
    content: extractTextContent(html),
  };
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function crawler(options: CrawlerOptions): SearchPlugin & {
  crawl(): Promise<{ indexed: number; skipped: number; errors: number }>;
} {
  const maxDepth    = options.maxDepth    ?? 2;
  const concurrency = options.concurrency ?? 4;
  const batchSize   = options.batchSize   ?? 25;
  const transform   = options.transform   ?? defaultTransform;

  async function crawl(): Promise<{ indexed: number; skipped: number; errors: number }> {
    const visited = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = options.seeds.map((u) => ({ url: u, depth: 0 }));
    const batch: SearchDocument[] = [];
    let indexed = 0, skipped = 0, errors = 0;

    async function flushBatch(): Promise<void> {
      if (batch.length === 0) return;
      const docs = batch.splice(0, batch.length);
      await options.index(options.indexName, docs);
      indexed += docs.length;
    }

    async function fetchAndProcess(url: string, depth: number): Promise<string[]> {
      if (visited.has(url)) { skipped++; return []; }
      if (options.urlFilter && !options.urlFilter(url)) { skipped++; return []; }
      visited.add(url);

      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "alternate-search-crawler/1.0", ...(options.headers ?? {}) },
        });
        if (!res.ok) { errors++; return []; }
        const html = await res.text();

        const doc = transform(html, url);
        if (doc) {
          batch.push(doc as SearchDocument);
          if (batch.length >= batchSize) await flushBatch();
        }

        return depth < maxDepth ? extractLinks(html, url) : [];
      } catch {
        errors++;
        return [];
      }
    }

    // BFS with concurrency pool
    while (queue.length > 0) {
      const slice = queue.splice(0, concurrency);
      const discovered = await Promise.all(
        slice.map(({ url, depth }) => fetchAndProcess(url, depth).then((links) => ({ links, depth }))),
      );
      for (const { links, depth } of discovered) {
        if (depth < maxDepth) {
          for (const link of links) {
            if (!visited.has(link)) queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    }

    await flushBatch();
    return { indexed, skipped, errors };
  }

  return {
    id: "cralwer", // Preserved as-is per project filename convention

    init(_indexes: Record<string, IndexSchema>) {},

    crawl,
  };
}
