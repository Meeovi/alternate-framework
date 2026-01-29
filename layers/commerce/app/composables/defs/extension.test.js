import { defineFeature, loadFeature } from "jest-cucumber";
import { beforeEach, expect } from "vitest";
import { unifiedExtensionFactory } from "./extension";
import { getAdditionalNormalizerContext, methods, normalizers, rawMoneyMock, } from "./extension.mocks";
const feature = loadFeature("./extension.feature", {
    loadRelativePath: true,
});
defineFeature(feature, (test) => {
    let overrideNormalizers;
    let addCustomFields;
    let overrideApiMethods;
    const createUnifiedExtension = unifiedExtensionFactory({
        normalizers,
        extendApiMethods: methods,
        getAdditionalNormalizerContext,
    });
    let extension;
    beforeEach(() => {
        overrideNormalizers = {};
        addCustomFields = [{}];
        overrideApiMethods = {};
    });
    function whenTheExtensionIsCreated(when) {
        when("extension is created", () => {
            extension = createUnifiedExtension({
                normalizers: {
                    override: overrideNormalizers,
                    addCustomFields,
                },
                methods: {
                    override: overrideApiMethods,
                },
                config: {},
            });
        });
    }
    test("Overriding normalizer", ({ given, when, and, then }) => {
        let result;
        given("one of the normalizers is overridden", () => {
            overrideNormalizers = {
                normalizeMoney(rawMoney) {
                    return {
                        amount: rawMoney.amount,
                        currency: "USD",
                    };
                },
            };
        });
        whenTheExtensionIsCreated(when);
        and("the normalizer is called", () => {
            result = extension.normalizers.normalizeMoney(rawMoneyMock, { currency: "PLN" });
        });
        then("the overridden normalizer should be called", () => {
            expect(result).toMatchInlineSnapshot(`
        {
          "amount": 10,
          "currency": "USD",
        }
      `);
        });
        and("remaining normalizers should be unchanged", () => {
            expect(extension.normalizers.normalizeProductCatalogItem).toBeDefined();
        });
    });
    test("Add custom fields array with a single element", ({ given, when, and, then }) => {
        let result;
        given("a custom field is added to one of the normalizers", () => {
            addCustomFields = [
                {
                    normalizeMoney: ({ formattedAmount }) => ({
                        formattedAmount,
                    }),
                },
            ];
        });
        whenTheExtensionIsCreated(when);
        and("the normalizer is called", () => {
            result = extension.normalizers.normalizeMoney(rawMoneyMock, { currency: "PLN" });
        });
        then("the custom field should be present in the $custom object", () => {
            expect(result).toMatchInlineSnapshot(`
        {
          "$custom": {
            "formattedAmount": "10.00",
          },
          "amount": 10,
          "currency": "PLN",
        }
      `);
        });
        and("remaining normalizers should be unchanged", () => {
            expect(extension.normalizers.normalizeProductCatalogItem).toBeDefined();
        });
    });
    test("Add custom fields array with multiple elements", ({ given, when, and, then }) => {
        given("multiple elements of the addCustomFields array override the same normalizer", () => {
            addCustomFields = [
                {
                    normalizeMoney: ({ formattedAmount }) => ({
                        formattedAmount,
                    }),
                },
                {
                    normalizeMoney: ({ decimalPlaces }) => ({
                        decimalPlaces,
                    }),
                },
            ];
        });
        whenTheExtensionIsCreated(when);
        and("the normalizer is called", () => {
            extension.normalizers.normalizeMoney(rawMoneyMock, { currency: "PLN" });
        });
        then("all custom fields should be present in the $custom object", () => {
            expect(extension.normalizers.normalizeMoney(rawMoneyMock, { currency: "PLN" }))
                .toMatchInlineSnapshot(`
          {
            "$custom": {
              "decimalPlaces": 2,
              "formattedAmount": "10.00",
            },
            "amount": 10,
            "currency": "PLN",
          }
        `);
        });
    });
    test("Nested custom fields", ({ given, and, when, then }) => {
        let result;
        given("multiple elements of the addCustomFields array override the same normalizer", () => {
            addCustomFields = [
                {
                    normalizeMoney: () => ({
                        nested: {
                            nested_field1: "value1",
                            nestedLvl2: {
                                nestedLvl2_field1: "value1",
                            },
                        },
                    }),
                },
                {
                    normalizeMoney: () => ({
                        nested: {
                            nested_field2: "value2",
                        },
                        nested2: {
                            nested2_field1: "value3",
                        },
                    }),
                },
            ];
        });
        and("custom fields are objects", () => { });
        whenTheExtensionIsCreated(when);
        and("the normalizer is called", () => {
            result = extension.normalizers.normalizeMoney(rawMoneyMock, { currency: "PLN" });
        });
        then("objects should be merged into the $custom object", () => {
            expect(result).toMatchInlineSnapshot(`
        {
          "$custom": {
            "nested": {
              "nestedLvl2": {
                "nestedLvl2_field1": "value1",
              },
              "nested_field1": "value1",
              "nested_field2": "value2",
            },
            "nested2": {
              "nested2_field1": "value3",
            },
          },
          "amount": 10,
          "currency": "PLN",
        }
      `);
        });
    });
    test("Adding the same custom fields more than once", ({ given, when, and, then }) => {
        let result;
        given("multiple elements of the addCustomFields array add the same custom field", () => {
            addCustomFields = [
                {
                    normalizeMoney: ({ formattedAmount, decimalPlaces }) => ({
                        formattedAmount,
                        decimalPlaces,
                    }),
                },
                {
                    normalizeMoney: () => ({
                        formattedAmount: "overridden",
                    }),
                },
            ];
        });
        whenTheExtensionIsCreated(when);
        and("the normalizer is called", () => {
            result = extension.normalizers.normalizeMoney(rawMoneyMock, { currency: "PLN" });
        });
        then("the custom field should have value based on the last element of the addCustomFields array", () => {
            expect(result).toMatchInlineSnapshot(`
          {
            "$custom": {
              "decimalPlaces": 2,
              "formattedAmount": "overridden",
            },
            "amount": 10,
            "currency": "PLN",
          }
        `);
        });
    });
    test("Overriding api method", ({ given, when, and, then }) => {
        let result;
        given("one of the api methods is overridden", () => {
            overrideApiMethods = {
                getSuccess: () => Promise.resolve({ ok: false }),
            };
        });
        whenTheExtensionIsCreated(when);
        and("the api method is called", async () => {
            result = await extension.extendApiMethods.getSuccess();
        });
        then("the overridden api method should be called", () => {
            expect(result).toMatchInlineSnapshot(`
        {
          "ok": false,
        }
      `);
        });
    });
});
