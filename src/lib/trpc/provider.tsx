"use client";

// Wires TanStack Query + tRPC's client together for the whole app (mounted
// in src/app/layout.tsx). One browser-side QueryClient survives re-renders
// via useState's lazy initializer; the tRPC client itself is stateless.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useState, type ReactNode } from "react";
import type { AppRouter } from "@/server/routers/_app";
import { makeQueryClient } from "./query-client";
import { TRPCProvider } from "./context";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client — never share state across requests.
    return makeQueryClient();
  }
  // Browser: reuse the same client across re-renders.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function TRPCQueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: "/api/trpc" })],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
