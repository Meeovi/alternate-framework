export function getApiDefinitions() {
    return {
        getCategories: (fn) => fn,
        getCategory: (fn) => fn,
        getCart: (fn) => fn,
        addCartLineItem: (fn) => fn,
        updateCartLineItem: (fn) => fn,
        removeCartLineItem: (fn) => fn,
        applyCouponToCart: (fn) => fn,
        removeCouponFromCart: (fn) => fn,
        setCustomerEmail: (fn) => fn,
        setCartAddress: (fn) => fn,
        getAvailableShippingMethods: (fn) => fn,
        setShippingMethod: (fn) => fn,
        registerCustomer: (fn) => fn,
        loginCustomer: (fn) => fn,
        getCustomer: (fn) => fn,
        logoutCustomer: (fn) => fn,
        updateCustomer: (fn) => fn,
        changeCustomerPassword: (fn) => fn,
        searchProducts: (fn) => fn,
        getProducts: (fn) => fn,
        getProductDetails: (fn) => fn,
        getProductReviews: (fn) => fn,
        createCustomerAddress: (fn) => fn,
        getCustomerAddresses: (fn) => fn,
        updateCustomerAddress: (fn) => fn,
        deleteCustomerAddress: (fn) => fn,
        getCurrencies: (fn) => fn,
        getOrders: (fn) => fn,
        getOrderDetails: (fn) => fn,
        placeOrder: (fn) => fn,
    };
}
export function defineAddCustomFieldsFactory() {
    return (input) => {
        return input;
    };
}
