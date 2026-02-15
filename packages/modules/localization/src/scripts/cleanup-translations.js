import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';
import { flatten, unflatten } from 'flat';
import { createResolver } from 'nuxt/kit';
import { currentLocales } from '../config/i18n';
const resolver = createResolver(import.meta.url);
const sourceLanguageLocale = currentLocales.find(l => l.code === 'en-US');
function merge(src, dst) {
    for (const key in src) {
        if (typeof src[key] === 'object') {
            if (!dst[key])
                dst[key] = {};
            merge(src[key], dst[key]);
        }
        else {
            dst[key] = src[key];
        }
    }
}
const sourceFiles = sourceLanguageLocale.files ? sourceLanguageLocale.files : [sourceLanguageLocale.file];
const sourceTranslations = {};
for (const file of sourceFiles) {
    const data = JSON.parse(Buffer.from(await readFile(resolver.resolve(`../locales/${file}`), 'utf-8')).toString());
    merge(flatten(data), sourceTranslations);
}
async function removeOutdatedTranslations() {
    for (const locale of currentLocales.filter(l => l.code !== 'en-US')) {
        const files = locale.files ? locale.files : [locale.file];
        for (const file of files) {
            const path = resolver.resolve(`../locales/${file}`);
            const data = JSON.parse(Buffer.from(await readFile(path, 'utf-8')).toString());
            const targetTranslations = flatten(data);
            for (const key in targetTranslations) {
                if (!sourceTranslations[key])
                    delete targetTranslations[key];
            }
            const unflattened = unflatten(targetTranslations);
            await writeFile(path, `${JSON.stringify(unflattened, null, 2)}\n`, { encoding: 'utf-8' });
        }
    }
}
removeOutdatedTranslations();
