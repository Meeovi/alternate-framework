import { defineComponent, provide } from 'vue';
import type { MeeoviDirectusClient } from '../client/createClient';

export const DirectusKey = Symbol('DirectusClient');

export default defineComponent({
  name: 'DirectusProvider',
  props: {
    client: { type: Object, required: true }
  },
  setup(props, { slots }) {
    provide(DirectusKey, props.client as MeeoviDirectusClient<any>);
    return () => slots.default?.();
  }
});
