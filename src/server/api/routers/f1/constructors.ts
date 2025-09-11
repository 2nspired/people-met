import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";

// INPUT TYPES
const ConstructorsInput = z.object({
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
export const ConstructorSchema = z.object({
  constructorId: z.string(),
  url: z.string().optional(),
  name: z.string(),
  nationality: z.string().optional(),
});

const ConstructorTableSchema = z.object({
  Constructors: z.array(ConstructorSchema),
  position: z.string().optional(),
});

const ConstructorsApiResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    total: z.string().optional(),
    ConstructorTable: ConstructorTableSchema,
  }),
});

export type Constructor = z.infer<typeof ConstructorSchema>;
export type ConstructorTable = z.infer<typeof ConstructorTableSchema>;
export type MRData = z.infer<typeof ConstructorsApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildConstructorsUrl(
  query: z.infer<typeof ConstructorsInput> = {},
): string {
  // /{season}/{round}/constructors/
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/constructors/`;
  }
  // /circuits/{circuitId}/constructors/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/constructors/`;
  }
  // /constructors/{constructorId}/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/`;
  }
  // /drivers/{driverId}/constructors/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/constructors/`;
  }
  // /fastest/{lapRank}/constructors/
  if (query.fastestRank) {
    return `${baseUrl}/fastest/${query.fastestRank}/constructors/`;
  }
  // /grid/{gridPosition}/constructors/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/constructors/`;
  }
  // /results/{finishPosition}/constructors/
  if (query.resultsPosition) {
    return `${baseUrl}/results/${query.resultsPosition}/constructors/`;
  }
  // /status/{statusId}/constructors/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/constructors/`;
  }
  // /{season}/constructors/
  if (query.season) {
    return `${baseUrl}/${query.season}/constructors/`;
  }
  // Default: all constructors
  return `${baseUrl}/constructors/`;
}

export const constructorsRouter = createTRPCRouter({
  getConstructors: publicProcedure
    .input(ConstructorsInput)
    .query(async ({ input }) => {
      try {
        const data = await fetchWithRetry({
          input: buildConstructorsUrl(input),
          init: {},
          schema: ConstructorsApiResponseSchema,
          retries: 3,
          timeoutMs: 10000,
          backoffMs: 300,
        });
        const constructors = data.MRData.ConstructorTable.Constructors;
        if (!constructors || constructors.length === 0) {
          console.error("No constructors found", input);
          return [];
        }
        return constructors;
      } catch (error) {
        console.error("Error fetching constructors", error);
        return [];
      }
    }),
});
