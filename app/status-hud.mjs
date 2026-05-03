export function createStatusHudTools(config) {
  const {
    els,
    state,
    formatCount,
    getRenderableMeshes,
    calculateBounds,
    updateActiveTreeFile
  } = config;

  function setInfo(info = {}) {
    const values = [
      info.file || "-",
      info.format || "-",
      info.loadedAt || "-",
      info.fileSize || "-",
      info.meshCount != null ? formatCount(info.meshCount) : "-",
      info.triangles != null ? formatCount(info.triangles) : "-",
      info.vertices != null ? formatCount(info.vertices) : "-",
      info.materialCount != null ? formatCount(info.materialCount) : "-",
      info.skeletonCount != null ? formatCount(info.skeletonCount) : "-",
      info.animationCount != null ? formatCount(info.animationCount) : "-",
      info.bounds || "-"
    ];
    Array.from(els.modelInfo.querySelectorAll("dd")).forEach((item, index) => {
      item.textContent = values[index];
      item.title = values[index];
    });
    if (!info.file) {
      setFooterMetrics({ triangles: 0, vertices: 0, meshes: 0, materials: 0 });
      updateActiveTreeFile("无模型");
    }
  }

  function handleProgress(event) {
    if (event?.lengthComputable && event.total > 0) {
      const percent = Math.max(4, Math.min(96, Math.round((event.loaded / event.total) * 100)));
      setProgress(percent, `加载中 ${percent}%`);
      return;
    }
    setProgress(42, "解析模型");
  }

  function setProgress(percent, label) {
    els.progressPanel.hidden = false;
    els.progressLabel.textContent = label;
    els.progressBar.style.width = `${percent}%`;
    if (els.footerProgressLabel) els.footerProgressLabel.textContent = label;
    if (els.footerProgressBar) els.footerProgressBar.style.width = `${percent}%`;
  }

  function hideProgress() {
    els.progressPanel.hidden = true;
    els.progressBar.style.width = "0%";
    if (els.footerProgressLabel) els.footerProgressLabel.textContent = "就绪";
    if (els.footerProgressBar) els.footerProgressBar.style.width = "100%";
  }

  function updateViewChip() {
    const parts = ["透视"];
    if (state.wireframe) parts.push("线框");
    if (state.autoRotate) parts.push("旋转");
    if (state.panMode) parts.push("平移");
    if (state.measureMode) parts.push("测量");
    if (state.animationPlaying) parts.push("动画");
    parts.push(els.envToggle.checked && state.environmentTexture ? "环境反射" : "默认光照");
    els.viewChip.textContent = parts.join(" / ");
    updateViewportHud();
  }

  function updateViewportHud() {
    if (els.hudCamera) {
      els.hudCamera.textContent = getCameraHudLabel();
    }
    if (els.hudZoom) {
      els.hudZoom.textContent = formatHudNumber(state.camera?.radius, 2);
    }
    if (els.hudMesh) {
      els.hudMesh.textContent = formatCount(getRenderableMeshes().length);
    }
    if (els.hudBounds) {
      const bounds = state.modelBounds || (state.activeContainer ? calculateBounds() : null);
      els.hudBounds.textContent = bounds ? formatBoundsCompact(bounds) : "-";
    }
    if (els.hudResources) {
      els.hudResources.textContent = getResourceHudLabel();
      els.hudResources.classList.toggle("is-warning", Boolean(state.resourceDiagnostics?.missing?.length || state.resourceDiagnostics?.error));
    }
  }

  function getCameraHudLabel() {
    const preset = els.cameraSelect?.value || "default";
    const labels = {
      default: "默认",
      front: "+Z",
      back: "-Z",
      right: "+X",
      left: "-X",
      top: "+Y",
      bottom: "-Y"
    };
    return labels[preset] || "自定义";
  }

  function getResourceHudLabel() {
    const diagnostics = state.resourceDiagnostics;
    if (!diagnostics) return "-";
    if (diagnostics.error) return "错误";
    if (diagnostics.missing?.length) return `缺 ${formatCount(diagnostics.missing.length)}`;
    if (diagnostics.total) return "完整";
    if (diagnostics.runtime?.textures) return `${formatCount(diagnostics.runtime.textures)} 贴图`;
    if (diagnostics.stats?.totalFiles) return "已扫描";
    return "无";
  }

  function formatBoundsCompact(bounds) {
    const size = bounds.max.subtract(bounds.min);
    return `${formatHudNumber(size.x, 1)} x ${formatHudNumber(size.y, 1)} x ${formatHudNumber(size.z, 1)}`;
  }

  function formatHudNumber(value, maximumFractionDigits = 1) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "-";
    return number.toLocaleString("zh-CN", { maximumFractionDigits });
  }

  function setStatus(message, isError = false) {
    els.statusText.textContent = message;
    els.statusText.style.color = isError ? "var(--red)" : "";
  }

  function getDrawCallCount() {
    if (Number.isFinite(state.drawCalls)) return state.drawCalls;
    return readDrawCallFrame();
  }

  function getDrawCallCounter() {
    return state.engine?._drawCalls || state.engine?.drawCallsPerfCounter || state.scene?._engine?._drawCalls || null;
  }

  function beginDrawCallFrame() {
    const counter = getDrawCallCounter();
    if (typeof counter?.fetchNewFrame === "function") {
      counter.fetchNewFrame();
    }
  }

  function readDrawCallFrame() {
    const counter = getDrawCallCounter();
    if (!counter) {
      return state.activeContainer ? getRenderableMeshes().filter((mesh) => mesh.isEnabled() && mesh.isVisible).length : 0;
    }
    const counters = [
      counter
    ];
    for (const counter of counters) {
      if (!counter) continue;
      const values = [
        counter.current,
        counter.count,
        counter._current
      ];
      const value = values.find((item) => Number.isFinite(Number(item)));
      if (value != null) return Math.max(0, Math.round(Number(value)));
    }
    return 0;
  }

  function setFooterMetrics(metrics) {
    if (els.metricTriangles) els.metricTriangles.textContent = formatCount(metrics.triangles);
    if (els.metricVertices) els.metricVertices.textContent = formatCount(metrics.vertices);
    if (els.metricMeshes) els.metricMeshes.textContent = formatCount(metrics.meshes);
    if (els.metricMaterials) els.metricMaterials.textContent = formatCount(metrics.materials);
    if (els.metricDrawCalls && !state.activeContainer) {
      state.drawCalls = 0;
      els.metricDrawCalls.textContent = "0";
    }
  }

  return {
    setInfo,
    handleProgress,
    setProgress,
    hideProgress,
    updateViewChip,
    updateViewportHud,
    setStatus,
    getDrawCallCount,
    beginDrawCallFrame,
    readDrawCallFrame,
    setFooterMetrics
  };
}
