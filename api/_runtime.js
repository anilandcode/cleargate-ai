import { createApiRuntime } from "../lib/apiCore.js";

export const runtime = globalThis.__clearGateAiRuntime || createApiRuntime();
globalThis.__clearGateAiRuntime = runtime;
