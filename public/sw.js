// Service Worker Version
const CACHE_NAME = "people-met-v1";
const urlsToCache = [
  "/",
  "/login",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install Event - Cache Resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("Service Worker: Caching files");
      await cache.addAll(urlsToCache);
      console.log("Service Worker: Cached files");
    })(),
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    })(),
  );
});

// Fetch Event - Handle Requests
self.addEventListener("fetch", (event) => {
  const fetchEvent = event;
  fetchEvent.respondWith(
    (async () => {
      const url = fetchEvent.request.url;

      // Static content: Stale While Revalidate
      if (urlsToCache.some((cacheUrl) => url.includes(cacheUrl))) {
        return await staleWhileRevalidate(fetchEvent.request);
      }

      // tRPC calls: Network First (always fresh)
      if (url.includes("/api/trpc/")) {
        return await networkFirst(fetchEvent.request);
      }

      // Default: Cache First (for images, CSS, JS)
      return await cacheFirst(fetchEvent.request);
    })(),
  );
});

// Helper Functions
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Fetch fresh version in background (fire and forget)
    void (async () => {
      try {
        const fetchResponse = await fetch(request);
        const responseClone = fetchResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, responseClone);
      } catch (error) {
        console.error("Service Worker: Error fetching from network:", error);
      }
    })();

    return cachedResponse;
  }

  return await fetch(request);
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.error("Service Worker: Network failed, trying cache", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Service Worker: Serving from cache (network failed)");
      return cachedResponse;
    }

    // Both network and cache failed - return a fallback response
    console.log(
      "Service Worker: Both network and cache failed, returning offline fallback",
    );
    return new Response(
      JSON.stringify({
        error: "You're offline. Please check your connection and try again.",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("Service Worker: Serving from cache");
    return cachedResponse;
  }

  console.log("Service Worker: Fetching from network");
  return await fetch(request);
}
