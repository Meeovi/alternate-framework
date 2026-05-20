import { ref } from 'vue';
const stateStore = new Map();
export const useState = (key, init) => {
    if (!stateStore.has(key)) {
        stateStore.set(key, ref(init ? init() : undefined));
    }
    return stateStore.get(key);
};
export const useAsyncData = async (handler) => {
    try {
        const value = await handler();
        return {
            data: ref(value),
            error: ref(null),
        };
    }
    catch (error) {
        return {
            data: ref(null),
            error: ref(error),
        };
    }
};
export const useRuntimeConfig = () => ({ public: {} });
export const __resetNuxtState = () => {
    stateStore.clear();
};
