"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEARCH_CONTRACT_INVARIANTS = void 0;
exports.SEARCH_CONTRACT_INVARIANTS = [
    'Search query text must be sanitized and bounded.',
    'Search pagination must always be bounded.',
    'Search output must always include pagination metadata.',
    'Search capability must enforce ACL before querying adapters.',
    'Search output must not leak provider-specific fields.',
];
