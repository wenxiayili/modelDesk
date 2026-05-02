# Architecture / 架构说明

中文 | [English](#english)

ModelDesk 刻意保持小型架构：

- `index.html` 定义应用外壳、面板、视口、弹层和控件。
- `styles.css` 负责 UI 主题、布局、浅色/深色模式和响应式规则。
- `app.js` 负责 Babylon.js 场景、模型加载、文件树、资源诊断、材质控制、测量、截图和 UI 状态。
- `src-tauri/src/lib.rs` 负责桌面能力：启动参数、文件关联事件、原生文件夹扫描、截图保存对话框、单实例路由。
- `scripts/prepare-tauri-dist.js` 在 Tauri 打包前把前端文件和本地化运行时资源复制到 `dist/`。
- `vendor/` 存放离线桌面启动所需的运行时资源。

## 数据流

1. 用户打开文件、文件夹，或从 Windows 资源管理器双击关联文件。
2. Tauri 在需要时读取受限大小的模型包并传给前端。
3. 前端把本地文件注册给 Babylon.js。
4. Babylon.js 加载模型；FBX 通过 Three.js FBXLoader 转为 Babylon 网格。
5. 资源诊断在加载前后运行：
   - glTF、OBJ/MTL、Babylon 场景引用做静态诊断
   - Babylon 材质创建后补充运行时贴图数量
6. UI 面板渲染模型信息、场景层级、材质、资源、测量和状态。

## 设计原则

- 第一屏就是模型查看器，不做落地页。
- 优先本地和离线能力，不依赖 CDN 或 PATH。
- Windows 桌面行为必须显式且可验证。
- 在单文件前端成为真实维护瓶颈前，不引入框架迁移。
- 把资源诊断当成产品能力，而不是单纯错误提示。

---

## English

ModelDesk intentionally keeps a small architecture:

- `index.html` defines the application shell, panels, viewport, popovers, and controls.
- `styles.css` owns the full UI theme, layout, light/dark modes, and responsive behavior.
- `app.js` owns Babylon.js scene setup, model loading, file tree rendering, resource diagnostics, material controls, measurement, screenshots, and UI state.
- `src-tauri/src/lib.rs` owns desktop-only capabilities: launch arguments, file association events, native folder scanning, screenshot save dialog, and single-instance routing.
- `scripts/prepare-tauri-dist.js` copies frontend files and vendored runtime assets into `dist/` before Tauri packaging.
- `vendor/` stores runtime assets required for offline desktop startup.

## Data Flow

1. The user opens files, a folder, or a file association from Windows Explorer.
2. Tauri reads a bounded model package when needed and sends files to the frontend.
3. The frontend registers local files with Babylon.js.
4. Babylon.js loads the model; FBX is converted through Three.js FBXLoader.
5. Resource diagnostics run before and after load:
   - static diagnostics for glTF, OBJ/MTL, and Babylon scene references
   - runtime texture count after Babylon creates materials
6. UI panels render model metadata, scene hierarchy, materials, resources, measurements, and status.

## Design Principles

- Keep the first screen as the actual model viewer, not a landing page.
- Prefer local/offline behavior over CDN or PATH-dependent behavior.
- Keep Windows desktop behavior explicit and testable.
- Avoid framework churn until the single-file frontend becomes a real maintenance bottleneck.
- Treat resource diagnostics as a product feature, not only an error message.
