export const handleDirectusError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`Directus error: ${error.message}`);
  }

  throw new Error("Directus error: Unknown error");
};