import fs from "fs";
import path from "path";
import type { Config, Balance } from "../game/types";

function resolvePathFromEnv(filePath?: string): string | undefined {
  if (!filePath) return undefined;
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

const CONFIG_PATH = resolvePathFromEnv(process.env.CONFIG_PATH) ?? path.join(__dirname, "balance.json");
const AB_PATH = resolvePathFromEnv(process.env.AB_CONFIG);
let currentConfig: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
if (AB_PATH && fs.existsSync(AB_PATH)) {
  currentConfig = deepMerge(currentConfig, JSON.parse(fs.readFileSync(AB_PATH, "utf8")));
}

export function getConfig(): Config {
  return currentConfig;
}

export function getBalance(): Balance {
  return currentConfig.balance;
}

export function reloadConfig(): void {
  try {
    let cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    if (AB_PATH && fs.existsSync(AB_PATH)) {
      const ab = JSON.parse(fs.readFileSync(AB_PATH, "utf8"));
      cfg = deepMerge(cfg, ab);
    }
    currentConfig = cfg;
    // eslint-disable-next-line no-console
    console.log(`[config] reloaded: ${CONFIG_PATH}${AB_PATH ? ` + ${AB_PATH}` : ""}`);
  } catch (err) {
    console.error("[config] reload failed:", err);
  }
}

export function watchConfig(): void {
  try {
    fs.watch(CONFIG_PATH, { persistent: false }, () => setTimeout(reloadConfig, 100));
    if (AB_PATH) fs.watch(AB_PATH, { persistent: false }, () => setTimeout(reloadConfig, 100));
    console.log(`[config] watching ${CONFIG_PATH}${AB_PATH ? ` and ${AB_PATH}` : ""}`);
  } catch (err) {
    console.error("[config] watch failed:", err);
  }
}

function deepMerge<T>(a: T, b: any): T {
  if (typeof a !== "object" || a === null) return b as T;
  const out: any = Array.isArray(a) ? [...(a as any)] : { ...(a as any) };
  for (const [k, v] of Object.entries(b || {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof (out as any)[k] === "object") {
      (out as any)[k] = deepMerge((out as any)[k], v);
    } else {
      (out as any)[k] = v;
    }
  }
  return out as T;
}