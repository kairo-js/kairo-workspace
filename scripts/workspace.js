import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { repoUrlToDirName, repoUrlToPath } from "./env.js";

const DEFAULT_CONCURRENCY = 10;

function resolveConcurrency() {
  const value = Number.parseInt(process.env.KAIRO_CONCURRENCY ?? "", 10);

  if (Number.isNaN(value) || value < 1) {
    return DEFAULT_CONCURRENCY;
  }

  return value;
}

function runCommand(command, { cwd }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      shell: true,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed (${code ?? "unknown"}): ${command}`));
    });
  });
}

async function runWithConcurrency(items, worker, { concurrency }) {
  let index = 0;
  let firstError = null;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length && firstError === null) {
      const currentIndex = index;
      index += 1;

      try {
        await worker(items[currentIndex]);
      } catch (error) {
        firstError = error;
      }
    }
  });

  await Promise.all(workers);

  if (firstError) {
    throw firstError;
  }
}

export async function initRepos(repos, { baseDir, label }) {
  if (repos.length === 0) {
    console.log(`skip init (${label}): no repos`);
    return;
  }

  mkdirSync(path.resolve("..", baseDir), { recursive: true });

  const concurrency = resolveConcurrency();
  console.log(`init concurrency (${label}): ${concurrency}`);

  await runWithConcurrency(
    repos,
    async (repoUrl) => {
      const dirName = repoUrlToDirName(repoUrl);
      const repoDir = repoUrlToPath(repoUrl, baseDir);

      if (existsSync(repoDir)) {
        console.log(`skip init (${label}): ${dirName} (already cloned)`);
        return;
      }

      console.log(`git clone ${repoUrl}`);
      await runCommand(`git clone ${repoUrl} ${repoDir}`, { cwd: ".." });

      console.log(`pnpm install: ${dirName}`);
      await runCommand("pnpm install", { cwd: repoDir });

      console.log(`pnpm update: ${dirName}`);
      await runCommand("pnpm update", { cwd: repoDir });
    },
    { concurrency },
  );
}

export async function buildRepos(repos, { baseDir, label, skipWorkspace = false }) {
  if (repos.length === 0) {
    console.log(`skip build (${label}): no repos`);
    return;
  }

  const buildTargets = repos.filter((repoUrl) => {
    const dirName = repoUrlToDirName(repoUrl);

    if (skipWorkspace && dirName === "kairo-workspace") {
      console.log(`skip build (${label}): ${dirName}`);
      return false;
    }

    return true;
  });

  if (buildTargets.length === 0) {
    console.log(`skip build (${label}): no build targets`);
    return;
  }

  const concurrency = resolveConcurrency();
  console.log(`build concurrency (${label}): ${concurrency}`);

  await runWithConcurrency(
    buildTargets,
    async (repoUrl) => {
      const dirName = repoUrlToDirName(repoUrl);
      const repoDir = repoUrlToPath(repoUrl, baseDir);

      console.log(`\nBUILD START (${label}): ${dirName}`);

      try {
        await runCommand("pnpm run build", { cwd: repoDir });
      } catch {
        throw new Error(`BUILD FAILED (${label}): ${dirName}\nPath: ${repoDir}`);
      }

      console.log(`BUILD SUCCESS (${label}): ${dirName}`);
    },
    { concurrency },
  );
}

export async function updateRepos(repos, { baseDir, label }) {
  if (repos.length === 0) {
    console.log(`skip update (${label}): no repos`);
    return;
  }

  const concurrency = resolveConcurrency();
  console.log(`update concurrency (${label}): ${concurrency}`);

  await runWithConcurrency(
    repos,
    async (repoUrl) => {
      const dirName = repoUrlToDirName(repoUrl);
      const repoDir = repoUrlToPath(repoUrl, baseDir);

      if (!existsSync(repoDir)) {
        console.log(`skip update (${label}): ${dirName} (missing)`);
        return;
      }

      console.log(`pnpm update (${label}): ${dirName}`);

      try {
        await runCommand("pnpm update", { cwd: repoDir });
      } catch {
        throw new Error(`UPDATE FAILED (${label}): ${dirName}\nPath: ${repoDir}`);
      }
    },
    { concurrency },
  );
}
