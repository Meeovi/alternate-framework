export const handleRocketChatError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`Rocket.Chat error: ${error.message}`);
  }

  throw new Error("Rocket.Chat error: Unknown error");
};