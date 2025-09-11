import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { ConstructorSchema } from "./constructors";
// INPUT TYPES
const ConstructorStandingsInput = z.object({
  season: z.number(), // required
  round: z.number().optional(),
  constructorId: z.string().optional(),
  position: z.string().optional(),
});

// RETURN TYPES

const ConstructorStandingSchema = z.object({
  position: z.string().optional(),
  positionText: z.string(),
  points: z.string(),
  wins: z.string(),
  Constructor: ConstructorSchema,
});

const StandingsListSchema = z.object({
  season: z.string(),
  round: z.string(),
  ConstructorStandings: z.array(ConstructorStandingSchema),
});

const StandingsTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  StandingsLists: z.array(StandingsListSchema),
});

const ConstructorStandingsApiResponseSchema = z.object({
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

export type ConstructorStanding = z.infer<typeof ConstructorStandingSchema>;
export type StandingsList = z.infer<typeof StandingsListSchema>;
export type StandingsTable = z.infer<typeof StandingsTableSchema>;
export type MRData = z.infer<
  typeof ConstructorStandingsApiResponseSchema.shape.MRData
>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildConstructorStandingsUrl(
  query: z.infer<typeof ConstructorStandingsInput>,
): string {
  const { season, round, constructorId, position } = query;
  if (!season) throw new Error("season is required");

  // /{season}/{round}/constructorstandings/
  if (season && round) {
    return `${baseUrl}/${season}/${round}/constructorstandings/`;
  }
  // /{season}/constructors/{constructorId}/constructorstandings/
  if (season && constructorId) {
    return `${baseUrl}/${season}/constructors/${constructorId}/constructorstandings/`;
  }
  // /{season}/constructorstandings/{position}/
  if (season && position) {
    return `${baseUrl}/${season}/constructorstandings/${position}/`;
  }
  // /{season}/constructorstandings/
  if (season) {
    return `${baseUrl}/${season}/constructorstandings/`;
  }
  throw new Error("Invalid query for constructor standings");
}

export const constructorStandingsRouter = createTRPCRouter({
  getConstructorStandings: publicProcedure
    .input(ConstructorStandingsInput)
    .query(async ({ input }) => {
      try {
        const data = await fetchWithRetry({
          input: buildConstructorStandingsUrl(input),
          init: {},
          schema: ConstructorStandingsApiResponseSchema,
          retries: 3,
          timeoutMs: 10000,
          backoffMs: 300,
        });
        const lists = data.MRData.StandingsTable.StandingsLists;
        if (!lists || lists.length === 0) {
          console.error("No constructor standings found", input);
          return [];
        }
        // Return all ConstructorStandings from all StandingsLists (usually only one)
        return lists.flatMap((list) => list.ConstructorStandings);
      } catch (error) {
        console.error("Error fetching constructor standings", error);
        return [];
      }
    }),
});
