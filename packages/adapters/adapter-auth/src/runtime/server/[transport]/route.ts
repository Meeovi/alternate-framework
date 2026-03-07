import { auth } from "../../utils/auth";
import { withMcpAuth } from "better-auth/plugins";
import { z } from "zod";

const handler = withMcpAuth(auth, async (req, session) => {
    // session contains the access token record with scopes and user ID
    // @ts-ignore: dynamic import of optional dev dependency
    return (await import('@vercel/mcp-adapter')).createMcpHandler(
        (server) => {
            server.tool(
                "echo",
                "Echo a message",
                { message: z.string() },
                async ({ message }) => {
                    return {
                        content: [{ type: "text", text: `Tool echo: ${message}` }],
                    };
                },
            );
        },
        {
            capabilities: {
                tools: {
                    echo: {
                        description: "Echo a message",
                    },
                },
            },
        },
        {
            redisUrl: process.env.REDIS_URL,
            basePath: "/api",
            verboseLogs: true,
            maxDuration: 60,
        },
    )(req);
});

const handlerRequest = async (req: Request) => {
     // session contains the access token record with scopes and user ID
    const session = await auth.api.getMcpSession({
        headers: req.headers
    })
    if(!session){
        //this is important and you must return 401
        return new Response(null, {
            status: 401
        })
    }
    // @ts-ignore: dynamic import of optional dev dependency
    return (await import('@vercel/mcp-adapter')).createMcpHandler(
        (server) => {
            server.tool(
                "echo",
                "Echo a message",
                { message: z.string() },
                async ({ message }) => {
                    return {
                        content: [{ type: "text", text: `Tool echo: ${message}` }],
                    };
                },
            );
        },
        {
            capabilities: {
                tools: {
                    echo: {
                        description: "Echo a message",
                    },
                },
            },
        },
        {
            redisUrl: process.env.REDIS_URL,
            basePath: "/api",
            verboseLogs: true,
            maxDuration: 60,
        },
    )(req);
}

export { handler as GET, handler as POST, handler as DELETE };