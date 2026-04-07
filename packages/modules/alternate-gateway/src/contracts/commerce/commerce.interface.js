"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMERCE_CONTRACT_INVARIANTS = void 0;
exports.COMMERCE_CONTRACT_INVARIANTS = [
    'Commerce money values must be finite and non-negative.',
    'Commerce product IDs and cart IDs must be non-empty strings.',
    'Commerce capabilities must enforce ACL and actor ownership checks.',
    'Commerce capabilities must return normalized DTOs without provider-specific fields.',
    'Commerce list responses must always contain pagination metadata.',
];
