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

// ! TODO: Maybe we should move this to common types?
import PropTypes from 'prop-types';

export interface Device {
    isMobile: boolean;
    android: boolean;
    ios: boolean;
    blackberry: boolean;
    opera: boolean;
    safari: boolean;
    windows: boolean;
    standaloneMode?: boolean;
}

// Support for comtabilitiy

export const DeviceType = PropTypes.shape({
    isMobile: PropTypes.bool,
    android: PropTypes.bool,
    ios: PropTypes.bool,
    blackberry: PropTypes.bool,
    opera: PropTypes.bool,
    safari: PropTypes.bool,
    windows: PropTypes.bool,
    standaloneMode: PropTypes.bool,
});
