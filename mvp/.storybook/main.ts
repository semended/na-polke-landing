import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  core: { disableTelemetry: true },
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  staticDirs: ["../public"],
};

export default config;
