export class MeeoviError extends Error {
    code;
    cause;
    constructor(message, options) {
        super(message);
        this.name = 'MeeoviError';
        this.code = options?.code;
        this.cause = options?.cause;
    }
}
export function isAlternateError(err) {
    return err instanceof MeeoviError;
}
