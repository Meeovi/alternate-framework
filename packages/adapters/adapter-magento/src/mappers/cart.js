import { mapMagentoProduct } from './product';
function mapMagentoCartItem(item) {
    const price = {
        amount: item.prices?.price?.value ?? 0,
        currency: item.prices?.price?.currency ?? 'USD',
    };
    return {
        id: item.uid,
        productId: item.product.uid,
        quantity: item.quantity,
        price,
    };
}
export function mapMagentoProductInCart(item) {
    return mapMagentoProduct(item.product);
}
export function mapMagentoCart(cart) {
    const items = (cart.items ?? []).map(mapMagentoCartItem);
    const total = {
        amount: cart.prices?.grand_total?.value ?? 0,
        currency: cart.prices?.grand_total?.currency ?? 'USD',
    };
    return {
        id: cart.id,
        items,
        total,
    };
}
