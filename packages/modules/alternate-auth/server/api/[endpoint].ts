import { verifyAccessToken } from "better-auth/oauth2";

export const GET = async (req: Request) => {
  const authorization = req.headers?.get("authorization") ?? undefined;
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : authorization;
  const payload = await verifyAccessToken(
    accessToken || '', {
      verifyOptions: {
        issuer: `${process.env.AUTH_ISSUER}/`,
        audience: `"${process.env.AUTH_AUDIENCE}"`,
      },
      scopes: ["read:post"], // optional
    }
  );
}