import { toSolidStartHandler } from "alternate-search/integrations/solid-start";
import { ensureSeed, search } from "~/lib/server/search";

const handlers = toSolidStartHandler(search, { cors: "*" });

export const GET = async (event: Parameters<typeof handlers.GET>[0]) => {
  await ensureSeed();
  return handlers.GET(event);
};

export const POST = async (event: Parameters<typeof handlers.POST>[0]) => {
  await ensureSeed();
  return handlers.POST(event);
};

export const DELETE = async (event: Parameters<typeof handlers.DELETE>[0]) => {
  await ensureSeed();
  return handlers.DELETE(event);
};

export const OPTIONS = handlers.OPTIONS;
