export const handleStarterAdapterError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`Starter adapter error: ${error.message}`);
  }

  throw new Error("Starter adapter error: Unknown error");
};