// TanStack Query bindings for the app's tRPC router (ADR-0006). useTRPC()
// gives components query/mutation options for TanStack Query's own hooks
// (useQuery/useMutation) instead of a separate tRPC-flavored hook set.

import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@/server/routers/_app";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
