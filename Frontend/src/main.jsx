import React from 'react'
import ReactDOM from 'react-dom/client';
import "./index.css";
import App from './App.jsx'
const root = ReactDOM.createRoot(document.getElementById("root"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  });
}

root.render(
  <React.StrictMode>
   <App/>
  </React.StrictMode>
);
