export function createMemoryChatProvider() {
    const rooms = {};
    const messages = {};
    const listeners = {};
    return {
        async connect() {
            // no-op for memory
            return Promise.resolve();
        },
        async listRooms() {
            return Object.values(rooms);
        },
        async createRoom(name) {
            const id = `room_${Object.keys(rooms).length + 1}`;
            const room = { _id: id, name, createdAt: new Date().toISOString(), t: 'c' };
            rooms[id] = room;
            messages[id] = [];
            listeners[id] = [];
            return room;
        },
        async sendMessage(roomId, text) {
            const msg = { _id: `m_${Date.now()}`, rid: roomId, msg: text, ts: new Date().toISOString(), u: { _id: 'system', username: 'system' } };
            messages[roomId] = messages[roomId] || [];
            messages[roomId].push(msg);
            (listeners[roomId] || []).forEach((cb) => cb(msg));
            return msg;
        },
        async getMessages(roomId) {
            return messages[roomId] || [];
        },
        async subscribeToRoom(roomId, cb) {
            listeners[roomId] = listeners[roomId] || [];
            listeners[roomId].push(cb);
            return () => {
                listeners[roomId] = (listeners[roomId] || []).filter((f) => f !== cb);
            };
        },
    };
}
