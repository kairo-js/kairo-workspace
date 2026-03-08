import { getPackageRepos } from "./env.js";
import { buildRepos } from "./workspace.js";

const repos = getPackageRepos();

try {
  await buildRepos(repos, { baseDir: "packages", label: "packages" });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
