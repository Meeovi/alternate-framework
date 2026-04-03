import { defineSearchEventHandler } from "alternate-search/integrations/nuxt";
import { ensureSeed, search } from "../../../lib/search";

const handler = defineSearchEventHandler(search, { cors: "*" });

export default async function (event: unknown) {
  await ensureSeed();
  return handler(event as never);
}
