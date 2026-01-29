import { getRegistry } from './index';
export const auth = {
    login: (input) => getRegistry().auth?.login(input),
    register: (input) => getRegistry().auth?.register(input),
    logout: () => getRegistry().auth?.logout(),
    getSession: () => getRegistry().auth?.getSession(),
    refresh: () => getRegistry().auth?.refresh(),
    getUser: () => getRegistry().auth?.getUser()
};
