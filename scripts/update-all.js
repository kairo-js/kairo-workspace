import { getGitRepos, getPackageRepos, getTemplateRepos } from "./env.js";
import { updateRepos } from "./workspace.js";

const workspaceRepos = getGitRepos();
const templateRepos = getTemplateRepos();
const packageRepos = getPackageRepos();

updateRepos(workspaceRepos, { baseDir: "packs", label: "workspace" });
updateRepos(templateRepos, { baseDir: "templates", label: "templates" });
updateRepos(packageRepos, { baseDir: "packages", label: "packages" });
