import { toNextJsHandler } from "alternate-search/integrations/next-js";
import { ensureSeed, search } from "../../../../lib/search";

const handlers = toNextJsHandler(search, { cors: "*" });

export async function GET(request: Request, ctx: { params: Promise<{ index: string }> }) {
  await ensureSeed();
  return handlers.GET(request, ctx);
}

export async function POST(request: Request, ctx: { params: Promise<{ index: string }> }) {
  await ensureSeed();
  return handlers.POST(request, ctx);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ index: string }> }) {
  await ensureSeed();
  return handlers.DELETE(request, ctx);
}

export const OPTIONS = handlers.OPTIONS;
