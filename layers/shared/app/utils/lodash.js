export function omit(object, keysToOmit) {
    const result = { ...object };
    for (const key of keysToOmit) {
        delete result[key];
    }
    return result;
}
export function get(object, path, defaultValue) {
    if (typeof path === 'string') {
        path = path.split('.').map((key) => {
            const numKey = Number(key);
            return isNaN(numKey) ? key : numKey;
        });
    }
    let result = object;
    for (const key of path) {
        if (result === undefined || result === null) {
            return defaultValue;
        }
        result = result[key];
    }
    return result !== undefined ? result : defaultValue;
}
