import { stripeClient } from '@better-auth/stripe/client';
import { polarClient } from '@polar-sh/better-auth';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
export function getAuthPlugins(opts = {}) {
    const { subscription = true } = opts;
    return [
        inferAdditionalFields({
            user: {
                polarCustomerId: {
                    type: 'string'
                }
            }
        }),
        adminClient(),
        polarClient(),
        stripeClient({ subscription })
    ];
}
