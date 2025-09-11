import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { DriverSchema } from "./drivers";
import { CircuitSchema } from "./circuits";
import { ConstructorSchema } from "./constructors";

// INPUT TYPES
const QualifyingInput = z.object({
  season: z.number().optional(),
  round: z.number().optional(),
  circuitId: z.string().optional(),
  constructorId: z.string().optional(),
  driverId: z.string().optional(),
  gridPosition: z.number().optional(),
  fastestRank: z.number().optional(),
  statusId: z.number().optional(),
});

// RETURN TYPES

const QualifyingResultSchema = z.object({
  number: z.string(),
  position: z.string().optional(),
  Driver: DriverSchema,
  Constructor: ConstructorSchema,
  Q1: z.string().optional(),
  Q2: z.string().optional(),
  Q3: z.string().optional(),
});

const RaceSchema = z.object({
  season: z.string(),
  round: z.string(),
  url: z.string().optional(),
  raceName: z.string(),
  Circuit: CircuitSchema,
  date: z.string(),
  time: z.string().optional(),
  QualifyingResults: z.array(QualifyingResultSchema),
});

const RaceTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  Races: z.array(RaceSchema),
});

const QualifyingApiResponseSchema = z.object({
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

export type QualifyingResult = z.infer<typeof QualifyingResultSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type RaceTable = z.infer<typeof RaceTableSchema>;
export type MRData = z.infer<typeof QualifyingApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildQualifyingUrl(
  query: z.infer<typeof QualifyingInput> = {},
): string {
  // /{season}/{round}/qualifying/
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/qualifying/`;
  }
  // /circuits/{circuitId}/qualifying/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/qualifying/`;
  }
  // /constructors/{constructorId}/qualifying/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/qualifying/`;
  }
  // /drivers/{driverId}/qualifying/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/qualifying/`;
  }
  // /grid/{gridPosition}/qualifying/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/qualifying/`;
  }
  // /fastest/{lapRank}/qualifying/
  if (query.fastestRank) {
    return `${baseUrl}/fastest/${query.fastestRank}/qualifying/`;
  }
  // /status/{statusId}/qualifying/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/qualifying/`;
  }
  // /{season}/qualifying/
  if (query.season) {
    return `${baseUrl}/${query.season}/qualifying/`;
  }
  // Default: all qualifying
  return `${baseUrl}/qualifying/`;
}

export const qualifyingRouter = createTRPCRouter({
  getQualifying: publicProcedure
    .input(QualifyingInput)
    .query(async ({ input }) => {
      try {
        const data = await fetchWithRetry({
          input: buildQualifyingUrl(input),
          init: {},
          schema: QualifyingApiResponseSchema,
          retries: 3,
          timeoutMs: 10000,
          backoffMs: 300,
        });
        const races = data.MRData.RaceTable.Races;
        if (!races || races.length === 0) {
          console.error("No qualifying results found", input);
          return [];
        }
        return races;
      } catch (error) {
        console.error("Error fetching qualifying results", error);
        return [];
      }
    }),
});
