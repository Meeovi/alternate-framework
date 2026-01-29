import { createMapper } from './createMapper';
import { MapperError } from './errors';
export function createZodMapper(options) {
    const { name, inputSchema, outputSchema, map } = options;
    return createMapper(name, (rawInput) => {
        const parsedInput = inputSchema.safeParse(rawInput);
        if (!parsedInput.success) {
            throw new MapperError(`Mapper "${name}" input validation failed: ${parsedInput.error?.message ?? 'validation error'}`);
        }
        const input = parsedInput.data;
        const output = map(input);
        if (typeof output === 'undefined') {
            throw new MapperError(`Mapper "${name}" produced undefined output`);
        }
        const parsedOutput = outputSchema.safeParse(output);
        if (!parsedOutput.success) {
            throw new MapperError(`Mapper "${name}" output validation failed: ${parsedOutput.error?.message ?? 'validation error'}`);
        }
        return parsedOutput.data;
    });
}
