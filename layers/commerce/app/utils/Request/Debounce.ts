// TODO
/** @namespace ../../utils/Request/Debounce/debounce */
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

export const debounce = <T>(
    callback: (...args: T[]) => void | Promise<void>, delay: number): (...args: T[]) => void => {
    // eslint-disable-next-line fp/no-let
    let timeout: NodeJS.Timeout;

    return (...args: T[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback.apply(this, args as []), delay);
    };
};

/** @namespace ../../utils/Request/Debounce */
export class Debouncer {
    timeout!: NodeJS.Timeout;

    handler = (): void => {};

    startDebounce = <T = unknown>(
        callback: (...args: T[]) => void,
        delay: number,
    ) => (...args: T[]): void => {
        clearTimeout(this.timeout);
        this.handler = () => callback.apply(this, args);
        this.timeout = setTimeout(this.handler, delay);
    };

    cancelDebounce = (): void => {
        clearTimeout(this.timeout);
    };

    cancelDebounceAndExecuteImmediately = (): void => {
        clearTimeout(this.timeout);
        this.handler();
    };
}
