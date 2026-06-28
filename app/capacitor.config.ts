import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.orca.app",
  appName: "Orca",
  webDir: "dist",
  backgroundColor: "#0A0E27",
  ios: { contentInset: "always", backgroundColor: "#0A0E27" },
};

export default config;
