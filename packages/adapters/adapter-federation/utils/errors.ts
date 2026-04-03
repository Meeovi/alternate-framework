export const handleFederationError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`Federation adapter error: ${error.message}`);
  }

  throw new Error("Federation adapter error: Unknown error");
};