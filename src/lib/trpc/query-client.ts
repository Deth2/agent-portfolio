import { QueryClient } from "@tanstack/react-query";

// One QueryClient per browser tab (a fresh one per render would lose cache
// on every re-render); a new QueryClient per server render would leak
// state across requests. See the TanStack Query + tRPC "SSR" guide.
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
    },
  });
}
