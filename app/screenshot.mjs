export function createScreenshotTools(config) {
  const {
    els,
    state,
    BABYLON,
    closeUtilityPopovers,
    setStatus,
    stripExtension
  } = config;

  function toggleScreenshotPopover(event) {
    event?.stopPropagation();
    if (!els.screenshotPopover) {
      exportScreenshot("save");
      return;
    }

    const shouldOpen = els.screenshotPopover.hidden;
    closeUtilityPopovers();
    els.screenshotPopover.hidden = !shouldOpen;
    els.shotButton?.classList.toggle("is-active", shouldOpen);
    els.viewShotButton?.classList.toggle("is-active", shouldOpen);
    if (shouldOpen) {
      els.screenshotScaleSelect?.focus();
    }
  }

  function closeScreenshotPopover() {
    if (!els.screenshotPopover) return;
    els.screenshotPopover.hidden = true;
    els.shotButton?.classList.remove("is-active");
    els.viewShotButton?.classList.remove("is-active");
  }

  async function exportScreenshot(mode) {
    if (!state.engine || !state.scene) return;
    const scale = Number(els.screenshotScaleSelect?.value || 1);
    const transparent = Boolean(els.screenshotTransparentToggle?.checked);

    setScreenshotBusy(true);
    try {
      const screenshot = await createScreenshotBlob({
        scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
        transparent
      });

      if (mode === "copy") {
        await copyBlobToClipboard(screenshot.blob);
        setStatus(`截图已复制到剪贴板：${screenshot.width} x ${screenshot.height}`);
        return;
      }

      const fileName = buildScreenshotFileName(screenshot.scale, transparent);
      const saved = await saveScreenshotBlob(screenshot.blob, fileName);
      if (saved.canceled) {
        setStatus("已取消截图保存");
      } else if (saved.path) {
        setStatus(`截图已保存：${saved.path}`);
      } else {
        setStatus(`截图已导出：${screenshot.scale}x PNG`);
      }
    } catch (error) {
      console.error(error);
      setStatus(mode === "copy" ? "当前环境不支持复制 PNG，请使用保存。" : "截图导出失败。", true);
    } finally {
      setScreenshotBusy(false);
    }
  }

  async function createScreenshotBlob(options) {
    const selectedScale = Math.min(Math.max(Number(options.scale) || 1, 1), 3);
    const previousClearColor = state.scene.clearColor?.clone
      ? state.scene.clearColor.clone()
      : new BABYLON.Color4(0.065, 0.085, 0.11, 1);

    let captureCanvas;
    try {
      if (options.transparent) {
        state.scene.clearColor = new BABYLON.Color4(
          previousClearColor.r,
          previousClearColor.g,
          previousClearColor.b,
          0
        );
      }
      state.scene.render();
      captureCanvas = copyCanvasForExport(els.canvas, selectedScale);
    } finally {
      state.scene.clearColor = previousClearColor;
      state.scene.render();
    }

    const blob = await canvasToBlob(captureCanvas, "image/png");
    if (!blob) {
      throw new Error("无法编码截图");
    }

    return {
      blob,
      scale: selectedScale,
      width: captureCanvas.width,
      height: captureCanvas.height
    };
  }

  function copyCanvasForExport(sourceCanvas, scale) {
    const targetCanvas = document.createElement("canvas");
    targetCanvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
    targetCanvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));

    const context = targetCanvas.getContext("2d");
    if (!context) {
      throw new Error("无法创建截图画布");
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
    return targetCanvas;
  }

  function canvasToBlob(canvas, type) {
    if (canvas.toBlob) {
      return new Promise((resolve) => canvas.toBlob(resolve, type));
    }

    const dataUrl = canvas.toDataURL(type);
    const [header, data] = dataUrl.split(",");
    const mimeMatch = header.match(/data:(.*);base64/);
    const mimeType = mimeMatch?.[1] || type || "image/png";
    const binary = window.atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return Promise.resolve(new Blob([bytes], { type: mimeType }));
  }

  async function copyBlobToClipboard(blob) {
    if (!navigator.clipboard?.write || !window.ClipboardItem) {
      throw new Error("当前系统不支持写入剪贴板图片");
    }
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  }

  async function saveScreenshotBlob(blob, fileName) {
    const invoke = window.__TAURI__?.core?.invoke;
    if (invoke) {
      const data = await blobToBase64(blob);
      const path = await invoke("save_png_with_dialog", { data, name: fileName });
      return path ? { path } : { canceled: true };
    }

    downloadBlob(blob, fileName);
    return { path: "" };
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",").pop() : result);
      });
      reader.addEventListener("error", () => reject(reader.error || new Error("无法读取截图数据")));
      reader.readAsDataURL(blob);
    });
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.addEventListener("click", (event) => event.stopPropagation());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function buildScreenshotFileName(scale, transparent) {
    const baseName = state.activeFile ? stripExtension(state.activeFile.name) : "模型工作台";
    const suffix = transparent ? `-${scale}倍-透明` : `-${scale}倍`;
    return `${sanitizeFileName(baseName)}-视图${suffix}.png`;
  }

  function sanitizeFileName(name) {
    return String(name || "模型工作台")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "模型工作台";
  }

  function setScreenshotBusy(isBusy) {
    els.screenshotPopover?.setAttribute("aria-busy", String(isBusy));
    [els.screenshotSaveButton, els.screenshotCopyButton].forEach((button) => {
      if (button) button.disabled = isBusy;
    });
  }

  return {
    toggleScreenshotPopover,
    closeScreenshotPopover,
    exportScreenshot
  };
}
