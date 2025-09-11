import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// Input schemas
const GetUserProfileInput = z.object({ userId: z.string() });

export const userProfileRouter = createTRPCRouter({
  // Get current user's profile (authenticated)
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userProfile = await ctx.db.userProfile.findUnique({
        where: { id: ctx.user.id },
      });

      if (!userProfile) {
        console.error("User profile not found for user:", ctx.user.id);
        return null;
      }

      return userProfile;
    } catch (error) {
      console.error("Error fetching current user profile:", error);
      return null;
    }
  }),

  // Get user profile by ID (public - for admin purposes)
  getById: publicProcedure
    .input(GetUserProfileInput)
    .query(async ({ ctx, input }) => {
      try {
        const userProfile = await ctx.db.userProfile.findUnique({
          where: { id: input.userId },
        });

        if (!userProfile) {
          console.error("User profile not found for ID:", input.userId);
          return null;
        }

        return userProfile;
      } catch (error) {
        console.error("Error fetching user profile by ID:", error);
        return null;
      }
    }),

  // Fetch user profile by ID (mutation - for imperative calls in context providers)
  fetchById: publicProcedure
    .input(GetUserProfileInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const userProfile = await ctx.db.userProfile.findUnique({
          where: { id: input.userId },
        });

        if (!userProfile) {
          console.error("User profile not found for ID:", input.userId);
          return null;
        }

        return userProfile;
      } catch (error) {
        console.error("Error fetching user profile by ID:", error);
        throw new Error("Failed to fetch user profile");
      }
    }),
});
