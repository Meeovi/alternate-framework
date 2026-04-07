"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_CONTRACT_INVARIANTS = void 0;
exports.AUTH_CONTRACT_INVARIANTS = [
    'Access tokens must always be non-empty strings.',
    'Refresh tokens must always be non-empty strings.',
    'User IDs must always be UUID strings.',
    'Token responses must include ISO expiration timestamps.',
    'Capabilities must not expose provider-specific auth payload fields.',
];
