import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";

// INPUT TYPES
const SeasonsInput = z.object({
  season: z.number().optional(),
  circuitId: z.string().optional(),
  constructorId: z.string().optional(),
  driverId: z.string().optional(),
  gridPosition: z.number().optional(),
  statusId: z.number().optional(),
});

// RETURN TYPES
const SeasonSchema = z.object({
  season: z.string(),
  url: z.string(),
});

const SeasonTableSchema = z.object({
  Seasons: z.array(SeasonSchema),
  constructorId: z.string().optional(),
});

const SeasonsApiResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    total: z.string().optional(),
    SeasonTable: SeasonTableSchema,
  }),
});

export type Season = z.infer<typeof SeasonSchema>;
export type SeasonTable = z.infer<typeof SeasonTableSchema>;
export type MRData = z.infer<typeof SeasonsApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildSeasonsUrl(query: z.infer<typeof SeasonsInput> = {}): string {
  // /{season}/seasons/
  if (query.season) {
    return `${baseUrl}/${query.season}/seasons/`;
  }
  // /circuits/{circuitId}/seasons/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/seasons/`;
  }
  // /constructors/{constructorId}/seasons/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/seasons/`;
  }
  // /drivers/{driverId}/seasons/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/seasons/`;
  }
  // /grid/{gridPosition}/seasons/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/seasons/`;
  }
  // /status/{statusId}/seasons/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/seasons/`;
  }
  // Default: all seasons
  return `${baseUrl}/seasons/`;
}

export const seasonsRouter = createTRPCRouter({
  getSeasons: publicProcedure.input(SeasonsInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildSeasonsUrl(input),
        init: {},
        schema: SeasonsApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const seasons = data.MRData.SeasonTable.Seasons;
      if (!seasons || seasons.length === 0) {
        console.error("No seasons found", input);
        return [];
      }
      return seasons;
    } catch (error) {
      console.error("Error fetching seasons", error);
      return [];
    }
  }),
});
