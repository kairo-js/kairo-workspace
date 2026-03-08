import { getTemplateRepos } from "./env.js";
import { buildRepos } from "./workspace.js";

const repos = getTemplateRepos();

try {
  await buildRepos(repos, { baseDir: "templates", label: "templates" });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
