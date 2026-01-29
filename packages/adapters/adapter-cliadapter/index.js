import { setCommerceAdapter } from '@meeovi/sdk';
import { createTransport } from './src/transport';
import { createCommerceAdapter } from './src/commerce';
export const installAdapter = (config) => {
    const transport = createTransport(config);
    setCommerceAdapter(createCommerceAdapter(transport));
};
