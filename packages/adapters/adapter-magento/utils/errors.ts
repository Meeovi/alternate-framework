export const handleMagentoError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`Magento error: ${error.message}`);
  }

  throw new Error("Magento error: Unknown error");
};