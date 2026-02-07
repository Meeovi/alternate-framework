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
import { TokensByWebsite } from '../Auth/Token';

// Fallback constants (original project expects these in Auth/Config)
const ONE_HOUR = 3600;
const ONE_HOUR_IN_SECONDS = 3600;
const TOKEN_REFRESH_DELAY = 3000;
import BrowserDatabase from '../../utils/BrowserDatabase';
import { debounce } from '../../utils/Request/Debounce';
import { getStoreState } from '../../utils/Store';

/**
 *
 * @type {string}
 */
export const COMPARE_UID = 'compare_uid';

/**
 *
 * @type {number}
 */
export const ONE_DAY = 86400;

/**
 *
 * @param {string} uid
 * @returns {void}
 * @namespace ../../utils/Compare/setUid
 */
export const setUid = (uid: string | null): void => {
    const { website_code } = window;
    const tokens: TokensByWebsite = BrowserDatabase.getItem(COMPARE_UID) || {};
    const state = getStoreState();
    const {
        access_token_lifetime = ONE_HOUR,
    } = state.ConfigReducer || {};

    const uidExpirationTimeInStorage = isSignedIn()
        ? parseInt(String(access_token_lifetime), 10) * ONE_HOUR_IN_SECONDS
        : ONE_DAY;

    tokens[website_code] = uid as any;

    BrowserDatabase.setItem(tokens, COMPARE_UID, uidExpirationTimeInStorage);
};

/**
 *
 * @returns {string|boolean} uid
 * @namespace ../../utils/Compare/getUid
 */
export const getUid = (): string | null => {
    const { website_code } = window;

    const tokens: TokensByWebsite = BrowserDatabase.getItem(COMPARE_UID) || {};
    const uid = tokens[website_code];

    return (typeof uid === 'string') ? uid : null;
};

/**
 *
 * @namespace ../../utils/Compare/removeUid
 */
export const removeUid = (): void => {
    const { website_code } = window;
    const uids: Record<string, string | null | undefined> = BrowserDatabase.getItem(COMPARE_UID) || {};

    uids[website_code] = undefined;

    BrowserDatabase.setItem(uids, COMPARE_UID);
};

/** @namespace ../../utils/Compare/refreshUid */
export const refreshUid = debounce(
    () => setUid(getUid()),
    TOKEN_REFRESH_DELAY,
);
