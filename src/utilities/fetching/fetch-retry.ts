// This is a utility function that retries a fetch request with exponential backoff.
// It also validates the response against a Zod schema if provided.

import { type ZodType } from "zod";

export async function fetchWithRetry<T>({
  url,
  init = {},
  schema,
  retries = 3,
  timeoutMs = 10000,
  backoffMs = 300,
}: {
  url: RequestInfo; // the URL or Request
  init: RequestInit; // fetch options (headers, method…)
  schema?: ZodType<T>; // optional Zod schema <— gives you runtime checks
  retries: number; // how many tries
  timeoutMs: number; // ms before abort
  backoffMs: number; // base delay
}): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    // 1) start a timeout guard
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log("fetching", url);
      // 2) kick off the fetch, passing the abort signal
      const res = await fetch(url, { signal: controller.signal, ...init });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // 3) parse JSON
      const raw = (await res.json()) as unknown;

      // 4) validate with Zod (if provided) or trust the shape

      const data = schema ? schema.parse(raw) : (raw as T);
      console.log("data matched schema", schema?.parse(data) ? true : false);
      console.log("fetch success:", url);
      return data;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      // 5) if we've still got retries left, wait (exponential backoff)
      if (attempt < retries) {
        const delay = backoffMs * 2 ** (attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  // if we never returned successfully, throw the last error
  throw lastError;
}
