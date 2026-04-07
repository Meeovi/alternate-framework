"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var eslint_merge_processors_1 = require("eslint-merge-processors");
var eslint_plugin_vue_1 = require("eslint-plugin-vue");
var eslint_processor_vue_blocks_1 = require("eslint-processor-vue-blocks");
var js_1 = require("@eslint/js");
var eslint_plugin_1 = require("@graphql-eslint/eslint-plugin");
exports.default = __spreadArray(__spreadArray([
    {
        files: ['**/*.js'],
        processor: eslint_plugin_1.default.processor,
        rules: js_1.default.configs.recommended.rules,
    }
], eslint_plugin_vue_1.default.configs['flat/recommended'], true), [
    {
        files: ['**/*.vue'],
        // Vue still needs to be parsed by the Vue parser for normal linting. But GraphQL's lint needs to lint only the JS/TS part,
        // so extract those as blocks using eslint-processor-vue-blocks. This turns the script parts of Vue SFCs into virtual JS/TS
        // blocks inside ESLint. ESLint can then parse the JS/TS to find GraphQL parts. And finally, graphql-eslint can lint the resulting GraphQL
        processor: (0, eslint_merge_processors_1.mergeProcessors)([
            eslint_plugin_vue_1.default.processors.vue,
            (0, eslint_processor_vue_blocks_1.default)({
                blocks: {
                    script: true,
                    scriptSetup: true,
                    customBlocks: true,
                },
            }),
        ]),
    },
    {
        files: ['**/*.graphql'],
        languageOptions: {
            parser: eslint_plugin_1.default.parser,
        },
        plugins: {
            '@graphql-eslint': eslint_plugin_1.default,
        },
        rules: {
            '@graphql-eslint/no-anonymous-operations': 'error',
            '@graphql-eslint/no-duplicate-fields': 'error',
            '@graphql-eslint/naming-convention': [
                'error',
                {
                    OperationDefinition: {
                        style: 'PascalCase',
                        forbiddenPrefixes: ['Query', 'Mutation', 'Subscription', 'Get'],
                        forbiddenSuffixes: ['Query', 'Mutation', 'Subscription'],
                    },
                },
            ],
        },
    },
], false);
