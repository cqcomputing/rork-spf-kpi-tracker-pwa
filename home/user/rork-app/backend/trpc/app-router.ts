import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import emailReportRoute from "./routes/reports/email/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  reports: createTRPCRouter({
    email: emailReportRoute,
  }),
});

export type AppRouter = typeof appRouter;