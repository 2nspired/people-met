import "server-only";
import { cache } from "react";
import { type UserProfile as FullUserProfile } from "@prisma/client";
import { supabaseServerClient } from "~/utilities/supabase/server";
import { db } from "~/server/db";
import {
  type User as SupabaseUser,
  type UserAppMetadata,
} from "@supabase/supabase-js";

type UserProfile = Pick<FullUserProfile, "id" | "email" | "name" | "imageUrl">;

export type User = SupabaseUser & {
  email: string;
  profile: UserProfile;
  app_metadata: UserAppMetadata & {
    providers: string[];
  };
};

export const getAuth = cache(async () => {
  const supabase = await supabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("getAuth - user", user);

  if (!user) {
    return {
      user: null,
      isLoggedIn: false as const,
    };
  }

  // Use Prisma to query the user profile instead of Supabase
  const profile = await db.userProfile.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, imageUrl: true },
  });

  console.log("getAuth - profile query result:", { profile });
  console.log("getAuth - user.id:", user.id);

  if (!profile) {
    console.log("getAuth - No profile found, returning logged out state");
    return {
      user: null,
      isLoggedIn: false as const,
    };
  }

  const authenticated = {
    user: { ...user, profile } as User,
    isLoggedIn: true as const,
  };

  return authenticated;
});
