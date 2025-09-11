import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";

// INPUT TYPES
const StatusInput = z.object({
  season: z.number().optional(),
  round: z.number().optional(),
  circuitId: z.string().optional(),
  constructorId: z.string().optional(),
  driverId: z.string().optional(),
  gridPosition: z.number().optional(),
  resultsPosition: z.number().optional(),
  fastestRank: z.number().optional(),
  statusId: z.number().optional(),
});

// RETURN TYPES
const StatusSchema = z.object({
  statusId: z.string(),
  count: z.string(),
  status: z.string(),
});

const StatusTableSchema = z.object({
  Status: z.array(StatusSchema),
  season: z.string().optional(),
  constructorId: z.string().optional(),
});

const StatusApiResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    total: z.string().optional(),
    StatusTable: StatusTableSchema,
  }),
});

export type Status = z.infer<typeof StatusSchema>;
export type StatusTable = z.infer<typeof StatusTableSchema>;
export type MRData = z.infer<typeof StatusApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildStatusUrl(query: z.infer<typeof StatusInput> = {}): string {
  // /{season}/{round}/status/
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/status/`;
  }
  // /circuits/{circuitId}/status/
  if (query.circuitId) {
    return `${baseUrl}/circuits/${query.circuitId}/status/`;
  }
  // /constructors/{constructorId}/status/
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/status/`;
  }
  // /drivers/{driverId}/status/
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/status/`;
  }
  // /grid/{gridPosition}/status/
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/status/`;
  }
  // /results/{finishPosition}/status/
  if (query.resultsPosition) {
    return `${baseUrl}/results/${query.resultsPosition}/status/`;
  }
  // /fastest/{lapRank}/status/
  if (query.fastestRank) {
    return `${baseUrl}/fastest/${query.fastestRank}/status/`;
  }
  // /status/{statusId}/status/
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/status/`;
  }
  // /{season}/status/
  if (query.season) {
    return `${baseUrl}/${query.season}/status/`;
  }
  // Default: all status
  return `${baseUrl}/status/`;
}

export const statusRouter = createTRPCRouter({
  getStatus: publicProcedure.input(StatusInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildStatusUrl(input),
        init: {},
        schema: StatusApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const statuses = data.MRData.StatusTable.Status;
      if (!statuses || statuses.length === 0) {
        console.error("No statuses found", input);
        return [];
      }
      return statuses;
    } catch (error) {
      console.error("Error fetching statuses", error);
      return [];
    }
  }),
});
