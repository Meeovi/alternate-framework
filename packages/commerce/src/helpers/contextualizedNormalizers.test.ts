import { defineFeature, loadFeature } from "jest-cucumber";
import type { ContextualizedNormalizers } from "./contextualizedNormalizers";
import { toContextualizedNormalizers } from "./contextualizedNormalizers";
import type { SfMoney } from "../models";
import { beforeEach, expect, vi } from "vitest";

const feature = loadFeature("./contextualizedNormalizers.feature", { loadRelativePath: true });

defineFeature(feature, (test) => {
  type TestContext = {
    locale: string;
    currency: string;
  };
  type Normalizers = {
    normalizeMoney(context: TestContext, input: number): SfMoney;
  };
  let testNormalizers: Normalizers;
  let output: ContextualizedNormalizers<Normalizers>;
  let context: TestContext;

  beforeEach(() => {
    context = {
      currency: "USD",
      locale: "en",
    };
  });

  test("Context is passed to normalizers", ({ given, when, and, then }) => {
    given("a normalizer that requires a context as a second argument", () => {
      testNormalizers = {
        normalizeMoney: vi.fn((context, input) => {
          return {
            amount: input,
            currency: context.currency,
            precisionAmount: input.toFixed(2),
          };
        }),
      };
    });

    when("toContextualizedNormalizers function is called", () => {
      output = toContextualizedNormalizers(testNormalizers, () => context);
    });

    and("the normalizer is called with just an input", () => {
      output.normalizeMoney(100);
    });

    then("the normalizer should also receive the context", () => {
      expect(testNormalizers.normalizeMoney).toHaveBeenCalledWith(context, 100);
    });
  });
  test("Context changes", ({ given, when, and, then }) => {
    given("a normalizer that requires a context as a second argument", () => {
      testNormalizers = {
        normalizeMoney: vi.fn((context, input) => {
          return {
            amount: input,
            currency: context.currency,
            precisionAmount: input.toFixed(2),
          };
        }),
      };
    });

    when("toContextualizedNormalizers function is called", () => {
      output = toContextualizedNormalizers(testNormalizers, () => context);
    });

    and("the context changes", () => {
      context.currency = "EUR";
    });

    and("the normalizer is called with just an input", () => {
      output.normalizeMoney(100);
    });

    then("the normalizer should use the recent version of the context", () => {
      expect(testNormalizers.normalizeMoney).toHaveBeenCalledWith(
        expect.objectContaining({ currency: "EUR" }),
        expect.anything(),
      );
    });
  });
});
