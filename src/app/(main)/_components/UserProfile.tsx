import type { getAuth } from "~/data/auth/server";

type UserProfileProps = {
  auth: Awaited<ReturnType<typeof getAuth>>;
};

export default function UserProfile({ auth }: UserProfileProps) {
  const { user, isLoggedIn } = auth;

  return (
    <div className="flex max-w-sm flex-col gap-4 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold">🔐 Auth Status</h3>
      <div className="space-y-2 text-sm text-blue-100">
        <div>Status: {isLoggedIn ? "✅ Logged In" : "❌ Logged Out"}</div>
        {user && (
          <>
            <div>Email: {user.email}</div>
            <div>Name: {user.profile.name ?? "Not set"}</div>
            <div>ID: {user.id.slice(0, 8)}...</div>
          </>
        )}
      </div>
    </div>
  );
}
