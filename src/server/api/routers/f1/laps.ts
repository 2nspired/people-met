import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchWithRetry } from "~/utilities/fetching/fetch-with-retry";
import { CircuitSchema } from "./circuits";

// INPUT TYPES
const LapsInput = z.object({
  season: z.number(), // required
  round: z.number(), // required
  lapNumber: z.number().optional(),
  driverId: z.string().optional(),
  constructorId: z.string().optional(),
});

// RETURN TYPES
const TimingSchema = z.object({
  driverId: z.string(),
  position: z.string(),
  time: z.string(),
});

const LapSchema = z.object({
  number: z.string(),
  Timings: z.array(TimingSchema),
});

const RaceSchema = z.object({
  season: z.string(),
  round: z.string(),
  url: z.string().optional(),
  raceName: z.string(),
  Circuit: CircuitSchema,
  date: z.string(),
  time: z.string().optional(),
  Laps: z.array(LapSchema),
});

const RaceTableSchema = z.object({
  season: z.string().optional(),
  round: z.string().optional(),
  driverId: z.string().optional(),
  constructorId: z.string().optional(),
  lap: z.string().optional(),
  Races: z.array(RaceSchema),
});

const LapsApiResponseSchema = z.object({
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

export type Timing = z.infer<typeof TimingSchema>;
export type Lap = z.infer<typeof LapSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type RaceTable = z.infer<typeof RaceTableSchema>;
export type MRData = z.infer<typeof LapsApiResponseSchema.shape.MRData>;

const baseUrl = "http://api.jolpi.ca/ergast/f1";

function buildLapsUrl(query: z.infer<typeof LapsInput>): string {
  const { season, round, lapNumber, driverId, constructorId } = query;
  if (!season || !round) throw new Error("season and round are required");

  // /{season}/{round}/laps/{lapNumber}
  if (lapNumber !== undefined) {
    return `${baseUrl}/${season}/${round}/laps/${lapNumber}/`;
  }
  // /{season}/{round}/drivers/{driverId}/laps/
  if (driverId) {
    return `${baseUrl}/${season}/${round}/drivers/${driverId}/laps/`;
  }
  // /{season}/{round}/constructors/{constructorId}/laps/
  if (constructorId) {
    return `${baseUrl}/${season}/${round}/constructors/${constructorId}/laps/`;
  }
  // /{season}/{round}/laps/
  return `${baseUrl}/${season}/${round}/laps/`;
}

export const lapsRouter = createTRPCRouter({
  getLaps: publicProcedure.input(LapsInput).query(async ({ input }) => {
    try {
      const data = await fetchWithRetry({
        input: buildLapsUrl(input),
        init: {},
        schema: LapsApiResponseSchema,
        retries: 3,
        timeoutMs: 10000,
        backoffMs: 300,
      });
      const races = data.MRData.RaceTable.Races;
      if (!races || races.length === 0) {
        console.error("No laps found", input);
        return [];
      }
      return races;
    } catch (error) {
      console.error("Error fetching laps", error);
      return [];
    }
  }),
});
