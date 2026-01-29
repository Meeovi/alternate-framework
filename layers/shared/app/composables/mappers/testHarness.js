import { MapperError } from './errors';
export async function runMapperTests(options) {
    const { mapper, cases } = options;
    for (const testCase of cases) {
        const { name, input, expected, snapshot } = testCase;
        try {
            const result = await maybeAsync(mapper.map, input);
            // Snapshot mode (stringified)
            if (snapshot) {
                const snap = JSON.stringify(result, null, 2);
                console.log(`\n📸 Snapshot for "${mapper.name}" → "${name}":\n${snap}\n`);
            }
            // Function-based expectation
            if (isExpectedFunction(expected)) {
                await expected(result);
                continue;
            }
            // Deep equality check
            const pass = deepEqual(result, expected);
            if (!pass) {
                throw new MapperError(`Mapper "${mapper.name}" test "${name}" failed.\n` +
                    diffString(expected, result));
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new MapperError(`Mapper "${mapper.name}" test "${name}" threw an error:\n${error.message}`);
            }
            throw error;
        }
    }
}
/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
async function maybeAsync(fn, input) {
    return await fn(input);
}
function isExpectedFunction(value) {
    return typeof value === 'function';
}
function deepEqual(a, b) {
    if (Object.is(a, b))
        return true;
    if (typeof a !== 'object' ||
        typeof b !== 'object' ||
        a === null ||
        b === null) {
        return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length)
        return false;
    for (const key of aKeys) {
        if (!deepEqual(a[key], b[key]))
            return false;
    }
    return true;
}
/**
 * Pretty diff output (no deps)
 */
function diffString(expected, received) {
    const exp = JSON.stringify(expected, null, 2);
    const rec = JSON.stringify(received, null, 2);
    return (`\nExpected:\n${indent(exp)}\n\nReceived:\n${indent(rec)}\n` +
        `\nDiff:\n${indent(generateDiff(exp, rec))}`);
}
function indent(str) {
    return str
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');
}
/**
 * Minimal diff generator (line-by-line)
 */
function generateDiff(a, b) {
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    const max = Math.max(aLines.length, bLines.length);
    const diff = [];
    for (let i = 0; i < max; i++) {
        const left = aLines[i];
        const right = bLines[i];
        if (left === right) {
            diff.push(`  ${left ?? ''}`);
        }
        else {
            if (left !== undefined)
                diff.push(`- ${left}`);
            if (right !== undefined)
                diff.push(`+ ${right}`);
        }
    }
    return diff.join('\n');
}
