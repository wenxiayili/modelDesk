# Contributing / 贡献指南

中文 | [English](#english)

欢迎为 ModelDesk 提交问题、建议和代码。

## 开发流程

```powershell
npm install
npm run frontend:dev
npm run tauri:dev
```

提交前检查：

```powershell
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
```

## 代码约定

- 保持实现简单，优先贴合现有 HTML/CSS/JS + Tauri 结构。
- 避免引入重量级前端框架，除非收益明确。
- UI 文案默认中英双文时，中文优先。
- 桌面能力优先保证 Windows 可用。
- 修改模型加载、资源诊断、文件关联、打包逻辑时，需要说明验证方式。

## Pull Request 要求

PR 描述至少包含：

- 修改内容
- 验证命令
- 截图或录屏，如果修改了 UI
- 已知限制或后续事项

## Issue 建议

报告问题时请提供：

- Windows 版本
- ModelDesk 版本
- 模型格式
- 是否通过文件夹导入或资源管理器双击打开
- 错误提示或截图
- 可复现步骤

---

## English

Contributions are welcome: bug reports, feature ideas, documentation improvements, and pull requests.

## Development

```powershell
npm install
npm run frontend:dev
npm run tauri:dev
```

Before submitting:

```powershell
node --check app.js
node scripts/prepare-tauri-dist.js
node --check dist/app.js
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
```

## Code Guidelines

- Keep the implementation simple and aligned with the current HTML/CSS/JS + Tauri structure.
- Avoid introducing a heavy frontend framework unless the benefit is clear.
- For bilingual UI or docs, Chinese comes first.
- Desktop behavior should prioritize Windows reliability.
- Changes to model loading, resource diagnostics, file associations, or packaging must include verification notes.

## Pull Requests

Please include:

- What changed
- Verification commands
- Screenshots or recordings for UI changes
- Known limitations or follow-up work

## Issues

Please include:

- Windows version
- ModelDesk version
- Model format
- Whether the model was opened by folder import or Explorer double-click
- Error messages or screenshots
- Reproduction steps
