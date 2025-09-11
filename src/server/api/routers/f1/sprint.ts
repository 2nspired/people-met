import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { DriverSchema } from "./drivers";
import { CircuitSchema } from "./circuits";
import { ConstructorSchema } from "./constructors";

// INPUT TYPES
const SprintInput = z.object({
  season: z.number().optional(),
  round: z.number().optional(),
  circuitId: z.string().optional(),
  constructorId: z.string().optional(),
  driverId: z.string().optional(),
  gridPosition: z.number().optional(),
  statusId: z.number().optional(),
});

// RETURN TYPES

const TimeSchema = z.object({
  millis: z.string().optional(),
  time: z.string(),
});

const FastestLapSchema = z.object({
  rank: z.string().optional(),
  lap: z.string(),
  Time: z.object({ time: z.string() }),
});

const SprintResultSchema = z.object({
  number: z.string(),
  position: z.string(),
  positionText: z.string(),
  points: z.string(),
  Driver: DriverSchema,
  Constructor: ConstructorSchema,
  grid: z.string().optional(),
  laps: z.string().optional(),
  status: z.string().optional(),
  Time: TimeSchema.optional(),
  FastestLap: FastestLapSchema.optional(),
});

const RaceSchema = z.object({
  season: z.string(),
  round: z.string(),
  url: z.string().optional(),
  raceName: z.string(),
  Circuit: CircuitSchema,
  date: z.string(),
  time: z.string().optional(),
  SprintResults: z.array(SprintResultSchema),
});

const RaceTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  driverId: z.string().optional(),
  Races: z.array(RaceSchema),
});

const SprintApiResponseSchema = z.object({
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

export type SprintResult = z.infer<typeof SprintResultSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type RaceTable = z.infer<typeof RaceTableSchema>;
export type MRData = z.infer<typeof SprintApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildSprintUrl(query: z.infer<typeof SprintInput> = {}): string {
  // /{season}/{round}/sprint/
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/sprint/`;
  }
  // /circuits/{circuitId}/sprint/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/sprint/`;
  }
  // /constructors/{constructorId}/sprint/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/sprint/`;
  }
  // /drivers/{driverId}/sprint/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/sprint/`;
  }
  // /grid/{gridPosition}/sprint/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/sprint/`;
  }
  // /status/{statusId}/sprint/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/sprint/`;
  }
  // /{season}/sprint/
  if (query.season) {
    return `${baseUrl}/${query.season}/sprint/`;
  }
  // Default: all sprint results
  return `${baseUrl}/sprint/`;
}

export const sprintRouter = createTRPCRouter({
  getSprint: publicProcedure.input(SprintInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildSprintUrl(input),
        init: {},
        schema: SprintApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const races = data.MRData.RaceTable.Races;
      if (!races || races.length === 0) {
        console.error("No sprint results found", input);
        return [];
      }
      return races;
    } catch (error) {
      console.error("Error fetching sprint results", error);
      return [];
    }
  }),
});
