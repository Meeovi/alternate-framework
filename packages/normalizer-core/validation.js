import { ValidationError } from './errors';
function runValidator(key, validator, value) {
    try {
        return validator(value);
    }
    catch (err) {
        if (err instanceof ValidationError) {
            err.path.unshift(key);
            throw err;
        }
        throw new ValidationError(String(err instanceof Error ? err.message : err), [key]);
    }
}
export function validate(schema, input) {
    const obj = input;
    if (!obj || typeof obj !== 'object') {
        throw new ValidationError('Expected object as input');
    }
    const out = {};
    for (const k in schema) {
        const desc = schema[k];
        const optional = desc && typeof desc === 'object' && 'validator' in desc ? !!desc.optional : false;
        const validator = desc && typeof desc === 'object' && 'validator' in desc ? desc.validator : desc;
        const val = obj[k];
        if (val === undefined || val === null) {
            if (optional) {
                ;
                out[k] = undefined;
                continue;
            }
            throw new ValidationError(`Missing required field '${k}'`, [k]);
        }
        ;
        out[k] = runValidator(k, validator, val);
    }
    return out;
}
// Primitive validators
export const validators = {
    string: (v) => {
        if (typeof v !== 'string')
            throw new ValidationError('Expected string');
        return v;
    },
    number: (v) => {
        if (typeof v !== 'number')
            throw new ValidationError('Expected number');
        return v;
    },
    boolean: (v) => {
        if (typeof v !== 'boolean')
            throw new ValidationError('Expected boolean');
        return v;
    },
    dateString: (v) => {
        if (typeof v !== 'string' || Number.isNaN(Date.parse(v)))
            throw new ValidationError('Expected ISO date string');
        return v;
    },
    json: (v) => v,
    array: (itemValidator) => (v) => {
        if (!Array.isArray(v))
            throw new ValidationError('Expected array');
        return v.map((item, i) => {
            try {
                return itemValidator(item);
            }
            catch (err) {
                if (err instanceof ValidationError) {
                    err.path.unshift(String(i));
                    throw err;
                }
                throw new ValidationError(String(err instanceof Error ? err.message : err), [String(i)]);
            }
        });
    }
};
export const optional = (validator) => ({ validator, optional: true });
