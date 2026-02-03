import { Ref } from 'vue';

declare type VsfRef = <T>(data?: T, key?: string) => Ref<T>;
interface SSRConfiguration {
    onSSR: (fn: () => void) => any;
    vsfRef: VsfRef;
}
declare let onSSR: (callback: Function, target?: import("vue").ComponentInternalInstance) => Function;
declare let vsfRef: VsfRef;
declare const configureSSR: (config: SSRConfiguration) => void;
export { onSSR, vsfRef, configureSSR };
