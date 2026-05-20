import { checkout, polar, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
// Centralized Prisma client instance
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// import { logAuditEvent } from './auth'
// runtimeConfig is not available in this isolated build; use env fallbacks
const runtimeConfig = {
    public: { payment: process.env.PAYMENT || 'none' },
    polarAccessToken: process.env.POLAR_ACCESS_TOKEN || '',
    polarServer: process.env.POLAR_SERVER || 'sandbox',
    polarProductIdProMonth: process.env.POLAR_PRODUCT_PRO_MONTH || '',
    polarProductIdProYear: process.env.POLAR_PRODUCT_PRO_YEAR || '',
    polarWebhookSecret: process.env.POLAR_WEBHOOK_SECRET || ''
};
const createPolarClient = () => {
    return new Polar({
        accessToken: runtimeConfig.polarAccessToken,
        server: runtimeConfig.polarServer
    });
};
export const ensurePolarCustomer = async (user) => {
    const client = createPolarClient();
    const { result: existingCustomers } = await client.customers.list({ email: user.email });
    const existingCustomer = existingCustomers.items[0];
    if (existingCustomer) {
        if (existingCustomer.externalId !== user.id) {
            await client.customers.update({
                id: existingCustomer.id,
                customerUpdate: {
                    externalId: user.id
                }
            });
        }
        return existingCustomer;
    }
    else {
        const customer = await client.customers.create({
            email: user.email,
            name: user.name,
            externalId: user.id
        });
        return customer;
    }
};
const addPaymentLog = async (hookType, data) => {
    if (hookType.startsWith('checkout.')) {
        const checkout = data;
        // await logAuditEvent({
        //   userId: checkout.customerExternalId || undefined,
        //   category: 'payment',
        //   action: `polar:${hookType}:${checkout.product?.name}`,
        //   targetType: 'polarExternalId',
        //   targetId: checkout.customerExternalId || checkout.metadata.email as string,
        //   status: 'success'
        // })
    }
    else if (hookType.startsWith('customer.')) {
        const customer = data;
        if (hookType == 'customer.created' && customer.externalId) {
            // Write back polarCustomerId to users table using centralized prisma client
            await prisma.user.updateMany({ where: { id: customer.externalId }, data: { polarCustomerId: customer.id } });
        }
        // await logAuditEvent({
        //   userId: customer.externalId || undefined,
        //   category: 'payment',
        //   action: `polar:${hookType}`,
        //   targetType: 'polarExternalId',
        //   targetId: customer.externalId || undefined,
        //   status: 'success'
        // })
    }
    else if (hookType.startsWith('subscription.')) {
        const subscription = data;
        // await logAuditEvent({
        //   userId: subscription.customer.externalId || undefined,
        //   category: 'payment',
        //   action: `polar:${hookType}:${subscription.product.name}`,
        //   targetType: 'polarExternalId',
        //   targetId: subscription.customer.externalId || undefined,
        //   status: 'success'
        // })
    }
};
export const setupPolar = () => polar({
    client: createPolarClient(),
    createCustomerOnSignUp: runtimeConfig.public.payment == 'polar',
    use: [
        checkout({
            products: [
                {
                    productId: runtimeConfig.polarProductIdProMonth,
                    slug: 'pro-monthly'
                },
                {
                    productId: runtimeConfig.polarProductIdProYear,
                    slug: 'pro-yearly'
                }
            ],
            successUrl: '/',
            authenticatedUsersOnly: true
        }),
        portal(),
        usage(),
        webhooks({
            // On Polar Organization Settings: {APP_URL}/api/auth/polar/webhooks
            secret: runtimeConfig.polarWebhookSecret,
            onPayload: async (payload) => {
                // Catch-all for all events
                await addPaymentLog(payload.type || '', payload.data);
            }
        })
    ]
});
