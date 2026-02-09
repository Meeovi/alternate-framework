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

import {
    PriceRange,
    ProductDiscount,
    ProductItem,
    ProductPrice,
} from '../../types/normalizers/ProductList.type';
import { Product as DomainProduct } from '../../types/domain';

/**
 * Updates wishlist item price for option based products
 * @param {Object} product
 * @namespace ../../utils/Wishlist/getPriceRange
 */
export const getPriceRange = (
    product: ProductItem | DomainProduct,
    price: number,
    priceWithoutTax: number,
    discount: ProductDiscount | number = 0,
): { price_range?: PriceRange } => {
    if (!price) {
        return {};
    }

    const {
        price_range: {
            minimum_price: {
                regular_price: {
                    currency,
                } = {},
            },
        },
    } = product;

    const priceCurrencyValue = { value: price, currency };
    const priceCurrencyValueExclTax = { value: priceWithoutTax, currency };

    const priceSection = {
        final_price: priceCurrencyValue,
        regular_price: priceCurrencyValue,
        final_price_excl_tax: priceCurrencyValueExclTax,
        regular_price_excl_tax: priceCurrencyValueExclTax,
        default_final_price_excl_tax: priceCurrencyValueExclTax,
        discount,
    } as ProductPrice;

    return {
        price_range: {
            minimum_price: priceSection,
            maximum_price: priceSection,
        },
    };
};

export default getPriceRange;
