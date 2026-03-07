import { auth } from "../../utils/auth";
import { createSimpleMcpHandler } from "../../utils/mcp-handler";
import { z } from "zod";

// Define available tools
const tools = [
    {
        name: "echo",
        description: "Echo a message",
        schema: {
            type: "object" as const,
            properties: {
                message: { type: "string" }
            },
            required: ["message"]
        },
        handler: async ({ message }: { message: string }) => {
            return {
                content: [{ type: "text", text: `Tool echo: ${message}` }]
            };
        }
    }
];

// Create the MCP handler
const mcpHandler = createSimpleMcpHandler(tools);

// Main handler with authentication
const handler = async (req: Request) => {
    // Verify session from auth headers
    const session = await (auth.api as any).getMcpSession({
        headers: req.headers
    });

    if (!session) {
        // Return 401 Unauthorized if session is invalid
        return new Response(
            JSON.stringify({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Unauthorized",
                    data: "Invalid or missing authentication"
                }
            }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Handle MCP request if authenticated
    return mcpHandler(req);
};

export { handler as GET, handler as POST, handler as DELETE };