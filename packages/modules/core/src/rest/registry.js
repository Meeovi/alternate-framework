const restEndpoints = {};
export function registerRestEndpoint(name, endpoint) {
    restEndpoints[name] = endpoint;
}
export function getRestEndpoint(name) {
    return restEndpoints[name];
}
