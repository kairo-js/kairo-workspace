import "dotenv/config";
import path from "node:path";

/**
 * Safely parse repository list from env variable.
 * Supports:
 *  - Newline separated
 *  - Space separated
 *  - JSON array string
 *  - Mixed whitespace
 */
function parseRepoList(raw) {
  if (!raw || typeof raw !== "string") {
    return [];
  }

  const trimmed = raw.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {}
  }

  return trimmed
    .replace(/\\/g, "")
    .split(/\s+/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required env: ${name}`);
    console.error("cwd:", process.cwd());
    console.error("Available env keys:", Object.keys(process.env));
    throw new Error(`${name} is not defined in .env`);
  }
  return value;
}

export function getGitRepos() {
  return parseRepoList(requireEnv("GIT_REPOS"));
}

export function getTemplateRepos() {
  return parseRepoList(process.env.TEMPLATE_REPOS);
}

export function getPackageRepos() {
  return parseRepoList(process.env.PACKAGE_REPOS);
}

export function repoUrlToDirName(repoUrl) {
  if (typeof repoUrl !== "string") {
    throw new Error(`Invalid repo url: ${repoUrl}`);
  }

  const name = repoUrl.split("/").pop();

  if (!name || !name.endsWith(".git")) {
    throw new Error(`Invalid repo url: ${repoUrl}`);
  }

  return name.replace(/\.git$/, "");
}

export function repoUrlToPath(repoUrl, baseDir = "packs") {
  return path.resolve("..", baseDir, repoUrlToDirName(repoUrl));
}
