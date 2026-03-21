import { ref } from '#imports';

export const useCurrencyMock = {
  currency: ref({}),
  load: jest.fn(),
  change: jest.fn(),
  error: ref({
    load: null,
    change: null,
  }),
};
