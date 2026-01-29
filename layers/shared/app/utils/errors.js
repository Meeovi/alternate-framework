import { ZodError } from 'zod';
import { isNuxtError } from '#imports';
export function isNuxtZodError(err) {
    return (isNuxtError(err)
        && err.data?.data instanceof ZodError);
}
