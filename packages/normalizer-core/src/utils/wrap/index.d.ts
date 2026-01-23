import { Ref, UnwrapRef } from 'vue';

export default function wrap<T>(element: Ref<UnwrapRef<T>> | T): Ref<UnwrapRef<T>>;
