import { useDepthLimit } from "@graphile/depth-limit";

export const useDepthLimitPlugin = () =>
  useDepthLimit({
    maxDepth: Number(process.env.GQL_MAX_DEPTH ?? 8)
  });