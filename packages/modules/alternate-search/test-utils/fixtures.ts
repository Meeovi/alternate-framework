// ---------------------------------------------------------------------------
// fixtures.ts — reusable test document fixtures for alternate-search tests
// ---------------------------------------------------------------------------

import type { SearchDocument } from "../core/types";
import { makeProduct, makeArticle } from "./headers";

// ---------------------------------------------------------------------------
// Product fixtures (10 documents; covers various categories, price ranges,
// published states, and two geo-tagged entries)
// ---------------------------------------------------------------------------

export const PRODUCT_FIXTURES: SearchDocument[] = [
  makeProduct({ id: "p1",  title: "Running Shoes",               category: "footwear",    price: 89.99,   published: true,  score: 95 }),
  makeProduct({ id: "p2",  title: "Trail Sneakers",              category: "footwear",    price: 49.99,   published: true,  score: 87 }),
  makeProduct({ id: "p3",  title: "Laptop Pro 15",               category: "electronics", price: 1299.00, published: true,  score: 92 }),
  makeProduct({ id: "p4",  title: "Wireless Notebook Stand",     category: "electronics", price: 39.99,   published: true,  score: 78 }),
  makeProduct({ id: "p5",  title: "Coffee Mug",                  category: "kitchen",     price: 12.99,   published: false, score: 55 }),
  makeProduct({ id: "p6",  title: "Stainless Steel Water Bottle",category: "kitchen",     price: 24.99,   published: true,  score: 60 }),
  makeProduct({ id: "p7",  title: "Yoga Mat Premium",            category: "sports",      price: 65.00,   published: true,  score: 88 }),
  makeProduct({ id: "p8",  title: "Resistance Band Set",         category: "sports",      price: 19.99,   published: true,  score: 72 }),
  // Geo-tagged products (Bay Area, CA)
  makeProduct({ id: "p9",  title: "GPS Watch",    category: "electronics", price: 249.99, published: true, score: 96, _geo: { lat: 37.7749, lng: -122.4194 } }),
  makeProduct({ id: "p10", title: "Outdoor Jacket",category: "apparel",   price: 150.00,  published: true, score: 81, _geo: { lat: 37.8044, lng: -122.2712 } }),
];

/** Total number of published products in PRODUCT_FIXTURES. */
export const PUBLISHED_PRODUCT_COUNT = PRODUCT_FIXTURES.filter(
  (d) => d.published === true,
).length;

/** Total number of products in the "kitchen" category. */
export const KITCHEN_PRODUCT_COUNT = PRODUCT_FIXTURES.filter(
  (d) => d.category === "kitchen",
).length;

// ---------------------------------------------------------------------------
// Article fixtures (5 documents; covers full-text content)
// ---------------------------------------------------------------------------

export const ARTICLE_FIXTURES: SearchDocument[] = [
  makeArticle({ id: "a1", title: "Getting Started with TypeScript",  content: "TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript",               author: "alice", wordCount: 1200 }),
  makeArticle({ id: "a2", title: "Advanced TypeScript Patterns",     content: "Explore decorators, generics, and conditional types in TypeScript for large-scale applications",    author: "alice", wordCount: 2400 }),
  makeArticle({ id: "a3", title: "Search Engine Fundamentals",       content: "Understanding inverted indexes, BM25 scoring, tokenisation, and relevance in search engines",       author: "bob",   wordCount: 1800 }),
  makeArticle({ id: "a4", title: "Building a Search API",            content: "Design patterns for building a scalable and resilient full-text search REST API backend service",   author: "charlie", wordCount: 900 }),
  makeArticle({ id: "a5", title: "Elasticsearch vs Meilisearch",     content: "Comparing popular full-text search backends on relevance quality, performance, and feature set",   author: "bob",   wordCount: 3000 }),
];

// ---------------------------------------------------------------------------
// Tenant-scoped articles (for multitenancy plugin tests)
// ---------------------------------------------------------------------------

export const TENANT_ARTICLE_FIXTURES: SearchDocument[] = [
  makeArticle({ id: "ta1", title: "Tenant Alpha Report",       author: "alice", wordCount: 500,  tenantId: "alpha" }),
  makeArticle({ id: "ta2", title: "Tenant Beta Announcement",  author: "bob",   wordCount: 300,  tenantId: "beta"  }),
  makeArticle({ id: "ta3", title: "Tenant Alpha Update",       author: "carol", wordCount: 400,  tenantId: "alpha" }),
  makeArticle({ id: "ta4", title: "Tenant Beta Roadmap",       author: "dave",  wordCount: 700,  tenantId: "beta"  }),
];

/** IDs belonging to tenant "alpha". */
export const ALPHA_TENANT_IDS = TENANT_ARTICLE_FIXTURES
  .filter((d) => d.tenantId === "alpha")
  .map((d) => String(d.id));

/** IDs belonging to tenant "beta". */
export const BETA_TENANT_IDS = TENANT_ARTICLE_FIXTURES
  .filter((d) => d.tenantId === "beta")
  .map((d) => String(d.id));
