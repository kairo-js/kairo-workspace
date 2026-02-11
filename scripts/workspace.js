import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { repoUrlToDirName, repoUrlToPath } from "./env.js";

export function initRepos(repos, { baseDir, label }) {
  if (repos.length === 0) {
    console.log(`skip init (${label}): no repos`);
    return;
  }

  mkdirSync(path.resolve("..", baseDir), { recursive: true });

  for (const repoUrl of repos) {
    const dirName = repoUrlToDirName(repoUrl);
    const repoDir = repoUrlToPath(repoUrl, baseDir);

    if (existsSync(repoDir)) {
      console.log(`skip init (${label}): ${dirName} (already cloned)`);
      continue;
    }

    console.log(`git clone ${repoUrl}`);
    execSync(`git clone ${repoUrl} ${repoDir}`, {
      cwd: "..",
      stdio: "inherit",
      shell: true,
    });

    console.log(`npm install: ${dirName}`);
    execSync("npm install", {
      cwd: repoDir,
      stdio: "inherit",
      shell: true,
    });

    console.log(`npm update: ${dirName}`);
    execSync("npm update", {
      cwd: repoDir,
      stdio: "inherit",
      shell: true,
    });
  }
}

export function buildRepos(repos, { baseDir, label, skipWorkspace = false }) {
  if (repos.length === 0) {
    console.log(`skip build (${label}): no repos`);
    return;
  }

  for (const repoUrl of repos) {
    const dirName = repoUrlToDirName(repoUrl);

    if (skipWorkspace && dirName === "kairo-workspace") {
      console.log(`skip build (${label}): ${dirName}`);
      continue;
    }

    const repoDir = repoUrlToPath(repoUrl, baseDir);

    console.log(`\nBUILD START (${label}): ${dirName}`);

    try {
      execSync("npm run build", {
        cwd: repoDir,
        stdio: "inherit",
        shell: true,
      });
    } catch {
      console.error(`\nBUILD FAILED (${label}): ${dirName}`);
      console.error(`Path: ${repoDir}`);
      process.exit(1);
    }

    console.log(`BUILD SUCCESS (${label}): ${dirName}`);
  }
}

export function updateRepos(repos, { baseDir, label }) {
  if (repos.length === 0) {
    console.log(`skip update (${label}): no repos`);
    return;
  }

  for (const repoUrl of repos) {
    const dirName = repoUrlToDirName(repoUrl);
    const repoDir = repoUrlToPath(repoUrl, baseDir);

    if (!existsSync(repoDir)) {
      console.log(`skip update (${label}): ${dirName} (missing)`);
      continue;
    }

    console.log(`npm update (${label}): ${dirName}`);

    try {
      execSync("npm update", {
        cwd: repoDir,
        stdio: "inherit",
        shell: true,
      });
    } catch {
      console.error(`\nUPDATE FAILED (${label}): ${dirName}`);
      console.error(`Path: ${repoDir}`);
      process.exit(1);
    }
  }
}
