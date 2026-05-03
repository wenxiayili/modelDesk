export function createReportExportTools(config) {
  const {
    state,
    stripExtension,
    buildResourceHealthReport,
    setStatus
  } = config;

  async function exportResourceHealthReport() {
    const diagnostics = state.resourceDiagnostics;
    if (!diagnostics) {
      setStatus("没有可导出的资源诊断结果", true);
      return;
    }

    const report = buildResourceHealthReport(diagnostics, state.activeFile);
    const baseName = state.activeFile ? stripExtension(state.activeFile.name) : diagnostics.stats?.rootName || "资源包";
    const fileName = `${sanitizeFileName(baseName)}-资源健康报告.md`;

    try {
      const savedPath = await saveTextReport(report, fileName);
      if (savedPath) {
        setStatus(`已导出资源健康报告：${savedPath}`);
      } else {
        setStatus("已取消导出资源健康报告");
      }
    } catch (error) {
      setStatus(`导出资源健康报告失败：${error?.message || error}`, true);
      console.error(error);
    }
  }

  async function saveTextReport(text, fileName) {
    const invoke = window.__TAURI__?.core?.invoke;
    if (invoke) {
      return invoke("save_text_with_dialog", { data: text, name: fileName });
    }
    downloadBlob(new Blob([text], { type: "text/markdown;charset=utf-8" }), fileName);
    return fileName;
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function sanitizeFileName(name) {
    return String(name || "model")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim() || "model";
  }

  return {
    exportResourceHealthReport
  };
}
