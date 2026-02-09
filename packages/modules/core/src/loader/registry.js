const queries = {};
const mutations = {};
const subscriptions = {};
export function registerQuery(name, operation) {
    queries[name] = operation;
}
export function registerMutation(name, operation) {
    mutations[name] = operation;
}
export function registerSubscription(name, operation) {
    subscriptions[name] = operation;
}
export function getQuery(name) {
    return queries[name];
}
export function getMutation(name) {
    return mutations[name];
}
export function getSubscription(name) {
    return subscriptions[name];
}
