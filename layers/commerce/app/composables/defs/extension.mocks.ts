interface RawMoney {
  amount: number;
  formattedAmount: string;
  decimalPlaces: number;
}

interface RawProduct {
  id: string;
  name: string;
}

type NormalizerContext = any;

export const normalizers = {
  normalizeMoney: (rawMoney: RawMoney, ctx: NormalizerContext) => ({
    amount: rawMoney.amount,
    currency: ctx.currency,
  }),
  normalizeProductCatalogItem: (rawProduct: RawProduct) => ({
    id: rawProduct.id,
    name: rawProduct.name,
  }),
};

export const rawMoneyMock: RawMoney = {
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
