"use client";

import Link from "next/link";
import type { getAuth } from "~/data/auth/server";
import { logout } from "~/app/auth/logout/actions";

type NavigationProps = {
  auth: Awaited<ReturnType<typeof getAuth>>;
};

export default function Navigation({ auth }: NavigationProps) {
  const { user, isLoggedIn } = auth;

  console.log("nav - user", user);
  console.log("nav - isLoggedIn", isLoggedIn);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex items-center gap-4">
      <Link href="/">Home</Link>
      {!user || !isLoggedIn ? (
        <Link href="/login">Login</Link>
      ) : (
        <button
          onClick={handleLogout}
          className="text-white transition-colors hover:text-blue-300"
        >
          Logout
        </button>
      )}
    </div>
  );
}
