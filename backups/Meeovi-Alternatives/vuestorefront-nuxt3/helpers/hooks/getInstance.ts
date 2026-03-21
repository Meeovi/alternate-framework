import { getCurrentInstance } from '#imports';

export const getInstance = () => {
  const vm = getCurrentInstance();

  if (vm) return vm.root;

  throw new ReferenceError('[vue-hooks] Not found vue instance.');
};
