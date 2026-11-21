import { defineConfig } from "@playwright/test";

const localLanding = "http://127.0.0.1:4173/na-polke-landing/";
const landing = process.env.LANDING_URL ?? localLanding;

export default defineConfig({
  testDir: "tests/browser",
  outputDir: "e2e-results",
  reporter: process.env.CI ? "github" : "list",
  workers: 2,
  use: {
    baseURL: landing,
    locale: "ru-RU",
    timezoneId: "Europe/Moscow",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css" },
  },
  snapshotPathTemplate: "{testDir}/snapshots/{arg}{ext}",
  projects: [
    {
      name: "chromium",
      testMatch: ["demo.spec.ts", "visual.spec.ts"],
      use: { browserName: "chromium" },
    },
    {
      name: "webkit",
      testMatch: "demo.spec.ts",
      use: { browserName: "webkit" },
    },
  ],
  webServer: process.env.LANDING_URL
    ? undefined
    : {
        command:
          "vite preview --outDir .pages --host 127.0.0.1 --port 4173 --strictPort",
        url: localLanding,
        reuseExistingServer: !process.env.CI,
      },
});
