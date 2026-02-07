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

export const SlideType = PropTypes.shape({
    slide_id: PropTypes.string,
    image: PropTypes.string,
    slide_text: PropTypes.string,
});

export const SliderType = PropTypes.shape({
    slider_id: PropTypes.string,
    slides: PropTypes.arrayOf(SlideType),
});
