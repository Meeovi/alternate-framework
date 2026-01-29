export function getCurrentSellerId() {
    try {
        const nuxtApp = useNuxtApp();
        const authUser = nuxtApp?.$auth?.user ?? undefined;
        if (authUser?.id && (authUser.role === 'seller' || (authUser.roles && authUser.roles.includes('seller'))))
            return authUser.id;
        const stateUser = useState('authUser')?.value ?? useState('user')?.value;
        if (stateUser?.id && (stateUser.role === 'seller' || (stateUser.roles && stateUser.roles.includes('seller'))))
            return stateUser.id;
        return undefined;
    }
    catch (e) {
        return undefined;
    }
}
