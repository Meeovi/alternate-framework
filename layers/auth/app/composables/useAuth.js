import { createAuthClient } from 'better-auth/client';
import { getAuthPlugins } from '../utils/plugins';
export function useAuth(options = {}) {
    const { client: providedClient, baseURL, headers, payment = 'stripe', reload } = options;
    const client = providedClient || createAuthClient({
        baseURL: baseURL || undefined,
        fetchOptions: {
            headers
        },
        socialProviders: {
            github: {
                clientId: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET
            },
            microsoft: {
                clientId: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET
            },
            twitter: {
                clientId: process.env.TWITTER_CLIENT_ID,
                clientSecret: process.env.TWITTER_CLIENT_SECRET
            }
        },
        plugins: getAuthPlugins({
            subscription: true
        })
    });
    let session = null;
    let user = null;
    let subscriptions = [];
    let polarState = null;
    let sessionFetching = false;
    const fetchSession = async () => {
        if (sessionFetching)
            return;
        sessionFetching = true;
        const { data } = await client.getSession();
        session = data?.session || null;
        const userDefaults = {
            image: null,
            role: null,
            banReason: null,
            banned: null,
            banExpires: null,
            stripeCustomerId: null
        };
        user = data?.user ? Object.assign({}, userDefaults, data.user) : null;
        subscriptions = [];
        if (user) {
            if (payment == 'stripe') {
                const { data: subscriptionData } = await client.subscription.list();
                subscriptions = subscriptionData || [];
            }
            else if (payment == 'polar') {
                const { data: customerState } = await client.customer.state();
                polarState = customerState;
            }
        }
        sessionFetching = false;
        return data;
    };
    if (client?.$store?.listen) {
        client.$store.listen('$sessionSignal', async (signal) => {
            if (!signal)
                return;
            await fetchSession();
        });
    }
    return {
        session,
        user,
        subscription: client.subscription,
        subscriptions,
        loggedIn: () => !!session,
        activeStripeSubscription: () => {
            return subscriptions.find((sub) => sub.status === 'active' || sub.status === 'trialing');
        },
        activePolarSubscriptions: () => {
            return polarState?.activeSubscriptions;
        },
        signIn: client.signIn,
        signUp: client.signUp,
        forgetPassword: client.forgetPassword,
        resetPassword: client.resetPassword,
        sendVerificationEmail: client.sendVerificationEmail,
        errorCodes: client.$ERROR_CODES,
        async signOut({ redirectTo } = {}) {
            await client.signOut({
                fetchOptions: {
                    onSuccess: async () => {
                        session = null;
                        user = null;
                        if (redirectTo && typeof reload === 'function') {
                            await reload({
                                path: redirectTo.toString()
                            });
                        }
                    }
                }
            });
        },
        fetchSession,
        payment,
        client
    };
}
