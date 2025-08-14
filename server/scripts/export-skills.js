#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const configPath = path.resolve(root, 'src', 'config', 'balance.json');
const outDir = path.resolve(root, '..', 'docs');
const outCsv = path.join(outDir, 'skills.csv');

function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const skills = cfg.skills || [];
  const rows = [];
  rows.push(['name','id','element','kind','rarity','power','radius','range','chainCount','castMs','cooldownMs','notes','suggestion']);
  for (const s of skills) {
    rows.push([
      s.name || '', s.id || '', s.element || '', s.kind || inferKind(s), s.rarity || 'common',
      num(s.power), num(s.radius), num(s.range), num(s.chainCount), num(s.castMs), num(s.cooldownMs), '', ''
    ]);
  }
  const csv = rows.map(r => r.map(cell => formatCsv(cell)).join(',')).join('\n');
  fs.writeFileSync(outCsv, csv, 'utf8');
  console.log(`Exported ${skills.length} skills to ${outCsv}`);
}

function inferKind(s) { return s.passive ? 'passive' : 'active'; }
function num(v) { return (v === undefined || v === null) ? '' : String(v); }
function formatCsv(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

main();