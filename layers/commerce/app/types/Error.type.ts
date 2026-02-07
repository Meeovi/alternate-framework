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

import PropTypes from 'prop-types';

// Support for comtabilitiy

export const ErrorDetailsType = PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    err: PropTypes.object,
    info: PropTypes.shape({
        componentStack: PropTypes.string,
    }),
});
