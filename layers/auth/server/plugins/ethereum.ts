import { betterAuth } from "better-auth";
import { siwe } from "better-auth/plugins";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export const ethereumAuth = betterAuth({
  database: {
    // your database configuration
  },
  plugins: [
    siwe({
      domain: "myapp.com",
      emailDomainName: "myapp.com",
      anonymous: false,
      getNonce: async () => {
        // Generate a cryptographically secure random nonce
        return generateRandomString(32, "a-z", "A-Z", "0-9");
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          // Verify the signature using viem (recommended)
          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
      ensLookup: async ({ walletAddress }) => {
        try {
          // Optional: lookup ENS name and avatar using viem
          // You can use viem's ENS utilities here
          const client = createPublicClient({
            chain: mainnet,
            transport: http(),
          });

          const ensName = await client.getEnsName({
            address: walletAddress as `0x${string}`,
          });

          const ensAvatar = ensName
            ? await client.getEnsAvatar({
                name: ensName,
              })
            : null;

          return {
            name: ensName || walletAddress,
            avatar: ensAvatar || "",
          };
        } catch {
          return {
            name: walletAddress,
            avatar: "",
          };
        }
      },
    }),
  ],
});

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
