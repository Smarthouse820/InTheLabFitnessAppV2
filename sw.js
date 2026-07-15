// In The Lab Fitness — service worker
//
// This is intentionally minimal right now: it exists only to satisfy the browser's
// "installable as an app" requirement (Chrome requires an active service worker with
// a fetch handler before it will offer the Add to Home Screen / Install prompt).
//
// It does NOT cache anything yet, on purpose — every request is passed straight through
// to the network, unchanged. This keeps it from interfering with anything while the app
// is still being updated frequently.
//
// This file is the planned home for two things later:
//   1. A proper cache-versioning strategy (network-first for the main app file, with
//      skipWaiting()/clients.claim() so updates take effect on next reload instead of
//      requiring every tab to be closed first).
//   2. Push notification handling (a 'push' event listener, once the Cloudflare Worker
//      backend is set up to actually send them).
// Both were deliberately left out of this version so today's change is a pure, isolated
// "make the app installable" step.

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  // Pass every request straight through to the network — no caching, no interception logic.
  event.respondWith(fetch(event.request));
});
