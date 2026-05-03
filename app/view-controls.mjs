export function createViewControls(config) {
  const {
    els,
    state,
    BABYLON,
    calculateBounds,
    getActiveMaterials,
    setMeasureMode,
    renderMeasurePanel,
    updateMeasureLabel,
    updateViewChip,
    setStatus
  } = config;

  function fitCamera() {
    const bounds = calculateBounds();
    if (!bounds) {
      resetCamera();
      return;
    }

    state.modelBounds = bounds;
    const size = bounds.max.subtract(bounds.min);
    const center = BABYLON.Vector3.Center(bounds.min, bounds.max);
    const radius = Math.max(size.length() * 0.72, 0.8);
    const floorY = Number.isFinite(bounds.min.y) ? bounds.min.y : 0;

    state.camera.setTarget(center);
    state.camera.radius = radius * 2.35;
    state.camera.lowerRadiusLimit = Math.max(radius * 0.04, 0.02);
    state.camera.upperRadiusLimit = Math.max(radius * 20, 20);
    state.camera.alpha = Math.PI * 0.72;
    state.camera.beta = Math.PI * 0.34;
    updateCameraPresetUi("default");

    state.gridRoot.position.y = floorY;
    state.axisRoot.position = new BABYLON.Vector3(bounds.min.x, floorY + radius * 0.02, bounds.min.z);
    state.axisRoot.scaling.setAll(Math.max(radius * 0.16, 0.35));
    renderMeasurePanel();
  }

  function resetCamera() {
    state.camera.alpha = Math.PI * 0.72;
    state.camera.beta = Math.PI * 0.34;
    if (state.modelBounds) {
      fitCamera();
      return;
    }
    state.camera.radius = 9;
    state.camera.setTarget(BABYLON.Vector3.Zero());
    state.gridRoot.position.y = 0;
    state.axisRoot.position = BABYLON.Vector3.Zero();
    state.axisRoot.scaling.setAll(1);
    updateCameraPresetUi("default");
    renderMeasurePanel();
  }

  function setCameraPreset(preset) {
    const bounds = state.modelBounds || calculateBounds();
    const target = bounds ? BABYLON.Vector3.Center(bounds.min, bounds.max) : BABYLON.Vector3.Zero();
    const radius = bounds ? Math.max(bounds.max.subtract(bounds.min).length() * 1.65, 2) : state.camera.radius || 9;

    state.camera.setTarget(target);
    state.camera.radius = radius;

    const viewAngles = {
      front: [-Math.PI / 2, Math.PI / 2.2],
      back: [Math.PI / 2, Math.PI / 2.2],
      right: [0, Math.PI / 2.2],
      left: [Math.PI, Math.PI / 2.2],
      top: [-Math.PI / 2, 0.04],
      bottom: [-Math.PI / 2, Math.PI - 0.04]
    };

    if (viewAngles[preset]) {
      const [alpha, beta] = viewAngles[preset];
      state.camera.alpha = alpha;
      state.camera.beta = beta;
    } else {
      fitCamera();
      preset = "default";
    }

    updateCameraPresetUi(preset);
  }

  function updateCameraPresetUi(preset) {
    if (els.cameraSelect) {
      els.cameraSelect.value = preset;
    }
    document.querySelectorAll("[data-view-preset]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.viewPreset === preset);
    });
  }

  function toggleWireframe() {
    if (!state.activeContainer) return;
    state.wireframe = !state.wireframe;
    const materials = getActiveMaterials();
    materials.forEach((material) => {
      if ("wireframe" in material) material.wireframe = state.wireframe;
    });
    els.wireButton.classList.toggle("is-active", state.wireframe);
    els.viewWireButton?.classList.toggle("is-active", state.wireframe);
    updateViewChip();
  }

  function toggleAutoRotate() {
    state.autoRotate = !state.autoRotate;
    els.autoRotateButton?.classList.toggle("is-active", state.autoRotate);
    els.viewRotateButton?.classList.toggle("is-active", state.autoRotate);
    updateViewChip();
  }

  function togglePanMode() {
    setPanMode(!state.panMode);
  }

  function setPanMode(enabled, options = {}) {
    const nextMode = Boolean(enabled);
    if (state.panMode === nextMode) return;

    state.panMode = nextMode;
    state.isPanning = false;
    state.panStart = null;
    els.viewPanButton?.classList.toggle("is-active", state.panMode);
    els.viewportWrap?.classList.toggle("is-panning", state.panMode);
    els.viewportWrap?.classList.remove("is-pan-dragging");

    if (state.panMode) {
      setMeasureMode(false, { quiet: true });
      suspendCameraPointerInput();
      setStatus("平移模式：按住左键拖动视图");
    } else {
      restoreCameraPointerInput();
      if (!options.quiet) {
        setStatus(state.activeFile ? `已加载 ${state.activeFile.name}` : "就绪");
      }
    }

    updateViewChip();
  }

  function suspendCameraPointerInput() {
    const pointerInput = state.camera.inputs.attached.pointers;
    if (!pointerInput) return;
    state.pointerInput = pointerInput;
    state.camera.inputs.remove(pointerInput);
  }

  function restoreCameraPointerInput() {
    if (state.camera.inputs.attached.pointers) return;
    if (state.pointerInput) {
      state.camera.inputs.add(state.pointerInput);
    } else {
      state.camera.inputs.addPointers();
    }
    state.camera.attachControl(els.canvas, true);
  }

  function handlePanPointerDown(event) {
    if (!state.panMode || event.button !== 0 || !state.camera) return;
    event.preventDefault();
    els.canvas.setPointerCapture?.(event.pointerId);
    state.isPanning = true;
    state.panStart = {
      x: event.clientX,
      y: event.clientY,
      target: state.camera.target.clone()
    };
    els.viewportWrap?.classList.add("is-pan-dragging");
  }

  function handlePanPointerMove(event) {
    if (!state.panMode || !state.isPanning || !state.panStart || !state.camera) return;
    event.preventDefault();

    const rect = els.canvas.getBoundingClientRect();
    const dx = event.clientX - state.panStart.x;
    const dy = event.clientY - state.panStart.y;
    const scale = (state.camera.radius || 1) * 1.8 / Math.max(Math.min(rect.width, rect.height), 1);
    const right = state.camera.getDirection(BABYLON.Axis.X);
    const up = state.camera.getDirection(BABYLON.Axis.Y);
    const target = state.panStart.target
      .add(right.scale(-dx * scale))
      .add(up.scale(dy * scale));

    state.camera.target.copyFrom(target);
    updateMeasureLabel();
  }

  function handlePanPointerUp(event) {
    if (!state.isPanning) return;
    event.preventDefault?.();
    if (event.pointerId != null && els.canvas.hasPointerCapture?.(event.pointerId)) {
      els.canvas.releasePointerCapture(event.pointerId);
    }
    state.isPanning = false;
    state.panStart = null;
    els.viewportWrap?.classList.remove("is-pan-dragging");
  }

  async function toggleViewportFullscreen() {
    const target = document.fullscreenElement ? document : document.querySelector(".viewport-wrap");
    try {
      if (document.fullscreenElement) {
        await target.exitFullscreen();
      } else {
        await target.requestFullscreen();
      }
      window.setTimeout(() => state.engine.resize(), 120);
    } catch (error) {
      setStatus("当前环境不支持全屏切换", true);
    }
  }

  return {
    fitCamera,
    resetCamera,
    setCameraPreset,
    toggleWireframe,
    toggleAutoRotate,
    togglePanMode,
    setPanMode,
    handlePanPointerDown,
    handlePanPointerMove,
    handlePanPointerUp,
    toggleViewportFullscreen
  };
}
