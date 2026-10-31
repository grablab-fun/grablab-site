/* Grablab service worker: receives web push and opens the right page. It does not cache pages. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {}; try { d = e.data.json(); } catch (err) { d = { title: "Grablab", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Grablab", {
    body: d.body || "", icon: "/assets/app/icon-192.png", badge: "/assets/app/badge-96.png",
    tag: d.cat || "grablab", renotify: true, data: { url: d.url || "/participate" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url === url) || list.find(c => new URL(c.url).origin === self.location.origin);
    if (open) return open.focus().then(c => c && c.navigate ? c.navigate(url) : c);
    return self.clients.openWindow(url);
  }));
});
