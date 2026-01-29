#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAlternateApp } from '@meeovi/core';
import searchModule from './module';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function run() {
    const [, , command, arg] = process.argv;
    const defaultProvider = process.env.SEARCH_PROVIDER === 'meilisearch' ? 'meilisearch' : 'opensearch';
    const app = createAlternateApp({
        config: {
            env: 'production',
            search: {
                defaultProvider,
                providers: {
                    opensearch: {
                        endpoint: process.env.OPENSEARCH_ENDPOINT,
                        index: process.env.OPENSEARCH_INDEX
                    },
                    meilisearch: {
                        host: process.env.MEILI_HOST,
                        index: process.env.MEILI_INDEX,
                        apiKey: process.env.MEILI_KEY
                    }
                }
            }
        },
        modules: [searchModule]
    });
    const ctx = await app.start();
    const search = ctx.getAdapter('search');
    if (!search) {
        console.error('No search adapter registered');
        process.exit(1);
    }
    if (command === 'warmup') {
        console.log('Warming up search provider...');
        await search.search({ term: 'warmup' });
        console.log('Warmup complete');
        return;
    }
    if (command === 'index') {
        if (!arg) {
            console.error('Missing file path: meeovi-search index <file.json>');
            process.exit(1);
        }
        const filePath = path.resolve(process.cwd(), arg);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`Indexing ${data.length} items...`);
        if (search.id === 'search:opensearch') {
            // TODO: implement bulk indexing
        }
        if (search.id === 'search:meilisearch') {
            await fetch(`${process.env.MEILI_HOST}/indexes/${process.env.MEILI_INDEX}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.MEILI_KEY}`
                },
                body: JSON.stringify(data)
            });
        }
        console.log('Indexing complete');
        return;
    }
    console.log(`Unknown command: ${command}`);
}
run();
