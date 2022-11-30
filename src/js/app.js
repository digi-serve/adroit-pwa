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

var app = new Framework7({
  name: "FCF Adroit", // App name
  theme: "auto", // Automatic theme detection
  el: "#app", // App root element
  component: App, // App main component
  version: "2.0.14",

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
      : {}
});
