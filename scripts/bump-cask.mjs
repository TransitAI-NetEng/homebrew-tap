#!/usr/bin/env node
// Point Casks/transit.rb at the newest published prod build.
//
// Reads the SAME manifest the downloads site and install.sh read, so the
// three can never disagree about what "latest" is. Takes the sha256 from
// the manifest rather than re-hashing a local download: re-hashing proves
// only that the file we just fetched matches itself.
//
// Usage:  node scripts/bump-cask.mjs [version]     (default: newest prod)

import { readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.TRANSIT_DOWNLOADS_BASE ?? "https://downloads.transitai.app";
const CASK = new URL("../Casks/transit.rb", import.meta.url);

const manifest = await fetch(`${BASE}/versions.json`).then((r) => {
  if (!r.ok) throw new Error(`manifest fetch failed: HTTP ${r.status}`);
  return r.json();
});

const prod = manifest.filter((e) => e.channel === "prod");
if (prod.length === 0) throw new Error("no prod builds in the manifest");

const wanted = process.argv[2];
const entry = wanted
  ? prod.find((e) => e.version === wanted)
  : prod.reduce((best, e) => (cmp(e.version, best.version) >= 0 ? e : best));
if (!entry) throw new Error(`no prod build for version ${wanted}`);

const dmg = entry.files?.macos_dmg;
if (!dmg) throw new Error(`${entry.version} publishes no macOS dmg`);
if (!/^[0-9a-f]{64}$/i.test(dmg.sha256 ?? "")) {
  throw new Error(`${entry.version} macOS dmg has no usable sha256`);
}

// The cask builds its URL from the version, so the filename must actually
// follow that shape — otherwise the bump silently produces a 404 install.
const expected = `Transit_${entry.version}_aarch64.dmg`;
if (dmg.name !== expected) {
  throw new Error(
    `dmg is named ${dmg.name}, but the cask URL template expects ${expected}. ` +
      `Update the url stanza and this check together.`,
  );
}

const before = readFileSync(CASK, "utf8");
const after = before
  .replace(/^(\s*version\s+)"[^"]*"/m, `$1"${entry.version}"`)
  .replace(/^(\s*sha256\s+).*/m, `$1"${dmg.sha256.toLowerCase()}"`);

if (after === before) {
  console.log(`Casks/transit.rb already at ${entry.version}`);
  process.exit(0);
}
writeFileSync(CASK, after);
console.log(`Casks/transit.rb -> ${entry.version} (${dmg.sha256.slice(0, 12)}…)`);

function cmp(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}
