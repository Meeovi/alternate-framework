import { registerSocialProvider } from '../registry';
import { getSocialConfig } from '../config';
async function mastodonFetch(path, options = {}) {
    const { baseUrl, apiKey } = getSocialConfig();
    const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            ...(options.headers || {})
        }
    });
    if (!res.ok)
        throw new Error(`Mastodon error: ${res.status}`);
    return res.json();
}
const MastodonProvider = {
    async getProfile(handle) {
        const data = await mastodonFetch(`/api/v1/accounts/lookup?acct=${handle}`);
        return {
            id: data.id,
            username: data.acct,
            displayName: data.display_name,
            avatarUrl: data.avatar,
            url: data.url
        };
    },
    async listPosts(handle) {
        const profile = await this.getProfile(handle);
        const data = await mastodonFetch(`/api/v1/accounts/${profile.id}/statuses`);
        return data.map((status) => ({
            id: status.id,
            content: status.content,
            createdAt: status.created_at,
            author: profile,
            url: status.url
        }));
    }
};
registerSocialProvider('mastodon', MastodonProvider);
