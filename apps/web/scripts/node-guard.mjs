#!/usr/bin/env node
/**
 * node-guard — run a command on a Node version Astro actually supports.
 *
 * Usage: node scripts/node-guard.mjs -- <command> [args...]
 *
 * npm scripts run under whatever `node` is first on PATH, which on this machine
 * is v22.23.0 — just below Astro's >=22.23.4 floor. Rather than making every
 * command remember `nvm use`, this finds a supported interpreter (nvm, Volta,
 * Homebrew, or anywhere on PATH, preferring the repo's .nvmrc) and re-runs the
 * command with it.
 *
 * Written to run on the *old* Node too, since it is the thing that fixes it.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const separator = args.indexOf("--");
const command = separator === -1 ? args : args.slice(separator + 1);

if (command.length === 0) {
  console.error("node-guard: nothing to run. Usage: node scripts/node-guard.mjs -- <command> [args...]");
  process.exit(1);
}

/** Parse a leading `>=X.Y.Z` out of an engines string; null if not that shape. */
function parseFloor(range) {
  const match = />=\s*(\d+)\.(\d+)\.(\d+)/.exec(range ?? "");
  return match ? match.slice(1, 4).map(Number) : null;
}

/** [major, minor, patch] from "v24.22.1". */
function parseVersion(raw) {
  const match = /v?(\d+)\.(\d+)\.(\d+)/.exec(raw ?? "");
  return match ? match.slice(1, 4).map(Number) : null;
}

const atLeast = (version, floor) =>
  floor === null || version === null ? true : compare(version, floor) >= 0;

function compare(a, b) {
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0);
  }
  return 0;
}

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "..");

/** .nvmrc, walking up so apps/web inherits the repo's version. */
function findNvmrc(start) {
  let dir = start;
  for (;;) {
    const file = join(dir, ".nvmrc");
    if (existsSync(file)) return readFileSync(file, "utf8").trim();
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const { engines = {} } = JSON.parse(readFileSync(join(appRoot, "package.json"), "utf8"));
const floor = parseFloor(engines.node);
const current = parseVersion(process.version);
const nvmrc = findNvmrc(appRoot);
const wantedMajor = /^\d+$/.test(nvmrc ?? "") ? Number(nvmrc) : null;

if (floor === null || atLeast(current, floor)) {
  run(process.execPath);
} else {
  const candidates = discover();
  const usable = candidates
    .filter((candidate) => atLeast(candidate.version, floor))
    .sort((a, b) => {
      // Honour .nvmrc first, then newest.
      const aWanted = wantedMajor !== null && a.version[0] === wantedMajor ? 1 : 0;
      const bWanted = wantedMajor !== null && b.version[0] === wantedMajor ? 1 : 0;
      return bWanted - aWanted || compare(b.version, a.version);
    });

  if (usable.length === 0) {
    console.error(
      `node-guard: Node ${process.version} does not satisfy "${engines.node}" (needed by Astro),\n` +
        `           and no supported Node was found. Install one — \`nvm install ${nvmrc ?? 24}\`` +
        ` — or run this with a supported \`node\` first on PATH.`,
    );
    process.exit(1);
  }

  const chosen = usable[0];
  console.error(
    `node-guard: ${process.version} does not satisfy "${engines.node}" — using ` +
      `v${chosen.version.join(".")} from ${chosen.path}`,
  );
  run(chosen.path);
}

function discover() {
  const found = new Map();
  const add = (nodePath, versionFromDir) => {
    if (!existsSync(nodePath) || found.has(nodePath)) return;
    const version = versionFromDir ?? probe(nodePath);
    if (version) found.set(nodePath, { path: nodePath, version });
  };

  // nvm: directory name is the version, so no subprocess needed.
  for (const nvmDir of [process.env.NVM_DIR && join(process.env.NVM_DIR, "versions/node"), join(homedir(), ".nvm/versions/node")]) {
    if (!nvmDir || !existsSync(nvmDir)) continue;
    for (const entry of readdirSync(nvmDir)) {
      const version = parseVersion(entry);
      if (version) add(join(nvmDir, entry, "bin/node"), version);
    }
  }

  // Volta / asdf / mise put the active Node on PATH; Homebrew installs here.
  add(join(homedir(), ".volta/bin/node"));
  add(join(homedir(), ".local/share/mise/shims/node"));
  add("/opt/homebrew/bin/node");
  add("/usr/local/bin/node");

  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (dir) add(join(dir, "node"));
  }

  return [...found.values()];
}

function probe(nodePath) {
  try {
    const result = spawnSync(nodePath, ["--version"], { encoding: "utf8", timeout: 5000 });
    return result.status === 0 ? parseVersion(result.stdout) : null;
  } catch {
    return null;
  }
}

function run(nodePath) {
  const nodeDir = dirname(nodePath);
  const child = spawn(command[0], command.slice(1), {
    stdio: "inherit",
    shell: false,
    env: { ...process.env, PATH: `${nodeDir}${process.env.PATH ? ":" : ""}${process.env.PATH ?? ""}` },
  });
  child.on("error", (error) => {
    console.error(`node-guard: failed to run ${command[0]}: ${error.message}`);
    process.exit(1);
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}