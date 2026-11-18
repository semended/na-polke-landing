/// <reference types="vitest/jsdom" />
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Use jsdom storage even when Node also exposes a localStorage global.
vi.stubGlobal("localStorage", jsdom.window.localStorage);

afterEach(cleanup);
