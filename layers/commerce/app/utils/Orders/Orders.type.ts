/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework-theme
 * @link https://github.com/meeovi/mframework
 */

export interface OrderItemQtyArray {
    quantity_ordered: number;
    quantity_canceled: number;
    quantity_invoiced: number;
    quantity_refunded: number;
    quantity_returned: number;
    quantity_shipped: number;
}
