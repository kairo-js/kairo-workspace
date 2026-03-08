import { getGitRepos, getPackageRepos, getTemplateRepos } from "./env.js";
import { initRepos } from "./workspace.js";

const workspaceRepos = getGitRepos();
const templateRepos = getTemplateRepos();
const packageRepos = getPackageRepos();

try {
  await initRepos(workspaceRepos, { baseDir: "packs", label: "workspace" });
  await initRepos(templateRepos, { baseDir: "templates", label: "templates" });
  await initRepos(packageRepos, { baseDir: "packages", label: "packages" });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
