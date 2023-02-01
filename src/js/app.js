import $ from "dom7";
import Framework7 from "framework7/bundle";

// Import F7 Styles
import "framework7/css/bundle";

// Import Icons and App Custom Styles
import "../css/icons.css";
import "../css/app.css";

// Import Routes
import routes from "./routes.js";
// Import Store
import store from "./store.js";

// Import main app component
import App from "../app.f7";

// Sentry init
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

let version = "2.0.11";

Sentry.init({
  dsn:
    "https://19734818cf6847f3ae9891d1f8faee7e@o204562.ingest.sentry.io/4504251695628288",
  integrations: [new BrowserTracing()],
  environment:
    process.env.NODE_ENV === "production" ? "production" : "development",
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  release: `adroit-pwa@${version}`
});

var app = new Framework7({
  name: "FCF Adroit", // App name
  theme: "auto", // Automatic theme detection
  el: "#app", // App root element
  component: App, // App main component
  version: version,
  disableContextMenu: true,

  // App store
  store: store,
  // App routes
  routes: routes,
  // Register service worker (only on production build)
  serviceWorker:
    process.env.NODE_ENV === "production"
      ? {
          path: "/pwa/www/service-worker.js"
        }
      : {},
  panel: {
    swipe: true,
  },
});
