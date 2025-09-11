"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "~/utilities/supabase/client";
import {
  UserProfileContext,
  type UserProfile,
  type UserProfileContextType,
} from "./UserProfileContext";
import { api } from "~/trpc/react";

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use tRPC mutation for fetching user profile
  const fetchUserProfileMutation = api.userProfile.fetchById.useMutation({
    onSuccess: (data) => {
      setUser(data);
      setLoading(false);
      setError(null);
    },
    onError: (error) => {
      console.error("Error fetching user profile:", error);
      setError(error.message);
      setLoading(false);
    },
  });

  // Use ref to store the mutation function to avoid dependency issues
  const fetchUserProfileRef = useRef(fetchUserProfileMutation.mutate);
  fetchUserProfileRef.current = fetchUserProfileMutation.mutate;

  // Function to fetch user profile from your database
  const fetchUserProfile = useCallback((userId: string) => {
    setLoading(true);
    setError(null);
    fetchUserProfileRef.current({ userId });
  }, []);

  // Function to refetch user data
  const refetch = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        fetchUserProfile(authUser.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Initial load and auth state listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const supabase = createClient();

      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        if (session?.user) {
          fetchUserProfileRef.current({ userId: session.user.id });
        } else {
          setLoading(false);
        }
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          fetchUserProfileRef.current({ userId: session.user.id });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    void initializeAuth();
  }, []); // Remove fetchUserProfile dependency to prevent infinite loop

  const value: UserProfileContextType = {
    user,
    loading,
    error,
    refetch: () => void refetch(),
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}
