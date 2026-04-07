"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_CONTRACT_INVARIANTS = void 0;
exports.SOCIAL_CONTRACT_INVARIANTS = [
    'Social actor and target IDs must be UUID strings.',
    'Social feed responses must include pagination metadata.',
    'Social post content must be sanitized and bounded.',
    'Social capability must enforce ACL checks before adapter calls.',
    'Social output must not include provider-specific fields.',
];
