"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.info("Service Worker registration successful with scope: ", registration.scope);
          },
          (err) => {
            console.error("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  return null;
}
