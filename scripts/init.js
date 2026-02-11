import { getGitRepos, getPackageRepos, getTemplateRepos } from "./env.js";
import { initRepos } from "./workspace.js";

const workspaceRepos = getGitRepos();
const templateRepos = getTemplateRepos();
const packageRepos = getPackageRepos();

initRepos(workspaceRepos, { baseDir: "packs", label: "workspace" });
initRepos(templateRepos, { baseDir: "templates", label: "templates" });
initRepos(packageRepos, { baseDir: "packages", label: "packages" });
