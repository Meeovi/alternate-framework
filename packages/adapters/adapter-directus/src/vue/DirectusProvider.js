import { defineComponent, provide } from 'vue';
export const DirectusKey = Symbol('DirectusClient');
export default defineComponent({
    name: 'DirectusProvider',
    props: {
        client: { type: Object, required: true }
    },
    setup(props, { slots }) {
        provide(DirectusKey, props.client);
        return () => slots.default?.();
    }
});
