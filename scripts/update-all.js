import { getGitRepos, getPackageRepos, getTemplateRepos } from "./env.js";
import { updateRepos } from "./workspace.js";

const workspaceRepos = getGitRepos();
const templateRepos = getTemplateRepos();
const packageRepos = getPackageRepos();

try {
  await updateRepos(workspaceRepos, { baseDir: "packs", label: "workspace" });
  await updateRepos(templateRepos, { baseDir: "templates", label: "templates" });
  await updateRepos(packageRepos, { baseDir: "packages", label: "packages" });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
