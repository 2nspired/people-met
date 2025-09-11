import { HydrateClient } from "~/trpc/server";
import { UserProfileTest } from "./_components/UserProfileTest";

export default async function HomePage() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 text-white">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              People <span className="text-blue-300">Met</span>
            </h1>
            <p className="mt-4 text-xl text-blue-100">
              Track the people you meet and never lose touch
            </p>
          </div>

          {/* User Profile Test Component */}
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <UserProfileTest />
          </div>

          {/* Development Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <div className="flex max-w-sm flex-col gap-4 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold">🚧 In Development</h3>
              <div className="text-sm text-blue-100">
                Building a comprehensive contact and relationship management
                system with encounter logging, reminders, and social
                connections.
              </div>
            </div>
            <div className="flex max-w-sm flex-col gap-4 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold">✨ Features Coming</h3>
              <div className="text-sm text-blue-100">
                • People management • Encounter logging • Contact tracking •
                Tagging & grouping • Follow-up reminders • Social profiles
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="text-center">
            <p className="text-sm text-blue-200">
              Built with Next.js, TypeScript, tRPC, Prisma & Supabase
            </p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
