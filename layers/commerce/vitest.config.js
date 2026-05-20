import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'app'),
            '@': path.resolve(__dirname, 'app'),
            '#imports': path.resolve(__dirname, 'app/imports'),
            'nuxt/app': path.resolve(__dirname, 'test/mocks/nuxt-app.ts'),
        },
    },
    test: {
        globals: true,
        setupFiles: ['test/setup.ts'],
        include: [
            'app/composables/**/*.test.ts',
            'app/composables/**/__tests__/**/*.spec.ts',
        ],
        exclude: ['dist/**', 'node_modules/**'],
    },
});
