import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { DriverSchema } from "./drivers";
import { ConstructorSchema } from "./constructors";

// INPUT TYPES
const DriverStandingsInput = z.object({
  season: z.number(), // required
  round: z.number().optional(),
  driverId: z.string().optional(),
  position: z.string().optional(),
});

// RETURN TYPES

const DriverStandingSchema = z.object({
  position: z.string(),
  positionText: z.string(),
  points: z.string(),
  wins: z.string(),
  Driver: DriverSchema,
  Constructors: z.array(ConstructorSchema),
});

const StandingsListSchema = z.object({
  season: z.string(),
  round: z.string(),
  DriverStandings: z.array(DriverStandingSchema),
});

const StandingsTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  driverId: z.string().optional(),
  StandingsLists: z.array(StandingsListSchema),
});

const DriverStandingsApiResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    total: z.string().optional(),
    StandingsTable: StandingsTableSchema,
  }),
});

export type DriverStanding = z.infer<typeof DriverStandingSchema>;
export type StandingsList = z.infer<typeof StandingsListSchema>;
export type StandingsTable = z.infer<typeof StandingsTableSchema>;
export type MRData = z.infer<
  typeof DriverStandingsApiResponseSchema.shape.MRData
>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildDriverStandingsUrl(
  query: z.infer<typeof DriverStandingsInput>,
): string {
  const { season, round, driverId, position } = query;
  if (!season) throw new Error("season is required");

  // Filters for the drivers standings after a specified round in a specific season.
  // Round numbers 1 -> n races are valid as well as last.
  // Note: To utilize the round parameter it must be combined with a season filter and needs to be the first argument after /ergast/f1/{season}/.
  if (season && round) {
    return `${baseUrl}/${season}/${round}/driverstandings/`;
  }

  // Filters for only a specific driver's drivers standing information for a given year.
  if (season && driverId) {
    return `${baseUrl}/${season}/drivers/${driverId}/driverstandings/`;
  }

  // Filters for only the driver in a given position for a given year.

  if (season && position) {
    return `${baseUrl}/${season}/driverstandings/${position}/`;
  }

  // default
  if (season) {
    return `${baseUrl}/${season}/driverstandings/`;
  }

  throw new Error("Invalid query for driver standings");
}

export const driverStandingsRouter = createTRPCRouter({
  getDriverStandings: publicProcedure
    .input(DriverStandingsInput)
    .query(async ({ input }) => {
      try {
        const data = await fetchWithRetry({
          input: buildDriverStandingsUrl(input),
          init: {},
          schema: DriverStandingsApiResponseSchema,
          retries: 3,
          timeoutMs: 10000,
          backoffMs: 300,
        });

        const lists = data.MRData.StandingsTable.StandingsLists;
        if (!lists || lists.length === 0) {
          console.error("No driver standings found", input);
          return [];
        }
        // Return all DriverStandings from all StandingsLists (usually only one)
        return lists.flatMap((list) => list.DriverStandings);
      } catch (error) {
        console.error("Error fetching driver standings", error);
        return [];
      }
    }),
});
