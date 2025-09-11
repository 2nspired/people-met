// API DOCS: https://github.com/jolpica/jolpica-f1/blob/main/docs/endpoints/circuits.md
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";

// INPUT TYPES
const CircuitsInput = z.object({
  season: z.number().optional(),
  round: z.number().optional(),
  circuitId: z.string().optional(),
  constructorId: z.string().optional(),
  driverId: z.string().optional(),
  fastestRank: z.number().optional(),
  gridPosition: z.number().optional(),
  resultsPosition: z.number().optional(),
  statusId: z.number().optional(),
});

// RETURN TYPES
const LocationSchema = z.object({
  lat: z.string(),
  long: z.string(),
  locality: z.string(),
  country: z.string(),
});

export const CircuitSchema = z.object({
  circuitId: z.string(),
  url: z.string(),
  circuitName: z.string(),
  Location: LocationSchema,
});

const CircuitTableSchema = z.object({
  Circuits: z.array(CircuitSchema),
  position: z.string().optional(),
});

const CircuitsApiResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    total: z.string().optional(),
    CircuitTable: CircuitTableSchema,
  }),
});

export type Circuit = z.infer<typeof CircuitSchema>;
export type CircuitTable = z.infer<typeof CircuitTableSchema>;
export type MRData = z.infer<typeof CircuitsApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildCircuitsUrl(query: z.infer<typeof CircuitsInput> = {}): string {
  // /{season}/{round}/circuits/
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/circuits/`;
  }
  // /circuits/{circuitId}/circuits/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/circuits/`;
  }
  // /constructors/{constructorId}/circuits/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/circuits/`;
  }
  // /drivers/{driverId}/circuits/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/circuits/`;
  }
  // /fastest/{lapRank}/circuits/
  if (query.fastestRank) {
    return `${baseUrl}/fastest/${query.fastestRank}/circuits/`;
  }
  // /grid/{gridPosition}/circuits/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/circuits/`;
  }
  // /results/{finishPosition}/circuits/
  if (query.resultsPosition) {
    return `${baseUrl}/results/${query.resultsPosition}/circuits/`;
  }
  // /status/{statusId}/circuits/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/circuits/`;
  }
  // /{season}/circuits/
  if (query.season) {
    return `${baseUrl}/${query.season}/circuits/`;
  }
  // Default: all circuits
  return `${baseUrl}/circuits/`;
}

export const circuitsRouter = createTRPCRouter({
  getCircuits: publicProcedure.input(CircuitsInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildCircuitsUrl(input),
        init: {},
        schema: CircuitsApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const circuits = data.MRData.CircuitTable.Circuits;
      if (!circuits || circuits.length === 0) {
        console.error("No circuits found", input);
        return [];
      }
      return circuits;
    } catch (error) {
      console.error("Error fetching circuits", error);
      return [];
    }
  }),
});
