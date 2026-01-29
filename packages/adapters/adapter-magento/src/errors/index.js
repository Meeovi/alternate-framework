export class MagentoError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
    }
}
function mapErrorCode(err) {
    if (err?.response?.errors)
        return 'BAD_REQUEST';
    if (err?.code === 'ETIMEDOUT')
        return 'TIMEOUT';
    if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED')
        return 'NETWORK';
    return 'UNKNOWN';
}
export async function safeCall(fn) {
    try {
        return await fn();
    }
    catch (err) {
        const code = mapErrorCode(err);
        throw new MagentoError('Magento request failed', code, err);
    }
}
