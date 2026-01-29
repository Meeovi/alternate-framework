import { setAuthAdapter, setCommerceAdapter, setSearchAdapter } from '@meeovi/sdk';
import { createStarterTransport } from './src/transport';
import { createStarterAuthAdapter } from './src/auth';
import { createStarterCommerceAdapter } from './src/commerce';
import { createStarterSearchAdapter } from './src/search';
export const installStarterAdapter = (config) => {
    const transport = createStarterTransport(config);
    setAuthAdapter(createStarterAuthAdapter(transport));
    setCommerceAdapter(createStarterCommerceAdapter(transport));
    setSearchAdapter(createStarterSearchAdapter(transport));
};
