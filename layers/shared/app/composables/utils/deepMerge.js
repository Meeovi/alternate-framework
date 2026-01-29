import { isObject } from './isObject';
export function deepMerge(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (isObject(sourceValue) && isObject(targetValue)) {
            output[key] = deepMerge(targetValue, sourceValue);
        }
        else {
            output[key] = sourceValue;
        }
    }
    return output;
}
