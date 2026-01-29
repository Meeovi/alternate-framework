import { ref } from 'vue';
export const useAtproto = () => {
    const { $atproto } = useNuxtApp();
    const session = ref(null);
    const error = ref(null);
    const login = async (identifier, password) => {
        try {
            const res = await $atproto.login({ identifier, password });
            session.value = res;
            return res;
        }
        catch (err) {
            error.value = err.message;
            throw err;
        }
    };
    const register = async (email, handle, password, inviteCode) => {
        try {
            const res = await $atproto.createAccount({ email, handle, password, inviteCode });
            session.value = res;
            return res;
        }
        catch (err) {
            error.value = err.message;
            throw err;
        }
    };
    const createPost = async (text, embed, reply) => {
        return await $atproto.post({
            text,
            createdAt: new Date().toISOString(),
            embed,
            reply
        });
    };
    const getTimeline = async (limit = 20) => {
        const res = await $atproto.getTimeline({ limit });
        return res.data.feed;
    };
    const logout = async () => {
        session.value = null;
        error.value = null;
        $atproto.sessionManager.clearSession();
    };
    return {
        session,
        error,
        login,
        register,
        createPost,
        getTimeline,
        logout
    };
};
