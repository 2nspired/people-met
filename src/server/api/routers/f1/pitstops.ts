import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { CircuitSchema } from "./circuits";
// INPUT TYPES
const PitstopsInput = z.object({
  season: z.number(), // required
  round: z.number(), // required
  stopNumber: z.number().optional(),
  driverId: z.string().optional(),
  lapNumber: z.number().optional(),
});

// RETURN TYPES
const PitstopSchema = z.object({
  driverId: z.string(),
  lap: z.string().optional(),
  stop: z.string().optional(),
  time: z.string().optional(),
  duration: z.string().optional(),
});

const RaceSchema = z.object({
  season: z.string(),
  round: z.string(),
  url: z.string().optional(),
  raceName: z.string(),
  Circuit: CircuitSchema,
  date: z.string(),
  time: z.string().optional(),
  PitStops: z.array(PitstopSchema),
});

const RaceTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  lap: z.string().optional(),
  stop: z.string().optional(),
  driverId: z.string().optional(),
  Races: z.array(RaceSchema),
});

const PitstopsApiResponseSchema = z.object({
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

export type Pitstop = z.infer<typeof PitstopSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type RaceTable = z.infer<typeof RaceTableSchema>;
export type MRData = z.infer<typeof PitstopsApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildPitstopsUrl(query: z.infer<typeof PitstopsInput>): string {
  const { season, round, stopNumber, driverId, lapNumber } = query;
  if (!season || !round) throw new Error("season and round are required");

  // /{season}/{round}/pitstops/{stopNumber}
  if (stopNumber !== undefined) {
    return `${baseUrl}/${season}/${round}/pitstops/${stopNumber}/`;
  }
  // /{season}/{round}/drivers/{driverId}/pitstops/
  if (driverId) {
    return `${baseUrl}/${season}/${round}/drivers/${driverId}/pitstops/`;
  }
  // /{season}/{round}/laps/{lapNumber}/pitstops/
  if (lapNumber !== undefined) {
    return `${baseUrl}/${season}/${round}/laps/${lapNumber}/pitstops/`;
  }
  // /{season}/{round}/pitstops/
  return `${baseUrl}/${season}/${round}/pitstops/`;
}

export const pitstopsRouter = createTRPCRouter({
  getPitstops: publicProcedure.input(PitstopsInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildPitstopsUrl(input),
        init: {},
        schema: PitstopsApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const races = data.MRData.RaceTable.Races;
      if (!races || races.length === 0) {
        console.error("No pitstops found", input);
        return [];
      }
      return races;
    } catch (error) {
      console.error("Error fetching pitstops", error);
      return [];
    }
  }),
});
