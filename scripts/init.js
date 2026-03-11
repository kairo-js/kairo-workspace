import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getGitRepos, getPackageRepos, getTemplateRepos } from "./env.js";
import { initRepos } from "./workspace.js";

const VSCODE_SETTINGS = `{
    "editor.formatOnSave": true,

    "editor.defaultFormatter": "esbenp.prettier-vscode",

    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[json]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },

    "editor.codeActionsOnSave": {
        "source.organizeImports": "explicit"
    },

    "files.exclude": {
        "**/node_modules": true,
        "**/.build": true,
        "**/BP/scripts": true,
        "**/BP/manifest.json": true,
        "**/BP/pack_icon.png": true,
        "**/RP/manifest.json": true,
        "**/RP/pack_icon.png": true,
        "**/RP/textures/**/pack_icon.png": true,
        "**/lib": true,
        "**/pnpm-lock.yaml": true
    },

    "js/ts.tsdk.path": "node_modules/typescript/lib",

    "js/ts.preferences.importModuleSpecifier": "shortest",

    "js/ts.updateImportsOnFileMove.enabled": "always"
}
`;

const VSCODE_EXTENSIONS = `{
    "recommendations": ["esbenp.prettier-vscode"]
}
`;

function ensureVSCodeConfig() {
  const vscodeDir = path.resolve("..", ".vscode");
  const settingsPath = path.join(vscodeDir, "settings.json");
  const extensionsPath = path.join(vscodeDir, "extensions.json");

  mkdirSync(vscodeDir, { recursive: true });

  if (!existsSync(settingsPath)) {
    writeFileSync(settingsPath, VSCODE_SETTINGS, "utf-8");
  }

  if (!existsSync(extensionsPath)) {
    writeFileSync(extensionsPath, VSCODE_EXTENSIONS, "utf-8");
  }
}

const workspaceRepos = getGitRepos();
const templateRepos = getTemplateRepos();
const packageRepos = getPackageRepos();

try {
  ensureVSCodeConfig();
  await initRepos(workspaceRepos, { baseDir: "packs", label: "workspace" });
  await initRepos(templateRepos, { baseDir: "templates", label: "templates" });
  await initRepos(packageRepos, { baseDir: "packages", label: "packages" });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
