import http from "node:http";
import { toNodeHandler } from "alternate-search/integrations/node";
import { search, seedProducts } from "./search";

async function main() {
  await seedProducts();

  const handler = toNodeHandler(search, { basePath: "/api/search" });

  const server = http.createServer((req, res) => {
    void handler(req, res);
  });

  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, () => {
    console.log(`Node demo running on http://localhost:${port}`);
    console.log(`Try: http://localhost:${port}/api/search/products?q=shoes`);
  });
}

void main();
