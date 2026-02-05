import "dotenv/config";
import path from "node:path";

function parseRepoList(raw) {
  if (!raw) {
    return [];
  }

  return raw
    .split(/\s+/)
    .map((v) => v.trim())
    .filter((v) => v && v !== "\\");
}

export function getGitRepos() {
  const raw = process.env.GIT_REPOS;
  if (!raw) {
    throw new Error("GIT_REPOS is not defined in .env");
  }

  return parseRepoList(raw);
}

export function getTemplateRepos() {
  return parseRepoList(process.env.TEMPLATE_REPOS);
}

export function getPackageRepos() {
  return parseRepoList(process.env.PACKAGE_REPOS);
}

export function repoUrlToDirName(repoUrl) {
  const name = repoUrl.split("/").pop();
  if (!name || !name.endsWith(".git")) {
    throw new Error(`Invalid repo url: ${repoUrl}`);
  }
  return name.replace(/\.git$/, "");
}

export function repoUrlToPath(repoUrl, baseDir = "packs") {
  return path.resolve("..", baseDir, repoUrlToDirName(repoUrl));
}
