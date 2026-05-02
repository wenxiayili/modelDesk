# GitHub Publishing Guide / GitHub 发布指南

中文 | [English](#english)

目标仓库：

```text
https://github.com/wenxiayili/modelDesk.git
```

## 1. 发布前检查

确认这些文件已经存在：

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `THIRD_PARTY_NOTICES.md`
- `.github/workflows/ci.yml`
- `.github/ISSUE_TEMPLATE/*`
- `.github/PULL_REQUEST_TEMPLATE.md`

## 2. 本地验证

```powershell
npm install
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
```

如果要发布安装包：

```powershell
cargo tauri build
```

## 3. 建议的 GitHub 仓库设置

- Repository name: `modelDesk`
- Description: `A lightweight offline 3D model viewer built with Babylon.js and Tauri.`
- Topics:
  - `tauri`
  - `babylonjs`
  - `3d-model-viewer`
  - `gltf`
  - `glb`
  - `fbx`
  - `windows`
- License: MIT
- Default branch: `main`

## 4. 首次推送

```powershell
git add .
git commit -m "chore: prepare open source release"
git branch -M main
git remote add origin https://github.com/wenxiayili/modelDesk.git
git push -u origin main
```

如果已经存在 remote，改用：

```powershell
git remote set-url origin https://github.com/wenxiayili/modelDesk.git
git push -u origin main
```

## 5. 不建议上传的内容

这些目录应保持忽略：

- `node_modules/`
- `dist/`
- `src-tauri/target/`
- `.playwright-cli/`

安装包可以通过 GitHub Release 上传，不建议直接提交到源码仓库。

---

## English

Target repository:

```text
https://github.com/wenxiayili/modelDesk.git
```

## 1. Pre-publish Check

Make sure these files exist:

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `THIRD_PARTY_NOTICES.md`
- `.github/workflows/ci.yml`
- `.github/ISSUE_TEMPLATE/*`
- `.github/PULL_REQUEST_TEMPLATE.md`

## 2. Local Verification

```powershell
npm install
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
```

For installer releases:

```powershell
cargo tauri build
```

## 3. Suggested GitHub Settings

- Repository name: `modelDesk`
- Description: `A lightweight offline 3D model viewer built with Babylon.js and Tauri.`
- Topics:
  - `tauri`
  - `babylonjs`
  - `3d-model-viewer`
  - `gltf`
  - `glb`
  - `fbx`
  - `windows`
- License: MIT
- Default branch: `main`

## 4. First Push

```powershell
git add .
git commit -m "chore: prepare open source release"
git branch -M main
git remote add origin https://github.com/wenxiayili/modelDesk.git
git push -u origin main
```

If `origin` already exists:

```powershell
git remote set-url origin https://github.com/wenxiayili/modelDesk.git
git push -u origin main
```

## 5. Do Not Commit

Keep these paths ignored:

- `node_modules/`
- `dist/`
- `src-tauri/target/`
- `.playwright-cli/`

Installer bundles should be uploaded through GitHub Releases instead of being committed to the source repository.
