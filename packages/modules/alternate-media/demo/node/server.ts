import http from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const port = Number(process.env.PORT ?? 3000);
const pagePath = join(process.cwd(), "demo/node/media-demo.html");

const server = http.createServer(async (req, res) => {
  if (!req.url || req.url === "/" || req.url === "/media-demo") {
    const html = await readFile(pagePath, "utf8");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(port, () => {
  console.log(`Node demo running on http://localhost:${port}/media-demo`);
});
