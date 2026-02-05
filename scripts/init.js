import { getGitRepos } from "./env.js";
import { initRepos } from "./workspace.js";

const repos = getGitRepos();

initRepos(repos, { baseDir: "packs", label: "workspace" });
