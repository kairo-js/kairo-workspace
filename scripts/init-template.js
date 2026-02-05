import { getTemplateRepos } from "./env.js";
import { initRepos } from "./workspace.js";

const repos = getTemplateRepos();

initRepos(repos, { baseDir: "template", label: "template" });
