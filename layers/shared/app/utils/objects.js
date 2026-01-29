// Clone an onbject deeply
export function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// Clone an array deeply
export function cloneArray(arr) {
    return JSON.parse(JSON.stringify(arr));
}
export function isObject(objValue) {
    return objValue && typeof objValue === 'object' && objValue.constructor === Object;
}
