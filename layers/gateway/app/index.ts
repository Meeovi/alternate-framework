import { createServer } from "node:http";
import { createGatewayYogaServer } from "./server";

const port = Number(process.env.GATEWAY_PORT ?? 4000);
const yoga = createGatewayYogaServer();

const httpServer = createServer(yoga);

httpServer.listen(port, () => {
  console.log(`[gateway] listening on http://localhost:${port}/graphql`);
});