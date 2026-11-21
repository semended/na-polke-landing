import { cp, mkdir, rm } from "node:fs/promises";

const projectRoot = new URL("../../", import.meta.url);
const output = new URL("../.pages/na-polke-landing/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const landingFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "assets",
  "presentation",
  "README.md",
  "QA.md",
  "SOURCES.md",
  "LANDING.md",
  ".nojekyll",
];
await Promise.all([
  ...landingFiles.map((name) =>
    cp(new URL(name, projectRoot), new URL(name, output), { recursive: true }),
  ),
  cp(new URL("../dist/", import.meta.url), new URL("mvp/", output), {
    recursive: true,
  }),
  cp(
    new URL("../storybook-static/", import.meta.url),
    new URL("storybook/", output),
    {
      recursive: true,
    },
  ),
]);
