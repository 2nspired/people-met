import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { DriverSchema } from "./drivers";
import { CircuitSchema } from "./circuits";
import { ConstructorSchema } from "./constructors";

// INPUT TYPES
const ResultsInput = z.object({
  season: z.number().optional(),
  round: z.number().optional(),
  circuitId: z.string().optional(),
  constructorId: z.string().optional(),
  driverId: z.string().optional(),
  fastestRank: z.number().optional(),
  gridPosition: z.number().optional(),
  statusId: z.number().optional(),
});

// RETURN TYPES

const TimeSchema = z.object({
  millis: z.string().optional(),
  time: z.string(),
});

const AverageSpeedSchema = z.object({
  units: z.string(),
  speed: z.string(),
});

const FastestLapSchema = z.object({
  rank: z.string(),
  lap: z.string(),
  Time: TimeSchema,
  AverageSpeed: AverageSpeedSchema,
});

const ResultSchema = z.object({
  number: z.string(),
  position: z.string(),
  positionText: z.string(),
  points: z.string(),
  Driver: DriverSchema,
  Constructor: ConstructorSchema.optional(),
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
  Results: z.array(ResultSchema),
});

const RaceTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  Races: z.array(RaceSchema),
});

const ResultsApiResponseSchema = z.object({
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

export type Result = z.infer<typeof ResultSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type RaceTable = z.infer<typeof RaceTableSchema>;
export type MRData = z.infer<typeof ResultsApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildResultsUrl(query: z.infer<typeof ResultsInput> = {}): string {
  // /{season}/{round}/results/
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/results/`;
  }
  // /circuits/{circuitId}/results/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/results/`;
  }
  // /constructors/{constructorId}/results/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/results/`;
  }
  // /drivers/{driverId}/results/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/results/`;
  }
  // /fastest/{lapRank}/results/
  if (query.fastestRank) {
    return `${baseUrl}/fastest/${query.fastestRank}/results/`;
  }
  // /grid/{gridPosition}/results/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/results/`;
  }
  // /status/{statusId}/results/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/results/`;
  }
  // /{season}/results/
  if (query.season) {
    return `${baseUrl}/${query.season}/results/`;
  }
  // Default: all results
  return `${baseUrl}/results/`;
}

export const resultsRouter = createTRPCRouter({
  getResults: publicProcedure.input(ResultsInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildResultsUrl(input),
        init: {},
        schema: ResultsApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const races = data.MRData.RaceTable.Races;
      if (!races || races.length === 0) {
        console.error("No race results found", input);
        return [];
      }
      return races;
    } catch (error) {
      console.error("Error fetching race results", error);
      return [];
    }
  }),
});
