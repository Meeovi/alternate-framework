import { unwrap } from './utils';
export const createStarterAuthAdapter = (transport) => ({
    async login(input) {
        const res = await transport.request('POST', '/auth/login', {
            body: input
        });
        return unwrap(res);
    },
    async register(input) {
        const res = await transport.request('POST', '/auth/register', {
            body: input
        });
        return unwrap(res);
    },
    async logout() {
        const res = await transport.request('POST', '/auth/logout');
        return unwrap({ ...res, data: true });
    },
    async getSession() {
        const res = await transport.request('GET', '/auth/session');
        return unwrap(res);
    },
    async refresh() {
        const res = await transport.request('POST', '/auth/refresh');
        return unwrap(res);
    },
    async getUser() {
        const res = await transport.request('GET', '/auth/user');
        return unwrap(res);
    }
});
