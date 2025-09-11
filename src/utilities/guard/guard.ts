import { type NextRequest } from "next/server";

import { env } from "~/env";

export type GuardType = "cron" | "dev" | "api";

export interface GuardOptions {
  type: GuardType;
  allowInDevelopment?: boolean;
}

export function routeGuard(request: NextRequest, options: GuardOptions) {
  const { type, allowInDevelopment = false } = options;

  // Allow in development if explicitly allowed
  if (env.NODE_ENV !== "production" && allowInDevelopment) {
    return;
  }

  // For development routes, only allow in development
  if (type === "dev") {
    if (env.NODE_ENV !== "development") {
      return new Response(
        "Forbidden: Development routes only available in development",
        {
          status: 403,
        },
      );
    }
    return;
  }

  // For production routes, require authentication
  if (env.NODE_ENV === "production" || !allowInDevelopment) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return new Response("Unauthorized: Missing authorization header", {
        status: 401,
      });
    }

    // Handle different authentication types
    switch (type) {
      case "cron":
        if (!env.CRON_SECRET) {
          return new Response("Unauthorized: CRON_SECRET not configured", {
            status: 401,
          });
        }
        if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
          return new Response("Unauthorized: Invalid cron secret", {
            status: 401,
          });
        }
        break;

      case "api":
        // For general API routes, implement JWT or session-based auth (future)
        if (!env.GUARD_SECRET) {
          return new Response("Unauthorized: GUARD_SECRET not configured", {
            status: 401,
          });
        }
        if (authHeader !== `Bearer ${env.GUARD_SECRET}`) {
          return new Response("Unauthorized: Invalid API token", {
            status: 401,
          });
        }
        break;

      default:
        return new Response("Unauthorized: Unknown guard type", {
          status: 401,
        });
    }
  }

  return;
}

// Convenience functions for common use cases
export function cronGuard(request: NextRequest) {
  return routeGuard(request, { type: "cron" });
}

export function devGuard(request: NextRequest) {
  return routeGuard(request, { type: "dev", allowInDevelopment: true });
}

export function apiGuard(request: NextRequest) {
  return routeGuard(request, { type: "api" });
}
