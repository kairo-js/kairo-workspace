import { getGitRepos } from "./env.js";
import { buildRepos } from "./workspace.js";

const repos = getGitRepos();

buildRepos(repos, { baseDir: "packs", label: "workspace", skipWorkspace: true });
