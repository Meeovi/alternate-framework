import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defu } from 'defu';
import { defineNuxtModule, addImportsDir } from '@nuxt/kit';
import { joinURL } from 'ufo';
import { $fetch } from 'ofetch';
function normalizeDirectusParams(params = {}) {
    const query = { ...params };
    if (query.filter && typeof query.filter === 'object') {
        query.filter = JSON.stringify(query.filter);
    }
    if (query.deep && typeof query.deep === 'object') {
        query.deep = JSON.stringify(query.deep);
    }
    return query;
}
function createDirectusClient(config = {}) {
    const { url, staticToken } = config;
    const directusUrl = url;
    if (!directusUrl) {
        throw new Error('Directus URL is required');
    }
    return {
        readItems: async (collection, params = {}) => {
            const response = await $fetch(`${directusUrl}/items/${collection}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return Array.isArray(response?.data) ? response.data : [];
        },
        readItem: async (collection, id, params = {}) => {
            const response = await $fetch(`${directusUrl}/items/${collection}/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        readFieldsByCollection: async (collection, params = {}) => {
            const response = await $fetch(`${directusUrl}/fields/${collection}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return Array.isArray(response?.data) ? response.data : [];
        },
        createItem: async (collection, payload) => {
            const response = await $fetch(`${directusUrl}/items/${collection}`, {
                method: 'POST',
                body: payload,
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        updateItem: async (collection, id, payload = {}) => {
            const response = await $fetch(`${directusUrl}/items/${collection}/${id}`, {
                method: 'PATCH',
                body: payload,
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        deleteItem: async (collection, id) => {
            await $fetch(`${directusUrl}/items/${collection}/${id}`, {
                method: 'DELETE',
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return true;
        },
        readUsers: async (params = {}) => {
            const response = await $fetch(`${directusUrl}/users`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || [];
        },
        readUser: async (id, params = {}) => {
            const response = await $fetch(`${directusUrl}/users/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        readRoles: async (params = {}) => {
            const response = await $fetch(`${directusUrl}/roles`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || [];
        },
        readRole: async (id, params = {}) => {
            const response = await $fetch(`${directusUrl}/roles/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        readFolders: async (params = {}) => {
            const response = await $fetch(`${directusUrl}/folders`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || [];
        },
        readFolder: async (id, params = {}) => {
            const response = await $fetch(`${directusUrl}/folders/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        readFiles: async (params = {}) => {
            const response = await $fetch(`${directusUrl}/files`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || [];
        },
        readFile: async (id, params = {}) => {
            const response = await $fetch(`${directusUrl}/files/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        readFlows: async (params = {}) => {
            const response = await $fetch(`${directusUrl}/flows`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || [];
        },
        readFlow: async (id, params = {}) => {
            const response = await $fetch(`${directusUrl}/flows/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        readShares: async (params = {}) => {
            const response = await $fetch(`${directusUrl}/shares`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || [];
        },
        readShare: async (id, params = {}) => {
            const response = await $fetch(`${directusUrl}/shares/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        readPanels: async (params = {}) => {
            const response = await $fetch(`${directusUrl}/panels`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || [];
        },
        readPanel: async (id, params = {}) => {
            const response = await $fetch(`${directusUrl}/panels/${id}`, {
                method: 'GET',
                query: normalizeDirectusParams(params),
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        createItems: async (collection, items) => {
            const response = await $fetch(`${directusUrl}/items/${collection}`, {
                method: 'POST',
                body: items,
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        updateItems: async (collection, keysOrQuery, item = {}) => {
            let body;
            if (Array.isArray(keysOrQuery)) {
                body = { keys: keysOrQuery, data: item };
            } else if (typeof keysOrQuery === 'object' && keysOrQuery !== null) {
                body = { query: keysOrQuery, data: item };
            } else {
                body = item;
            }
            const response = await $fetch(`${directusUrl}/items/${collection}`, {
                method: 'PATCH',
                body,
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        deleteItems: async (collection, keysOrQuery) => {
            const body = Array.isArray(keysOrQuery)
                ? { keys: keysOrQuery }
                : keysOrQuery;
            await $fetch(`${directusUrl}/items/${collection}`, {
                method: 'DELETE',
                body,
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return true;
        },
        uploadFiles: async (formData) => {
            const response = await $fetch(`${directusUrl}/files`, {
                method: 'POST',
                body: formData,
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
            });
            return response?.data || null;
        },
        getAssetUrl: (file) => {
            const fileId = file?.id || file?.directus_files_id?.id || file?.filename_disk || file;
            if (!directusUrl || !fileId)
                return '';
            return `${directusUrl}/assets/${fileId}`;
        },
        request: async (path, options = {}) => {
            return $fetch(`${directusUrl}${path}`, {
                headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
                ...options,
            });
        },
    };
}
export default defineNuxtModule({
    meta: {
        name: '@mframework/adapter-directus',
        configKey: 'adapterDirectus',
        compatibility: { nuxt: '>=4.0.0' },
    },
    defaults: {
        url: process.env.NUXT_PUBLIC_DIRECTUS_URL,
        autoFetch: true,
        autoRefresh: false,
        devtools: false,
        cookieNameToken: 'directus_token',
        cookieNameRefreshToken: 'directus_refresh_token',
        cookieMaxAge: 604800000,
        cookieSameSite: 'lax',
        cookieSecure: false,
    },
    setup(options, nuxt) {
        // -----------------------------
        // 1. Fix runtimeConfig typing
        // -----------------------------
        const publicRuntimeConfig = nuxt.options.runtimeConfig.public;
        const publicConfig = (publicRuntimeConfig.directus ??= {});
        publicRuntimeConfig.directus = defu(publicConfig, {
            url: options.url,
            autoFetch: options.autoFetch,
            autoRefresh: options.autoRefresh,
            onAutoRefreshFailure: options.onAutoRefreshFailure,
            fetchUserParams: options.fetchUserParams,
            token: options.token,
            devtools: options.devtools,
            cookieNameToken: options.cookieNameToken,
            cookieNameRefreshToken: options.cookieNameRefreshToken,
            cookieMaxAge: options.cookieMaxAge,
            cookieSameSite: options.cookieSameSite,
            cookieSecure: options.cookieSecure,
        });
        // -----------------------------
        // 2. Transpile runtime
        // -----------------------------
        const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url));
        nuxt.options.build.transpile.push(runtimeDir);
        // -----------------------------
        // 3. Expose composables
        // -----------------------------
        addImportsDir(resolve(runtimeDir, 'composables'));
        nuxt.hook('alternate:registerAdapter', (registry) => {
            registry.register('content', 'directus', (config) => {
                return createDirectusClient({ url: options.url, staticToken: options.token });
            });
        });
        // -----------------------------
        // 5. Devtools integration
        // -----------------------------
        if (options.devtools) {
            const directusConfig = publicRuntimeConfig.directus;
            const adminUrl = joinURL(directusConfig.url || '', '/admin/');
            nuxt.hook('devtools:customTabs', (tabs) => {
                tabs.push({
                    name: 'directus',
                    title: 'Directus',
                    icon: 'simple-icons:directus',
                    view: { type: 'iframe', src: adminUrl },
                });
            });
        }
    },
});
