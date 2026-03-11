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

function runCommand(command, { cwd, env }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      env: {
        ...process.env,
        ...env,
      },
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

function runGitCommand(command, options) {
  return runCommand(command, {
    ...options,
    env: {
      GIT_TERMINAL_PROMPT: "0",
      GIT_SSH_COMMAND: "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new",
    },
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
      await runGitCommand(`git clone ${repoUrl} ${repoDir}`, { cwd: ".." });

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

  const results = new Map();

  try {
    await runWithConcurrency(
      buildTargets,
      async (repoUrl) => {
        const dirName = repoUrlToDirName(repoUrl);
        const repoDir = repoUrlToPath(repoUrl, baseDir);

        console.log(`\nBUILD START (${label}): ${dirName}`);

        try {
          await runCommand("pnpm run build", { cwd: repoDir });
          results.set(dirName, { dirName, repoDir, status: "success" });
        } catch {
          results.set(dirName, { dirName, repoDir, status: "failed" });
          throw new Error(`BUILD FAILED (${label}): ${dirName}\nPath: ${repoDir}`);
        }
      },
      { concurrency },
    );
  } finally {
    if (results.size > 0) {
      console.log(`\nBUILD RESULT (${label})`);

      for (const repoUrl of buildTargets) {
        const dirName = repoUrlToDirName(repoUrl);
        const result = results.get(dirName);

        if (!result) {
          continue;
        }

        if (result.status === "success") {
          console.log(`BUILD SUCCESS (${label}): ${result.dirName}`);
        } else {
          console.log(`BUILD FAILED (${label}): ${result.dirName}\nPath: ${result.repoDir}`);
        }
      }
    }
  }
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

export async function pullRepos(repos, { baseDir, label }) {
  if (repos.length === 0) {
    console.log(`skip pull (${label}): no repos`);
    return;
  }

  const concurrency = resolveConcurrency();
  console.log(`pull concurrency (${label}): ${concurrency}`);

  await runWithConcurrency(
    repos,
    async (repoUrl) => {
      const dirName = repoUrlToDirName(repoUrl);
      const repoDir = repoUrlToPath(repoUrl, baseDir);

      if (!existsSync(repoDir)) {
        console.log(`skip pull (${label}): ${dirName} (missing)`);
        return;
      }

      console.log(`git pull flow (${label}): ${dirName}`);

      try {
        await runGitCommand("git checkout main", { cwd: repoDir });
        await runGitCommand("git fetch origin", { cwd: repoDir });
        await runGitCommand("git merge --ff-only origin/main", { cwd: repoDir });
      } catch {
        throw new Error(`PULL FAILED (${label}): ${dirName}\nPath: ${repoDir}`);
      }
    },
    { concurrency },
  );
}
