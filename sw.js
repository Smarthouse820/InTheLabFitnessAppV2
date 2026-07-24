// In The Lab Fitness — service worker
//
// Exists for two reasons now:
//   1. Installability — Chrome requires an active service worker with a fetch handler before it
//      will offer the Add to Home Screen / Install prompt. The fetch handler below is a pure
//      network pass-through, unchanged from before — still no caching, on purpose, while the app
//      is still being updated frequently.
//   2. Push notifications — the 'push' and 'notificationclick' listeners below are new. The
//      Cloudflare Worker backend now actually sends these; this is what makes them show up on
//      screen when they arrive.
//
// Still deliberately NOT done here: a real cache-versioning strategy (network-first for the main
// app file, with the same skipWaiting()/clients.claim() pattern already below so updates take
// effect on next reload instead of requiring every tab to be closed first). That's its own,
// separate piece of work — not part of this change.

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

// Fires when the Cloudflare Worker sends a push message via web-push. The payload is whatever
// JSON string the Worker's scheduled() handler passed to webpush.sendNotification(...).
self.addEventListener("push", function (event) {
  let data = { title: "ITL Fitness", body: "You have a reminder." };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // Not JSON for some reason — fall back to the default text above rather than showing nothing.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || undefined,
      badge: data.badge || undefined,
      tag: data.tag || undefined, // same tag = replaces a still-showing notification instead of stacking duplicates
    })
  );
});

// Focuses an already-open tab if one exists, otherwise opens a new one — standard pattern so
// tapping a notification doesn't leave someone with a stray extra tab if they already have the
// app open.
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
