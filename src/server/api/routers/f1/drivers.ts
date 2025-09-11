import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";

// INPUT TYPES

const DriverInput = z.object({
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

export type Driver = z.infer<typeof DriverSchema>;

export type DriverTable = {
  Drivers: Driver[];
  season?: string;
  circuitId?: string;
  // ...add other possible fields if needed
};

export type MRData = z.infer<typeof DriversApiResponseSchema.shape.MRData>;

export const DriverSchema = z.object({
  driverId: z.string(),
  permanentNumber: z.string().optional(),
  code: z.string().optional(),
  url: z.string().optional(),
  givenName: z.string(),
  familyName: z.string(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
});

const DriversApiResponseSchema = z.object({
  MRData: z.object({
    xmlns: z.string().optional(),
    series: z.string().optional(),
    url: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    total: z.string().optional(),
    DriverTable: z.object({
      Drivers: z.array(DriverSchema),
      season: z.string().optional(),
      circuitId: z.string().optional(),
    }),
  }),
});

// API CALLS
// ----------------------------------------------------------------------------

// jolpica-f1 API
// Drivers Documentation: https://github.com/jolpica/jolpica-f1/blob/main/docs/endpoints/drivers.md

// ----------------------------------------------------------------------------

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildDriversUrl(query: z.infer<typeof DriverInput> = {}): string {
  // most specific - driverId is a string
  if (query.driverId) {
    return `${baseUrl}/drivers/${query.driverId}/`;
  }

  // constructors - Filters for only drivers who have raced for a specified constructor.
  if (query.constructorId) {
    return `${baseUrl}/constructors/${query.constructorId}/drivers/`;
  }

  // fastest - Filters for only drivers that finished a race with a lap that was the ranked in the specified position.
  if (query.fastestRank) {
    return `${baseUrl}/fastest/${query.fastestRank}/drivers/`;
  }

  // grid - Filters for only drivers that started a race in the specified position.
  if (query.gridPosition) {
    return `${baseUrl}/grid/${query.gridPosition}/drivers/`;
  }

  // results - Filters for only drivers who have finished a race in a specific position.
  if (query.resultsPosition) {
    return `${baseUrl}/results/${query.resultsPosition}/drivers/`;
  }

  // status - Filters for only drivers who have finished a race with a specific statusId.
  if (query.statusId) {
    return `${baseUrl}/status/${query.statusId}/drivers/`;
  }

  // season and round - Filters only drivers that participated in a specified round of a specific season.
  // Round numbers 1 -> n races are valid as well as last.
  if (query.season && query.round) {
    return `${baseUrl}/${query.season}/${query.round}/drivers/`;
  }

  // season and circuitId - Filters only drivers that participated in a specified circuit of a specific season.
  if (query.season && query.circuitId) {
    return `${baseUrl}/${query.season}/circuits/${query.circuitId}/drivers/`;
  }

  // season - Filters only drivers that participated in a specified season.
  // Year numbers are valid as is current to get the current season list of drivers.
  // To utilize the season parameter, it needs to be the first argument after /ergast/f1/.
  if (query.season) {
    return `${baseUrl}/${query.season}/drivers/`;
  }

  // Default: all drivers
  return `${baseUrl}/drivers/`;
}

export const driversRouter = createTRPCRouter({
  getDrivers: publicProcedure.input(DriverInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildDriversUrl(input),
        init: {},
        schema: DriversApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });

      if (data.MRData.DriverTable.Drivers.length === 0) {
        console.error("No drivers found", input);
        return [];
      }

      return data.MRData.DriverTable.Drivers;
    } catch (error) {
      console.error("Error fetching drivers", error);
      return [];
    }
  }),
});
