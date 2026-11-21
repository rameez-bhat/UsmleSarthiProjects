// Firebase Hosting exposes the same public configuration to every visitor.
// Local development and custom hosting can use the project's Vite environment.
async function start() {
  const env = import.meta.env;
  const configured =
    (env.VITE_APP_FIREBASE_apiKey || env.VITE_FIREBASE_API_KEY) &&
    (env.VITE_APP_FIREBASE_authDomain || env.VITE_FIREBASE_AUTH_DOMAIN) &&
    (env.VITE_APP_FIREBASE_projectId || env.VITE_FIREBASE_PROJECT_ID) &&
    (env.VITE_APP_FIREBASE_appId || env.VITE_FIREBASE_APP_ID);

  if (!configured && env.VITE_DEMO_MODE !== "true") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch("/__/firebase/init.json", {
        signal: controller.signal,
        cache: "no-store",
      });
      if (
        response.ok &&
        response.headers.get("content-type")?.includes("json")
      ) {
        const config = await response.json();
        if (
          config.apiKey &&
          config.authDomain &&
          config.projectId &&
          config.appId
        ) {
          globalThis.__MEETLY_FIREBASE_CONFIG__ = config;
        }
      }
    } catch {
      // The app displays a deployment error if no shared config is available.
    } finally {
      clearTimeout(timer);
    }
  }
  await import("./main.jsx");
}

start();
