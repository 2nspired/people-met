// Service Worker Version
const CACHE_NAME = "people-met-v1";
const urlsToCache = [
  "/",
  "/login",
  "/manifest.json",
];

// Install Event - Cache Resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("Service Worker: Caching files");
      
      // Cache each URL individually with error handling
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log(`Service Worker: Cached ${url}`);
        } catch (error) {
          console.warn(`Service Worker: Failed to cache ${url}:`, error);
        }
      }
      
      console.log("Service Worker: Caching completed");
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

      // Next.js static assets: Cache First (CSS, JS, fonts, images)
      if (url.includes("/_next/static/") || url.includes("/icons/")) {
        return await cacheFirst(fetchEvent.request);
      }

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
async function staleWhileRevalidate(request) {
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

  try {
    const networkResponse = await fetch(request);
    // Cache the response for next time
    const responseClone = networkResponse.clone();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, responseClone);
    return networkResponse;
  } catch (error) {
    console.error(
      "Service Worker: Network failed in staleWhileRevalidate:",
      error,
    );
    // Return a fallback response if both cache and network fail
    return new Response("Offline - content not available", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    });
  }
}

async function networkFirst(request) {
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

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("Service Worker: Serving from cache");
    return cachedResponse;
  }

  try {
    console.log("Service Worker: Fetching from network");
    const networkResponse = await fetch(request);
    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.error("Service Worker: Network failed in cacheFirst:", error);
    // Return a fallback response for static assets
    return new Response("Asset not available offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    });
  }
}
