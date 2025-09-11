"use client";

import { createContext, useContext } from "react";

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Create the context with default values
export const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  loading: false,
  error: null,
  refetch: () => {
    // No-op function for default context
  },
});

export function useUserProfile() {
  const context = useContext(UserProfileContext);

  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }

  return context;
}
