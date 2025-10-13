// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAmmoRP5wd-X0X9qmB6-3Vuwbck7584YRY",
  authDomain: "agriconnect-dd9c5.firebaseapp.com",
  projectId: "agriconnect-dd9c5",
  storageBucket: "agriconnect-dd9c5.firebasestorage.app",
  messagingSenderId: "38933286613",
  appId: "1:38933286613:web:4ca5b4959fa9ef41f01c5c",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "./chat-bot.gif",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
