# Kairo-workspace

## 概要
Kairo-workspace は、複数のリポジトリから構成される Kairo ベースのプロジェクトを、簡単なコマンドで初期化およびビルドするためのワークスペースです。
リポジトリの clone、依存関係のインストール、ビルドの実行を、1 つの起点からまとめて行うことができます。

## 初期化とビルド
1. このリポジトリを clone:
   - `git clone git@github.com:Kairo-ts/Kairo-workspace.git`
   - `cd .\Kairo-workspace`

2. .env ファイルを作成:
   .env.example を参考にして .env ファイルを作成し、環境に合わせて編集してください。
   ###### 作業例:
   .env.example をコピーして .env を作成する
   管理対象リポジトリの URL を必要に応じて編集する

3. workspace の依存関係をインストール: `npm install`
4. 全リポジトリを初期化: `npm run init`
   ###### このコマンドの内容:
   .env に記載されたリポジトリをすべて clone
   新規追加されたリポジトリのみ clone と npm install/npm update を実行
   すでに clone 済みのリポジトリはスキップ

5. 全リポジトリをビルド: `npm run build`
   ###### このコマンドの内容:
   各リポジトリで npm run build を実行

## Template/Package 用ワークスペース
管理者向けに、template リポジトリと npm package リポジトリ用のワークスペースを別に用意できます。

### .env で指定できる項目
- `TEMPLATE_REPOS`: template 用リポジトリ (任意)
- `PACKAGE_REPOS`: npm package 用リポジトリ (任意)

※ いずれも未設定の場合、`npm run init` 実行時にそのグループはスキップされます。

### コマンド
- 全リポジトリの初期化（workspace/templates/packages）: `npm run init`
- template のビルド: `npm run build:template`
- package のビルド: `npm run build:package`

### 作業先ディレクトリ
- 通常の workspace: `../packs/`
- templates 用: `../templates/`
- packages 用: `../packages/`

## 動作環境
- Windows
- Node.js (LTS 推奨)
- npm
- Git（SSH 接続が可能であること）
