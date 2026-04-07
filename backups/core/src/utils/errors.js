export class MeeoviError extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'MeeoviError';
        this.code = options?.code;
        this.cause = options?.cause;
    }
}
export function isMFrameworkError(err) {
    return err instanceof MeeoviError;
}
