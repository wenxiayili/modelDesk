# Security Policy / 安全政策

中文 | [English](#english)

## 支持版本

当前项目处于 `0.x` 阶段，只维护最新主线版本。

## 报告漏洞

如果发现安全问题，请不要先公开提交可利用细节。建议通过 GitHub Security Advisory 或私下联系维护者报告。

报告时请包含：

- 受影响版本
- 复现步骤
- 影响范围
- 相关模型文件或最小复现样例

## 范围

重点关注：

- 本地文件读取边界
- 文件关联启动参数处理
- 模型/贴图解析导致的崩溃或资源耗尽
- 打包产物中的第三方依赖风险

ModelDesk 是本地桌面工具，不会主动上传用户模型文件。

---

## English

## Supported Versions

The project is currently in the `0.x` stage. Only the latest mainline version is supported.

## Reporting a Vulnerability

If you find a security issue, please do not publish exploit details first. Use GitHub Security Advisory or contact the maintainers privately.

Please include:

- Affected version
- Reproduction steps
- Impact
- Related model files or a minimal reproduction package

## Scope

Important areas:

- Local file reading boundaries
- File association launch argument handling
- Crashes or resource exhaustion caused by model/texture parsing
- Third-party dependency risks in packaged builds

ModelDesk is a local desktop tool and does not actively upload user model files.
