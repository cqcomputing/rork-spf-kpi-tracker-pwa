// Place this in a web-only entry point or call it from a useEffect in your root layout.
export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    });
  }
}
