import { getPackageRepos } from "./env.js";
import { buildRepos } from "./workspace.js";

const repos = getPackageRepos();

buildRepos(repos, { baseDir: "package", label: "package" });
