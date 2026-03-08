import { getGitRepos } from "./env.js";
import { buildRepos } from "./workspace.js";

const repos = getGitRepos();

try {
  await buildRepos(repos, { baseDir: "packs", label: "workspace", skipWorkspace: true });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
