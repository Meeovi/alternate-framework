import { auth } from '../registry/auth';
import { commerce } from '../registry/commerce';
import { search } from '../registry/search';
import { getRegistry } from '../registry';
export const sdk = {
    auth,
    commerce,
    search,
    get transport() {
        return getRegistry().transport;
    }
};
