# Kairo-workspace
[日本語版 README はこちら](https://github.com/Kairo-ts/Kairo-workspace/blob/main/README-ja.md)

## Overview
Kairo-workspace is a workspace that provides simple commands to initialize and build a Kairo-based project composed of multiple repositories.
It automates repository cloning, dependency installation, and build execution from a single entry point.

## tup and Build
1. Clone this repository:
   - `git clone git@github.com:Kairo-ts/Kairo-workspace.git`
   - `cd Kairo-workspace`

2. Create a .env file:
   Create a .env file by referring to .env.example and edit it to match your environment.
   ###### Example workflow:
   Copy .env.example to .env
   Edit repository URLs as needed

3. Install dependencies for the workspace: `pnpm install`
4. Initialize all repositories: `pnpm run init`
   ###### This command will:
   Clone all repositories listed in the `.env` file
   For newly added repositories only: clone and run pnpm install/pnpm update
   Already cloned repositories are skipped

5. Build all repositories: `pnpm run build`
   ###### This command will:
   Run pnpm run build in each repository

## Template/Package workspaces
Admins can manage separate workspaces for templates and package repositories.

### Optional .env entries
- `TEMPLATE_REPOS`: template repositories (optional)
- `PACKAGE_REPOS`: package repositories (optional)

If these values are not set, `pnpm run init` will skip those groups.

### Commands
- Initialize all repositories (workspace/templates/packages): `pnpm run init`
- Build template repositories: `pnpm run build:template`
- Build package repositories: `pnpm run build:package`

### Parallel execution
- Repository operations run in parallel with a default concurrency of `10`.
- You can change it with `KAIRO_CONCURRENCY` (example: `KAIRO_CONCURRENCY=5 pnpm run init`).


### Working directories
- Default workspace: `../packs/`
- Templates workspace: `../templates/`
- Packages workspace: `../packages/`

## Requirements
- Windows
- Node.js (LTS recommended)
- pnpm
- Git with SSH access
