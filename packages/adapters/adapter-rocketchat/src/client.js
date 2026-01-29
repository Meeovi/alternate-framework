export class RocketChatClient {
    baseUrl;
    token;
    userId;
    constructor(baseUrl, token, userId) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.token = token;
        this.userId = userId;
    }
    headers() {
        const h = { 'Content-Type': 'application/json' };
        if (this.token) {
            h['X-Auth-Token'] = this.token;
        }
        if (this.userId) {
            h['X-User-Id'] = this.userId;
        }
        return h;
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}/api/v1/${path.replace(/^\//, '')}`;
        const res = await fetch(url, {
            method,
            headers: this.headers(),
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok)
            throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        const json = await res.json();
        return (json.data ?? json.result ?? json);
    }
    // Simple login helper (returns auth token + userId)
    async login(username, password) {
        const res = await this.request('POST', '/login', { user: username, password });
        // Rocket.Chat returns data: { userId, authToken }
        return res;
    }
}
