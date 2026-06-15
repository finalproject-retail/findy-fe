const { spawnSync } = require("node:child_process");

const productionApiUrl = "https://api.insp1re12131.shop";

const result = spawnSync(
  process.platform === "win32" ? "cmd.exe" : "npx",
  process.platform === "win32"
    ? ["/d", "/s", "/c", "npx expo export --platform web"]
    : ["expo", "export", "--platform", "web"],
  {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      EXPO_PUBLIC_API_URL: productionApiUrl,
      EXPO_PUBLIC_USER_API_URL: productionApiUrl,
      EXPO_PUBLIC_RECOMMENDATION_API_URL:
        process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL || productionApiUrl,
      EXPO_PUBLIC_ANALYTICS_API_URL:
        process.env.EXPO_PUBLIC_ANALYTICS_API_URL || productionApiUrl,
    },
  },
);

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
