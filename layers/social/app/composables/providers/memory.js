import { registerSocialProvider } from '../registry';
const memoryProfiles = {};
const memoryPosts = {};
const MemoryProvider = {
    async getProfile(handle) {
        if (!memoryProfiles[handle]) {
            memoryProfiles[handle] = { id: handle, username: handle, displayName: handle };
        }
        return memoryProfiles[handle];
    },
    async listPosts(handle, options) {
        const posts = memoryPosts[handle] || [];
        const limit = options?.limit || 20;
        return posts.slice(0, limit);
    },
    async createPost(content, options) {
        const handle = options?.handle || 'local';
        const profile = await this.getProfile(handle);
        const post = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            content,
            createdAt: new Date().toISOString(),
            author: profile
        };
        if (!memoryPosts[handle])
            memoryPosts[handle] = [];
        memoryPosts[handle].unshift(post);
        return post;
    }
};
registerSocialProvider('memory', MemoryProvider);
export default MemoryProvider;
