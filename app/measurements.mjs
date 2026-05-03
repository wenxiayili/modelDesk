export function createMeasurementTools(config) {
  const {
    els,
    state,
    BABYLON,
    setPanMode,
    setStatus,
    updateViewChip,
    calculateBounds,
    isPickableModelMesh,
    formatMeasureDistance,
    formatMeasureAxis,
    formatMeasureVector,
    formatCount,
    escapeHtml
  } = config;

  function toggleMeasureMode() {
    if (!state.activeContainer) {
      setStatus("请先加载模型", true);
      return;
    }
    setMeasureMode(!state.measureMode);
  }

  function setMeasureMode(enabled, options = {}) {
    state.measureMode = Boolean(enabled);
    els.viewMeasureButton?.classList.toggle("is-active", state.measureMode);
    els.viewportWrap?.classList.toggle("is-measuring", state.measureMode);

    if (state.measureMode) {
      setPanMode(false, { quiet: true });
      clearMeasurement({ keepHistory: true });
      setStatus("测量模式：点击模型上的第一个点");
    } else if (!options.quiet) {
      setStatus(state.activeFile ? `已加载 ${state.activeFile.name}` : "就绪");
    }

    updateViewChip();
  }

  function handleMeasureCanvasClick(event) {
    if (!state.measureMode || !state.scene) return;
    const rect = els.canvas.getBoundingClientRect();
    const pickInfo = state.scene.pick(event.clientX - rect.left, event.clientY - rect.top);
    handleMeasurePick(pickInfo);
  }

  function handleMeasurePick(pickInfo) {
    if (!state.measureMode) return;
    if (!pickInfo?.hit || !pickInfo.pickedPoint || !isPickableModelMesh(pickInfo.pickedMesh)) {
      setStatus("测量模式：请点击模型表面", true);
      return;
    }

    addMeasurePoint(pickInfo.pickedPoint);
  }

  function addMeasurePoint(point) {
    if (state.measurePoints.length >= 2) {
      clearMeasurement({ keepHistory: true });
    }

    const measuredPoint = point.clone();
    state.measurePoints.push(measuredPoint);
    drawMeasurePoint(measuredPoint);

    if (state.measurePoints.length === 1) {
      setStatus("测量模式：点击第二个点");
      return;
    }

    const [start, end] = state.measurePoints;
    drawMeasureLine(start, end);
    const measurement = createMeasurementRecord(start, end);
    state.measurements.unshift(measurement);
    state.measurements = state.measurements.slice(0, 8);
    updateMeasureLabel();
    renderMeasurePanel();
    setMeasureMode(false, { quiet: true });
    setStatus(`测量距离：${formatMeasureDistance(measurement.distance)}，Δ ${formatMeasureVector(measurement.delta)}`);
  }

  function drawMeasurePoint(point) {
    const diameter = getMeasurePointDiameter();
    const marker = BABYLON.MeshBuilder.CreateSphere(
      `measurePoint${state.measurePoints.length}`,
      { diameter, segments: 18 },
      state.scene
    );
    marker.position.copyFrom(point);
    marker.material = getMeasureMaterial();
    marker.isPickable = false;
    marker.metadata = { modelDeskUtility: true };
    state.measureMeshes.push(marker);
  }

  function drawMeasureLine(start, end) {
    const line = BABYLON.MeshBuilder.CreateLines("measureLine", { points: [start, end] }, state.scene);
    line.color = new BABYLON.Color3(0.24, 0.9, 0.84);
    line.isPickable = false;
    line.metadata = { modelDeskUtility: true };
    state.measureMeshes.push(line);
  }

  function getMeasureMaterial() {
    if (!state.measureMaterial || state.measureMaterial.isDisposed?.()) {
      const material = new BABYLON.StandardMaterial("measureMarkerMaterial", state.scene);
      material.diffuseColor = new BABYLON.Color3(0.12, 0.82, 0.76);
      material.emissiveColor = new BABYLON.Color3(0.08, 0.62, 0.58);
      material.specularColor = new BABYLON.Color3(0.75, 1, 0.96);
      material.disableLighting = true;
      state.measureMaterial = material;
    }
    return state.measureMaterial;
  }

  function getMeasurePointDiameter() {
    const bounds = state.modelBounds || calculateBounds();
    if (!bounds) return 0.06;
    const diagonal = bounds.max.subtract(bounds.min).length();
    return Math.max(diagonal * 0.014, 0.025);
  }

  function createMeasurementRecord(start, end) {
    const delta = end.subtract(start);
    return {
      distance: BABYLON.Vector3.Distance(start, end),
      delta: {
        x: delta.x,
        y: delta.y,
        z: delta.z
      },
      createdAt: Date.now()
    };
  }

  function renderMeasurePanel() {
    if (!els.measureSummary || !els.measureHistory) return;

    const bounds = state.modelBounds || (state.activeContainer ? calculateBounds() : null);
    const size = bounds ? bounds.max.subtract(bounds.min) : null;
    const latest = state.measurements[0];
    const boundsText = size
      ? `包围盒 ${formatMeasureAxis(size.x)} x ${formatMeasureAxis(size.y)} x ${formatMeasureAxis(size.z)}`
      : "未载入模型";

    if (els.measurePanelTitle) {
      els.measurePanelTitle.textContent = state.measurements.length
        ? `测量 (${formatCount(state.measurements.length)})`
        : "测量";
    }
    if (els.measureClearButton) {
      els.measureClearButton.disabled = state.measurements.length === 0 && state.measurePoints.length === 0;
    }

    els.measureSummary.textContent = latest
      ? `最新 ${formatMeasureDistance(latest.distance)} · ${boundsText}`
      : boundsText;

    if (!state.measurements.length) {
      els.measureHistory.innerHTML = "";
      return;
    }

    els.measureHistory.innerHTML = state.measurements
      .map((measurement, index) => `<div class="measure-row">
        <span>#${index + 1}</span>
        <strong>${escapeHtml(formatMeasureDistance(measurement.distance))}</strong>
        <small>${escapeHtml(formatMeasureVector(measurement.delta))}</small>
      </div>`)
      .join("");
  }

  function clearMeasurement(options = {}) {
    state.measureMeshes.forEach((mesh) => mesh.dispose(false, true));
    state.measureMeshes = [];
    state.measurePoints = [];
    if (!options.keepHistory) {
      state.measurements = [];
    }
    if (els.measureLabel) {
      els.measureLabel.hidden = true;
      els.measureLabel.textContent = "";
    }
    renderMeasurePanel();
  }

  function clearMeasurementHistory() {
    clearMeasurement();
    setStatus("已清空测量记录");
  }

  function updateMeasureLabel() {
    if (!els.measureLabel || state.measurePoints.length < 2 || !state.engine || !state.camera) return;

    const [start, end] = state.measurePoints;
    const midpoint = BABYLON.Vector3.Center(start, end);
    const renderWidth = state.engine.getRenderWidth();
    const renderHeight = state.engine.getRenderHeight();
    const viewport = state.camera.viewport.toGlobal(renderWidth, renderHeight);
    const projected = BABYLON.Vector3.Project(
      midpoint,
      BABYLON.Matrix.Identity(),
      state.scene.getTransformMatrix(),
      viewport
    );

    if (
      !Number.isFinite(projected.x) ||
      !Number.isFinite(projected.y) ||
      projected.z < 0 ||
      projected.z > 1
    ) {
      els.measureLabel.hidden = true;
      return;
    }

    const canvasRect = els.canvas.getBoundingClientRect();
    const x = (projected.x / renderWidth) * canvasRect.width;
    const y = (projected.y / renderHeight) * canvasRect.height;
    els.measureLabel.textContent = formatMeasureDistance(BABYLON.Vector3.Distance(start, end));
    els.measureLabel.style.left = `${x}px`;
    els.measureLabel.style.top = `${y}px`;
    els.measureLabel.hidden = false;
  }

  return {
    toggleMeasureMode,
    setMeasureMode,
    handleMeasureCanvasClick,
    renderMeasurePanel,
    clearMeasurement,
    clearMeasurementHistory,
    updateMeasureLabel
  };
}
