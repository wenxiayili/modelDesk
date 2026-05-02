# ModelDesk / 模型工作台

中文 | [English](#english)

ModelDesk 是一个基于 Babylon.js + Tauri 的轻量三维模型查看器，目标是在 Windows 上提供一个离线、快速、低学习成本的本地模型查看工具。

仓库地址：<https://github.com/wenxiayili/modelDesk>

它不是 Babylon.js 演示页，而是面向日常模型检查的桌面工具：打开模型、检查文件包、定位材质、查看层级、调整光照、测量尺寸、截图和从资源管理器直接双击启动。

## 功能

- 支持 `.glb`、`.gltf`、`.obj`、`.stl`、`.fbx`、`.babylon`
- 支持多文件、文件夹导入，以及 Tauri 原生文件夹扫描
- Windows 安装后支持从资源管理器双击关联模型直接打开
- 已运行实例可接收二次打开的模型文件
- ArcRotate 相机、适配模型、重置视角、平移、自动旋转、线框、全屏、截图
- View Cube 六方向视角切换
- 网格地面、坐标轴、环境反射、内置环境、自定义 `.env/.hdr`
- Direct / Hemisphere / Point 光照开关、颜色和强度控制
- 模型信息、场景层级、材质列表、材质显隐、材质基础参数查看
- 项目资源概览：模型、贴图、材质库、缓冲、环境文件统计
- 资源诊断：glTF 外部资源、OBJ/MTL 贴图链、Babylon 场景贴图引用
- 测量面板：包围盒尺寸、点到点距离、三轴差值、测量历史
- 深色/浅色主题
- Babylon.js、Three.js FBXLoader 和默认环境贴图均已本地化，桌面版不依赖 CDN 启动

## 技术栈

- Babylon.js
- Tauri 2
- Rust
- Vanilla HTML / CSS / JavaScript
- Three.js FBXLoader 用于 FBX 静态网格导入

## 环境要求

- Windows 10/11
- Node.js 18+
- Rust stable
- Tauri CLI 2
- Windows 打包需要 NSIS/MSI 相关工具链，按 Tauri 官方要求安装

## 开发

```powershell
npm install
npm run frontend:dev
```

Tauri 桌面开发：

```powershell
npm run tauri:dev
```

同步前端资源到 Tauri `dist`：

```powershell
npm run frontend:build
```

Windows 打包：

```powershell
npm run tauri:build
```

产物默认位于：

```text
src-tauri/target/release/bundle/
```

## 验证

```powershell
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
```

发布前再运行：

```powershell
cargo tauri build
```

## 当前限制

- FBX 当前重点覆盖静态网格和基础材质转换，复杂骨骼动画和完整贴图链仍需增强。
- STL/FBX/GLB 的外部资源诊断主要依赖运行时信息；静态依赖诊断优先覆盖 glTF、OBJ/MTL 和 Babylon。
- 资源扫描有数量和体积上限，用于避免误选超大目录导致桌面应用卡死。
- 当前是单窗口模型查看器，多标签/多窗口还未实现。

## 文档

- [架构说明](docs/ARCHITECTURE.md)
- [路线图](docs/ROADMAP.md)
- [发布检查清单](docs/RELEASE_CHECKLIST.md)
- [GitHub 发布指南](docs/GITHUB_PUBLISHING.md)
- [第三方声明](THIRD_PARTY_NOTICES.md)
- [贡献说明](CONTRIBUTING.md)

## 许可证

本项目使用 [MIT License](LICENSE)。

---

## English

ModelDesk is a lightweight 3D model viewer built with Babylon.js and Tauri. It aims to provide a fast, offline, low-friction desktop model inspection tool for Windows.

Repository: <https://github.com/wenxiayili/modelDesk>

It is not a Babylon.js demo page. It is a practical desktop tool for daily model inspection: opening model packages, checking resources, locating materials, browsing scene hierarchy, tuning lighting, measuring dimensions, taking screenshots, and opening associated files directly from Windows Explorer.

## Features

- Supports `.glb`, `.gltf`, `.obj`, `.stl`, `.fbx`, and `.babylon`
- Multi-file import, folder import, and native Tauri folder scanning
- Windows file association support
- Single-instance routing for files opened from Explorer while the app is already running
- ArcRotate camera, fit model, reset view, pan, auto rotate, wireframe, fullscreen, screenshots
- Six-direction View Cube
- Grid, axes, environment reflections, built-in studio environment, custom `.env/.hdr`
- Direct / Hemisphere / Point light controls
- Model metadata, scene hierarchy, material list, material visibility, and material details
- Project resource overview for models, textures, material libraries, buffers, and environments
- Resource diagnostics for glTF external files, OBJ/MTL texture chains, and Babylon scene texture references
- Measurement panel with bounding box size, point-to-point distance, axis deltas, and history
- Light and dark themes
- Vendored Babylon.js, Three.js FBXLoader, and default environment assets for offline desktop startup

## Stack

- Babylon.js
- Tauri 2
- Rust
- Vanilla HTML / CSS / JavaScript
- Three.js FBXLoader for static FBX mesh import

## Requirements

- Windows 10/11
- Node.js 18+
- Rust stable
- Tauri CLI 2
- NSIS/MSI toolchain for Windows installers

## Development

```powershell
npm install
npm run frontend:dev
```

Tauri desktop development:

```powershell
npm run tauri:dev
```

Prepare frontend assets for Tauri:

```powershell
npm run frontend:build
```

Build Windows installers:

```powershell
npm run tauri:build
```

Bundles are generated under:

```text
src-tauri/target/release/bundle/
```

## Verification

```powershell
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
```

Before release:

```powershell
cargo tauri build
```

## Current Limitations

- FBX support currently focuses on static meshes and basic material conversion.
- Static dependency diagnostics mainly cover glTF, OBJ/MTL, and Babylon scene files.
- Resource scanning is bounded by file count and total size to avoid locking the desktop app on huge folders.
- The app is currently a single-window viewer. Tabs and multi-window workflows are not implemented yet.

## License

ModelDesk is released under the [MIT License](LICENSE).
