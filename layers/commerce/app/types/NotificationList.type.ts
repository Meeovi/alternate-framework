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

export const NotificationType = PropTypes.shape({
    msgText: PropTypes.string,
    msgType: PropTypes.string,
    msgDebug: PropTypes.arrayOf(
        PropTypes.shape({
            message: PropTypes.string,
            extensions: PropTypes.shape({
                category: PropTypes.string,
            }),
            locations: PropTypes.arrayOf(PropTypes.shape({
                line: PropTypes.number,
                column: PropTypes.number,
            })),
            path: PropTypes.arrayOf(PropTypes.string),
        }),
    ),
});

export const NotificationListType = PropTypes.objectOf(NotificationType);
