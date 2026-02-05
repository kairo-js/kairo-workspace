import { getTemplateRepos } from "./env.js";
import { buildRepos } from "./workspace.js";

const repos = getTemplateRepos();

buildRepos(repos, { baseDir: "templates", label: "templates" });
