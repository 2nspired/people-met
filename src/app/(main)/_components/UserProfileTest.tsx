"use client";

import { useUserProfile } from "~/contexts/UserProfileContext";

export function UserProfileTest() {
  const { user, loading, error } = useUserProfile();

  if (loading) return <div className="text-white">Loading user profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!user) return <div className="text-yellow-500">No user logged in</div>;

  return (
    <div className="text-white">
      <h2>Welcome, {user.name ?? user.email}!</h2>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}
