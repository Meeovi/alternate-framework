const queries = {};
const mutations = {};
const subscriptions = {};
function setNested(map, ns, value) {
    const parts = ns.split('.');
    let current = map;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        current[part] = current[part] || {};
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}
function getNested(map, ns) {
    const parts = ns.split('.');
    let current = map;
    for (const part of parts) {
        current = current?.[part];
        if (!current)
            return undefined;
    }
    return current;
}
export function registerNamespacedQuery(namespace, name, op) {
    setNested(queries, `${namespace}.${name}`, op);
}
export function registerNamespacedMutation(namespace, name, op) {
    setNested(mutations, `${namespace}.${name}`, op);
}
export function registerNamespacedSubscription(namespace, name, op) {
    setNested(subscriptions, `${namespace}.${name}`, op);
}
export function getQuery(ns) {
    return getNested(queries, ns);
}
export function getMutation(ns) {
    return getNested(mutations, ns);
}
export function getSubscription(ns) {
    return getNested(subscriptions, ns);
}
