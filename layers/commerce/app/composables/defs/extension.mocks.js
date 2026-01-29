export const normalizers = {
    normalizeMoney: (rawMoney, ctx) => ({
        amount: rawMoney.amount,
        currency: ctx.currency,
    }),
    normalizeProductCatalogItem: (rawProduct) => ({
        id: rawProduct.id,
        name: rawProduct.name,
    }),
};
export const rawMoneyMock = {
    amount: 10,
    formattedAmount: "10.00",
    decimalPlaces: 2,
};
export const methods = {
    getSuccess() {
        return Promise.resolve({ ok: true });
    },
};
export const getAdditionalNormalizerContext = () => ({
    sku: "123",
});
