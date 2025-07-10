// Service Worker for Push Notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || "1",
        url: data.url || "/",
      },
      actions: data.actions || [],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "accept") {
    // Handle accept action
    event.waitUntil(clients.openWindow(event.notification.data.url + "?action=accept"))
  } else if (event.action === "decline") {
    // Handle decline action
    event.waitUntil(clients.openWindow(event.notification.data.url + "?action=decline"))
  } else {
    // Default action - open the notification URL
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})

self.addEventListener("notificationclose", (event) => {
  // Handle notification close
  console.log("Notification was closed", event)
})
