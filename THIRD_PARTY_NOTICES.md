# Third-Party Notices / 第三方声明

中文 | [English](#english)

ModelDesk 内置少量运行时资源，以保证桌面版可以离线启动和打包。

## Babylon.js

- 文件：
  - `vendor/babylon/babylon.js`
  - `vendor/babylon/babylonjs.loaders.min.js`
- 上游：<https://www.babylonjs.com/>
- Vendoring 来源：
  - <https://cdn.babylonjs.com/babylon.js>
  - <https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js>
- 许可证：Apache License 2.0

## Babylon.js 环境资源

- 文件：`vendor/babylon/studio.env`
- Vendoring 来源：<https://assets.babylonjs.com/environments/studio.env>
- 用途：内置工作室环境光照。
- 注意：重新分发修改后的发布包前，应复核上游资源许可。

## Three.js

- 文件目录：`vendor/three/`
- 上游：<https://threejs.org/>
- 用途：
  - `three.module.js`
  - `FBXLoader.js`
  - FBX loader 支持文件
- 许可证：MIT

## fflate

- 文件：`vendor/three/examples/jsm/libs/fflate.module.js`
- 上游：<https://github.com/101arrowz/fflate>
- 许可证：MIT

## 维护

升级本地化运行时资源时：

1. 更新 `vendor/` 下的文件。
2. 更新 `vendor/babylon/README.md` 和本文档。
3. 运行：

```powershell
node scripts/prepare-tauri-dist.js
cargo tauri build
```

---

## English

ModelDesk vendors a small set of runtime assets so the desktop app can start offline and be packaged without CDN access.

## Babylon.js

- Files:
  - `vendor/babylon/babylon.js`
  - `vendor/babylon/babylonjs.loaders.min.js`
- Upstream: <https://www.babylonjs.com/>
- Vendoring source:
  - <https://cdn.babylonjs.com/babylon.js>
  - <https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js>
- License: Apache License 2.0

## Babylon.js Environment Asset

- File: `vendor/babylon/studio.env`
- Vendoring source: <https://assets.babylonjs.com/environments/studio.env>
- Purpose: built-in studio environment lighting.
- Note: verify upstream asset licensing before redistributing modified release packages.

## Three.js

- Directory: `vendor/three/`
- Upstream: <https://threejs.org/>
- Used for:
  - `three.module.js`
  - `FBXLoader.js`
  - FBX loader support files
- License: MIT

## fflate

- File: `vendor/three/examples/jsm/libs/fflate.module.js`
- Upstream: <https://github.com/101arrowz/fflate>
- License: MIT

## Maintenance

When upgrading vendored runtime files:

1. Update the files in `vendor/`.
2. Update `vendor/babylon/README.md` and this notice file.
3. Run:

```powershell
node scripts/prepare-tauri-dist.js
cargo tauri build
```
