"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-red-400">Oops!</span>
          </h1>
          <p className="mt-4 text-xl text-blue-100">
            Something went wrong with your authentication
          </p>
        </div>

        {/* Error Details */}
        <div className="w-full max-w-md rounded-lg bg-white/10 p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg
                  className="h-8 w-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">
                Authentication Error
              </h2>
              <p className="mt-2 text-blue-100">
                We encountered an issue while processing your request
              </p>
            </div>

            {message && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-red-200">
                  <strong className="text-red-300">Error details:</strong>{" "}
                  {message}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Link
                href="/login"
                className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
              >
                Try Again
              </Link>

              <Link
                href="/"
                className="block w-full rounded-md border border-white/20 bg-white/10 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-200">
            If this problem persists, please contact support
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 text-white">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
            <p className="mt-4 text-blue-100">Loading...</p>
          </div>
        </main>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
