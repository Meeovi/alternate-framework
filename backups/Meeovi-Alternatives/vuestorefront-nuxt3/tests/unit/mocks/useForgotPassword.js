import { ref } from '#imports';

export const useForgotPasswordMock = (passwordData = {}) => ({
  result: ref({}),
  setNew: jest.fn(),
  error: ref({}),
  loading: ref(false),
  ...passwordData,
});

export default useForgotPasswordMock;
