# Release Checklist / 发布检查清单

中文 | [English](#english)

## 发布前

- [ ] 更新 `package.json` 版本。
- [ ] 更新 `src-tauri/Cargo.toml` 版本。
- [ ] 更新 `src-tauri/tauri.conf.json` 版本。
- [ ] 更新 `CHANGELOG.md`。
- [ ] 确认 `README.md` 的功能和限制仍准确。
- [ ] 确认 `THIRD_PARTY_NOTICES.md` 与 `vendor/` 内容一致。

## 验证

```powershell
npm install
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
cargo tauri build
```

## Windows 手工检查

- [ ] 安装 NSIS 包。
- [ ] 安装 MSI 包。
- [ ] 从应用内打开 `.glb`。
- [ ] 从应用内打开包含 `.gltf + .bin + textures` 的文件夹。
- [ ] 从资源管理器双击 `.glb/.gltf` 能打开并加载。
- [ ] 已运行实例下二次双击模型能切换加载。
- [ ] 深色/浅色主题可切换。
- [ ] 截图保存正常。
- [ ] 卸载后文件关联不会留下异常状态。

## 产物

```text
src-tauri/target/release/bundle/
```

---

## English

## Before Release

- [ ] Update `package.json` version.
- [ ] Update `src-tauri/Cargo.toml` version.
- [ ] Update `src-tauri/tauri.conf.json` version.
- [ ] Update `CHANGELOG.md`.
- [ ] Confirm `README.md` still matches current features and limitations.
- [ ] Confirm `THIRD_PARTY_NOTICES.md` matches `vendor/`.

## Verification

```powershell
npm install
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
cargo tauri build
```

## Windows Manual Checks

- [ ] Install the NSIS package.
- [ ] Install the MSI package.
- [ ] Open a `.glb` from inside the app.
- [ ] Open a folder containing `.gltf + .bin + textures`.
- [ ] Double-click `.glb/.gltf` from Windows Explorer and confirm the model loads.
- [ ] Double-click another model while the app is already running and confirm it switches.
- [ ] Toggle light/dark theme.
- [ ] Save a screenshot.
- [ ] Confirm uninstall does not leave broken file associations.

## Artifacts

```text
src-tauri/target/release/bundle/
```
