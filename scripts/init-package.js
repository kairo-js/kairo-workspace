import { getPackageRepos } from "./env.js";
import { initRepos } from "./workspace.js";

const repos = getPackageRepos();

initRepos(repos, { baseDir: "packages", label: "packages" });
