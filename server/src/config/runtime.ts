import fs from "fs";
import path from "path";
import type { Config, Balance } from "../game/types";

const CONFIG_PATH = process.env.CONFIG_PATH || path.join(__dirname, "config", "balance.json");
let currentConfig: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

export function getConfig(): Config {
  return currentConfig;
}

export function getBalance(): Balance {
  return currentConfig.balance;
}

export function reloadConfig(): void {
  try {
    const txt = fs.readFileSync(CONFIG_PATH, "utf8");
    currentConfig = JSON.parse(txt);
    // eslint-disable-next-line no-console
    console.log(`[config] reloaded from ${CONFIG_PATH}`);
  } catch (err) {
    console.error("[config] reload failed:", err);
  }
}

export function watchConfig(): void {
  try {
    fs.watch(CONFIG_PATH, { persistent: false }, () => {
      setTimeout(reloadConfig, 100);
    });
    // eslint-disable-next-line no-console
    console.log(`[config] watching ${CONFIG_PATH}`);
  } catch (err) {
    console.error("[config] watch failed:", err);
  }
}