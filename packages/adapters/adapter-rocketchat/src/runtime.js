import { RocketChatClient } from './client';
import { RocketChatRealtime } from './realtime';
import { normalizeMessage, normalizeRoom, normalizeUser } from './normalizers';
export function createRocketChatProvider(opts) {
    const client = new RocketChatClient(opts.baseUrl, opts.token, opts.userId);
    const realtime = new RocketChatRealtime(opts.baseUrl, opts.token, opts.userId);
    return {
        async connect() {
            // noop; token is provided externally or login can be used
            return;
        },
        async login(username, password) {
            const res = await client.login(username, password);
            // caller can persist token
            return res;
        },
        async listRooms() {
            const res = await client.request('GET', '/rooms.get');
            const list = (res?.update ?? res?.rooms ?? res);
            return list.map(normalizeRoom);
        },
        async getRoom(roomId) {
            const res = await client.request('GET', `/rooms.info?roomId=${encodeURIComponent(roomId)}`);
            return normalizeRoom(res?.room ?? res);
        },
        async createRoom(name) {
            const res = await client.request('POST', '/rooms.create', { name });
            return normalizeRoom(res?.room ?? res);
        },
        async createDirectMessage(userId) {
            const res = await client.request('POST', '/im.create', { userId });
            return normalizeRoom(res?.room ?? res);
        },
        async getMessages(roomId, params) {
            const count = params?.count ?? 50;
            const res = await client.request('GET', `/channels.messages?roomId=${encodeURIComponent(roomId)}&count=${count}`);
            const msgs = (res?.messages ?? res);
            return msgs.map(normalizeMessage);
        },
        async sendMessage(roomId, text) {
            const res = await client.request('POST', '/chat.postMessage', { roomId, text });
            return normalizeMessage(res?.message ?? res);
        },
        async getUsers(query) {
            const res = await client.request('GET', `/users.list?query=${encodeURIComponent(JSON.stringify(query ?? {}))}`);
            const users = (res?.users ?? res?.items ?? res);
            return users.map(normalizeUser);
        },
        async getUser(idOrUsername) {
            const res = await client.request('GET', `/users.info?userId=${encodeURIComponent(idOrUsername)}`);
            return normalizeUser(res?.user ?? res);
        },
        async subscribeToRoom(roomId, cb) {
            try {
                await realtime.connect();
                // start subscription; return unsubscribe function
                const unsub = await realtime.subscribe(roomId, cb);
                return unsub;
            }
            catch (err) {
                console.warn('subscribeToRoom failed', err);
                return () => { };
            }
        },
    };
}
