import { createApiRuntime } from "./apiCore.js";

export const runtime = globalThis.__clearGateAiRuntime || createApiRuntime();
globalThis.__clearGateAiRuntime = runtime;
