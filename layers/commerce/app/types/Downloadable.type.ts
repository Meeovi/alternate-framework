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

export const DownloadableLinkType = PropTypes.shape({
    sample_url: PropTypes.string,
    sort_order: PropTypes.number,
    title: PropTypes.string,
    id: PropTypes.number,
    uid: PropTypes.string,
    price: PropTypes.number,
});

export const DownloadableLinksType = PropTypes.oneOfType([PropTypes.arrayOf(DownloadableLinkType), PropTypes.string]);
