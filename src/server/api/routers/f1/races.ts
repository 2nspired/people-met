import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { CircuitSchema } from "./circuits";
// INPUT TYPES
const RacesInput = z.object({
  season: z.number().optional(),
  round: z.number().optional(),
  circuitId: z.string().optional(),
  constructorId: z.string().optional(),
  driverId: z.string().optional(),
  gridPosition: z.number().optional(),
  statusId: z.number().optional(),
});

// RETURN TYPES

const SessionSchema = z.object({
  date: z.string(),
  time: z.string().optional(),
});

const RaceSchema = z.object({
  season: z.string(),
  round: z.string(),
  url: z.string().optional(),
  raceName: z.string(),
  Circuit: CircuitSchema,
  date: z.string(),
  time: z.string().optional(),
  FirstPractice: SessionSchema.optional(),
  SecondPractice: SessionSchema.optional(),
  ThirdPractice: SessionSchema.optional(),
  Qualifying: SessionSchema.optional(),
  Sprint: SessionSchema.optional(),
  SprintQualifying: SessionSchema.optional(),
  SprintShootout: SessionSchema.optional(),
});

const RaceTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  Races: z.array(RaceSchema),
});

const RacesApiResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    total: z.string().optional(),
    RaceTable: RaceTableSchema,
  }),
});

export type Race = z.infer<typeof RaceSchema>;
export type RaceTable = z.infer<typeof RaceTableSchema>;
export type MRData = z.infer<typeof RacesApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildRacesUrl(query: z.infer<typeof RacesInput> = {}): string {
  // /{season}/{round}/races/
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/races/`;
  }
  // /circuits/{circuitId}/races/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/races/`;
  }
  // /constructors/{constructorId}/races/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/races/`;
  }
  // /drivers/{driverId}/races/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/races/`;
  }
  // /grid/{gridPosition}/races/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/races/`;
  }
  // /status/{statusId}/races/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/races/`;
  }
  // /{season}/races/
  if (query.season) {
    return `${baseUrl}/${query.season}/races/`;
  }
  // Default: all races
  return `${baseUrl}/races/`;
}

export const racesRouter = createTRPCRouter({
  getRaces: publicProcedure.input(RacesInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildRacesUrl(input),
        init: {},
        schema: RacesApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const races = data.MRData.RaceTable.Races;
      if (!races || races.length === 0) {
        console.error("No races found", input);
        return [];
      }
      return races;
    } catch (error) {
      console.error("Error fetching races", error);
      return [];
    }
  }),
});
