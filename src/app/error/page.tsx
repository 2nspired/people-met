"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold text-red-600">
        Authentication Error
      </h1>
      <p className="mb-4 text-gray-700">
        Sorry, something went wrong with your authentication.
      </p>
      {message && (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            <strong>Error details:</strong> {message}
          </p>
        </div>
      )}
      <div className="mt-6">
        <Link
          href="/login"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
