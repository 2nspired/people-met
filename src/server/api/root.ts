import { driversRouter } from "~/server/api/routers/f1/drivers";
import { circuitsRouter } from "~/server/api/routers/f1/circuits";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { constructorsRouter } from "./routers/f1/constructors";
import { driverStandingsRouter } from "./routers/f1/driver-standings";
import { qualifyingRouter } from "./routers/f1/qualifying";
import { racesRouter } from "./routers/f1/races";
import { resultsRouter } from "./routers/f1/results";
import { pitstopsRouter } from "./routers/f1/pitstops";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  circuits: circuitsRouter,
  drivers: driversRouter,
  constructors: constructorsRouter,
  driverStandings: driverStandingsRouter,
  pitStops: pitstopsRouter,
  qualifying: qualifyingRouter,
  races: racesRouter,
  results: resultsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type TRPCInputs = inferRouterInputs<AppRouter>;
export type TRPCOutputs = inferRouterOutputs<AppRouter>;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
