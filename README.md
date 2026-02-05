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

3. Install dependencies for the workspace: `npm install`
4. Initialize all repositories: `npm run init`
   ###### This command will:
   Clone all repositories listed in the `.env` file
   Run npm install in each repository

5. Build all repositories: `npm run build`
   ###### This command will:
   Run npm run build in each repository

## Template/Package workspaces
Admins can manage separate workspaces for templates and npm packages.

### Optional .env entries
- `TEMPLATE_REPOS`: template repositories (optional)
- `PACKAGE_REPOS`: npm package repositories (optional)

If these values are not set, the related commands will be skipped.

### Commands
- Initialize template repositories: `npm run init:template`
- Initialize package repositories: `npm run init:package`
- Build template repositories: `npm run build:template`
- Build package repositories: `npm run build:package`

### Working directories
- Default workspace: `../packs/`
- Templates workspace: `../templates/`
- Packages workspace: `../packages/`

## Requirements
- Windows
- Node.js (LTS recommended)
- npm
- Git with SSH access
