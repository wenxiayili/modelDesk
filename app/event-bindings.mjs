export function createEventBindings(config) {
  const {
    els,
    state,
    openModelFolder,
    renderFileTree,
    loadFileList,
    handleFileTreeClick,
    handlePanPointerDown,
    handlePanPointerMove,
    handlePanPointerUp,
    handleMeasureCanvasClick,
    renderMeshes,
    getRenderableMeshes,
    handleMeshListClick,
    handleMaterialListClick,
    handleMaterialEditorInput,
    handleMaterialEditorChange,
    showAllMaterials,
    exportResourceHealthReport,
    handleRecentClick,
    clearRecent,
    selectAnimation,
    toggleAnimationPlayback,
    stopActiveAnimation,
    handleAnimationListClick,
    bindRangeNumberPair,
    applyAnimationSpeed,
    fitCamera,
    resetCamera,
    toggleWireframe,
    toggleAutoRotate,
    toggleScreenshotPopover,
    togglePanMode,
    toggleMeasureMode,
    clearMeasurementHistory,
    closeScreenshotPopover,
    exportScreenshot,
    toggleViewportFullscreen,
    setCameraPreset,
    updateViewChip,
    bindUtilityControls,
    bindExposureControl,
    bindLightControl,
    bindEnvironmentControls,
    bindCollapsiblePanels
  } = config;

  function bindUi() {
    els.openFileButton?.addEventListener("click", () => els.fileInput.click());
    els.openFolderButton?.addEventListener("click", () => els.folderInput.click());
    els.dropZone?.addEventListener("click", () => els.fileInput.click());
    els.fileTreeAddButton?.addEventListener("click", openModelFolder);
    els.fileTreeRefreshButton?.addEventListener("click", () => renderFileTree());

    els.fileInput.addEventListener("change", (event) => loadFileList(event.target.files));
    els.folderInput.addEventListener("change", (event) => loadFileList(event.target.files));
    els.fileSearchInput?.addEventListener("input", () => renderFileTree());
    els.fileTree?.addEventListener("click", handleFileTreeClick);
    els.canvas.addEventListener("pointerdown", handlePanPointerDown);
    els.canvas.addEventListener("pointermove", handlePanPointerMove);
    els.canvas.addEventListener("pointerup", handlePanPointerUp);
    els.canvas.addEventListener("pointercancel", handlePanPointerUp);
    els.canvas.addEventListener("lostpointercapture", handlePanPointerUp);
    els.canvas.addEventListener("click", handleMeasureCanvasClick);
    els.sceneSearchInput?.addEventListener("input", () => renderMeshes(getRenderableMeshes()));
    els.meshList.addEventListener("click", handleMeshListClick);
    els.materialList.addEventListener("click", handleMaterialListClick);
    els.materialList.addEventListener("input", handleMaterialEditorInput);
    els.materialList.addEventListener("change", handleMaterialEditorChange);
    els.materialShowAllButton?.addEventListener("click", showAllMaterials);
    els.resourceReportButton?.addEventListener("click", exportResourceHealthReport);
    els.recentList?.addEventListener("click", handleRecentClick);
    els.recentClearButton?.addEventListener("click", clearRecent);
    els.animationSelect?.addEventListener("change", () => selectAnimation(Number(els.animationSelect.value)));
    els.animationPlayButton?.addEventListener("click", toggleAnimationPlayback);
    els.animationStopButton?.addEventListener("click", stopActiveAnimation);
    els.animationList?.addEventListener("click", handleAnimationListClick);
    bindAnimationSpeedControl();

    ["dragenter", "dragover"].forEach((eventName) => {
      window.addEventListener(eventName, (event) => {
        event.preventDefault();
        els.dropZone?.classList.add("is-over");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      window.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (eventName === "drop" && event.dataTransfer?.files?.length) {
          loadFileList(event.dataTransfer.files);
        }
        els.dropZone?.classList.remove("is-over");
      });
    });

    els.fitButton.addEventListener("click", () => fitCamera());
    els.resetButton.addEventListener("click", () => resetCamera());
    els.wireButton?.addEventListener("click", toggleWireframe);
    els.autoRotateButton?.addEventListener("click", toggleAutoRotate);
    els.shotButton?.addEventListener("click", toggleScreenshotPopover);
    els.viewFitButton?.addEventListener("click", () => fitCamera());
    els.viewResetButton?.addEventListener("click", () => resetCamera());
    els.viewWireButton?.addEventListener("click", toggleWireframe);
    els.viewRotateButton?.addEventListener("click", toggleAutoRotate);
    els.viewPanButton?.addEventListener("click", togglePanMode);
    els.viewMeasureButton?.addEventListener("click", toggleMeasureMode);
    els.measureClearButton?.addEventListener("click", clearMeasurementHistory);
    els.viewShotButton?.addEventListener("click", toggleScreenshotPopover);
    els.screenshotPopover?.addEventListener("click", (event) => event.stopPropagation());
    els.screenshotCloseButton?.addEventListener("click", closeScreenshotPopover);
    els.screenshotSaveButton?.addEventListener("click", () => exportScreenshot("save"));
    els.screenshotCopyButton?.addEventListener("click", () => exportScreenshot("copy"));
    document.addEventListener("click", (event) => {
      if (
        !event.target.closest(".screenshot-popover") &&
        !event.target.closest("#shotButton") &&
        !event.target.closest("#viewShotButton")
      ) {
        closeScreenshotPopover();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeScreenshotPopover();
    });
    els.viewFullscreenButton?.addEventListener("click", toggleViewportFullscreen);
    els.cameraSelect?.addEventListener("change", () => setCameraPreset(els.cameraSelect.value));
    document.querySelectorAll("[data-view-preset]").forEach((button) => {
      button.addEventListener("click", () => setCameraPreset(button.dataset.viewPreset));
    });

    els.gridToggle.addEventListener("change", () => state.gridRoot.setEnabled(els.gridToggle.checked));
    els.axisToggle.addEventListener("change", () => state.axisRoot.setEnabled(els.axisToggle.checked));
    els.envToggle.addEventListener("change", () => {
      state.scene.environmentTexture = els.envToggle.checked ? state.environmentTexture : null;
      updateViewChip();
    });
    bindUtilityControls();

    bindExposureControl();
    bindLightControl({
      toggle: els.keyLightToggle,
      color: els.keyLightColor,
      range: els.keyRange,
      value: els.keyLightValue,
      light: state.keyLight
    });
    bindLightControl({
      toggle: els.ambientLightToggle,
      color: els.ambientLightColor,
      range: els.ambientRange,
      value: els.ambientLightValue,
      light: state.hemiLight
    });
    bindLightControl({
      toggle: els.pointLightToggle,
      color: els.pointLightColor,
      range: els.pointRange,
      value: els.pointLightValue,
      light: state.pointLight
    });
    bindEnvironmentControls();
    bindCollapsiblePanels();
  }

  function bindAnimationSpeedControl() {
    bindRangeNumberPair(els.animationSpeedRange, els.animationSpeedValue, applyAnimationSpeed);
  }

  return {
    bindUi
  };
}
