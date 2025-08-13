import fs from "fs/promises";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const STATS_FILE = path.join(DATA_DIR, "stats.json");
const LEADER_FILE = path.join(DATA_DIR, "leaderboard.json");

export interface PlayerStat {
  id: string;
  matches: number;
  wins: number;
  kills: number;
}

export interface LeaderEntry {
  id: string;
  kills: number;
  wins: number;
}

export async function initStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(STATS_FILE); } catch { await fs.writeFile(STATS_FILE, "{}", "utf8"); }
  try { await fs.access(LEADER_FILE); } catch { await fs.writeFile(LEADER_FILE, "[]", "utf8"); }
}

export async function loadStats(): Promise<Record<string, PlayerStat>> {
  const txt = await fs.readFile(STATS_FILE, "utf8");
  return JSON.parse(txt || "{}");
}

export async function saveStats(stats: Record<string, PlayerStat>): Promise<void> {
  await fs.writeFile(STATS_FILE, JSON.stringify(stats), "utf8");
}

export async function loadLeaderboard(): Promise<LeaderEntry[]> {
  const txt = await fs.readFile(LEADER_FILE, "utf8");
  return JSON.parse(txt || "[]");
}

export async function saveLeaderboard(entries: LeaderEntry[]): Promise<void> {
  await fs.writeFile(LEADER_FILE, JSON.stringify(entries), "utf8");
}