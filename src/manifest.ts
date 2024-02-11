import { defineManifest } from "@crxjs/vite-plugin";
import packageData from "../package.json";

//@ts-ignore
const isDev = process.env.NODE_ENV === "development";

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? "➡️ Dev`" : ""
    }`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: "img/logo-16.png",
    32: "img/logo-32.png",
  },
  action: {},
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  side_panel: {
    default_path: "sidepanel.html",
  },
  web_accessible_resources: [
    {
      resources: ["img/logo-16.png", "img/logo-32.png"],
      matches: [],
    },
  ],
  permissions: ["sidePanel", "storage", "activeTab", "tabs", "notifications"],
});
