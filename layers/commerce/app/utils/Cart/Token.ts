/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework
 * @link https://github.com/meeovi/mframework
 */

import { isSignedIn } from '../../utils/Auth/IsSignedIn';
import BrowserDatabase from '../../utils/BrowserDatabase';

import { CartTokensByWebsite } from './Cart.type';

export const CART_ID = 'cart_id';

/** @namespace ../../utils/Cart/Token/setCartId */
export const setCartId = (token: string): void => {
    const { website_code } = window;

    const tokens: CartTokensByWebsite = BrowserDatabase.getItem(CART_ID) || {};

    tokens[website_code] = {
        token,
        isCustomerToken: isSignedIn(),
    };
    BrowserDatabase.setItem(tokens, CART_ID);
};

/** @namespace ../../utils/Cart/Token/getCartId */
export const getCartId = (): string | null => {
    const { website_code } = window;

    const tokens: CartTokensByWebsite = BrowserDatabase.getItem(CART_ID) || {};

    const token = tokens[website_code];

    if (token) {
        if (token.isCustomerToken && !isSignedIn()) {
            return null;
        }

        return token.token;
    }

    return null;
};

/** @namespace ../../utils/Cart/Token/deleteCartId */
export const deleteCartId = (): void => {
    const { website_code } = window;

    const tokens: CartTokensByWebsite = BrowserDatabase.getItem(CART_ID) || {};

    tokens[website_code] = undefined;
    BrowserDatabase.setItem(tokens, CART_ID);
};
