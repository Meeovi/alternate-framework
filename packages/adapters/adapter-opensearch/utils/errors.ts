export const handleOpenSearchError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`OpenSearch error: ${error.message}`);
  }

  throw new Error("OpenSearch error: Unknown error");
};