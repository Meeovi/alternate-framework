import { createAPIFileRoute } from "@tanstack/solid-start/api";
import { toTanStackSolidHandler } from "alternate-search/integrations/tanstack-start-solid";
import { ensureSeed, search } from "~/lib/server/search";

const handlers = toTanStackSolidHandler(search, { cors: "*" });

export const Route = createAPIFileRoute("/api/search/$index")({
  GET: async (event) => {
    await ensureSeed();
    return handlers.GET(event);
  },
  POST: async (event) => {
    await ensureSeed();
    return handlers.POST(event);
  },
  DELETE: async (event) => {
    await ensureSeed();
    return handlers.DELETE(event);
  },
  OPTIONS: handlers.OPTIONS,
});
