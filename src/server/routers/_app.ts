import { router } from "../trpc";
import { chatRouter } from "./chat";
import { cvRouter } from "./cv";

export const appRouter = router({
  chat: chatRouter,
  cv: cvRouter,
});

export type AppRouter = typeof appRouter;
