(async () => {
  const els = {
    canvas: document.getElementById("renderCanvas"),
    viewportWrap: document.querySelector(".viewport-wrap"),
    fileInput: document.getElementById("fileInput"),
    folderInput: document.getElementById("folderInput"),
    openFileButton: document.getElementById("openFileButton"),
    openFolderButton: document.getElementById("openFolderButton"),
    dropZone: document.getElementById("dropZone"),
    emptyOverlay: document.getElementById("emptyOverlay"),
    progressPanel: document.getElementById("progressPanel"),
    progressLabel: document.getElementById("progressLabel"),
    progressBar: document.getElementById("progressBar"),
    statusText: document.getElementById("statusText"),
    engineStatus: document.getElementById("engineStatus"),
    sceneSearchInput: document.getElementById("sceneSearchInput"),
    scenePanelTitle: document.getElementById("scenePanelTitle"),
    fileSearchInput: document.getElementById("fileSearchInput"),
    fileTree: document.getElementById("fileTree"),
    fileTreeAddButton: document.getElementById("fileTreeAddButton"),
    fileTreeRefreshButton: document.getElementById("fileTreeRefreshButton"),
    projectSummary: document.getElementById("projectSummary"),
    meshList: document.getElementById("meshList"),
    materialList: document.getElementById("materialList"),
    materialPanelTitle: document.getElementById("materialPanelTitle"),
    materialShowAllButton: document.getElementById("materialShowAllButton"),
    recentList: document.getElementById("recentList"),
    recentClearButton: document.getElementById("recentClearButton"),
    modelInfo: document.getElementById("modelInfo"),
    modelBadge: document.getElementById("modelBadge"),
    resourcePanelTitle: document.getElementById("resourcePanelTitle"),
    resourceDiagnostics: document.getElementById("resourceDiagnostics"),
    resourceSummary: document.getElementById("resourceSummary"),
    resourceList: document.getElementById("resourceList"),
    resourceReportButton: document.getElementById("resourceReportButton"),
    hudCamera: document.getElementById("hudCamera"),
    hudZoom: document.getElementById("hudZoom"),
    hudMesh: document.getElementById("hudMesh"),
    hudBounds: document.getElementById("hudBounds"),
    hudResources: document.getElementById("hudResources"),
    viewChip: document.getElementById("viewChip"),
    animationSelect: document.getElementById("animationSelect"),
    animationPanelTitle: document.getElementById("animationPanelTitle"),
    animationPlayButton: document.getElementById("animationPlayButton"),
    animationStopButton: document.getElementById("animationStopButton"),
    animationSpeedRange: document.getElementById("animationSpeedRange"),
    animationSpeedValue: document.getElementById("animationSpeedValue"),
    animationList: document.getElementById("animationList"),
    fitButton: document.getElementById("fitButton"),
    resetButton: document.getElementById("resetButton"),
    wireButton: document.getElementById("wireButton"),
    autoRotateButton: document.getElementById("autoRotateButton"),
    shotButton: document.getElementById("shotButton"),
    gridToggle: document.getElementById("gridToggle"),
    axisToggle: document.getElementById("axisToggle"),
    envToggle: document.getElementById("envToggle"),
    exposureRange: document.getElementById("exposureRange"),
    exposureValue: document.getElementById("exposureValue"),
    ambientLightToggle: document.getElementById("ambientLightToggle"),
    ambientLightColor: document.getElementById("ambientLightColor"),
    ambientRange: document.getElementById("ambientRange"),
    ambientLightValue: document.getElementById("ambientLightValue"),
    keyLightToggle: document.getElementById("keyLightToggle"),
    keyLightColor: document.getElementById("keyLightColor"),
    keyRange: document.getElementById("keyRange"),
    keyLightValue: document.getElementById("keyLightValue"),
    pointLightToggle: document.getElementById("pointLightToggle"),
    pointLightColor: document.getElementById("pointLightColor"),
    pointRange: document.getElementById("pointRange"),
    pointLightValue: document.getElementById("pointLightValue"),
    cameraSelect: document.getElementById("cameraSelect"),
    themeButton: document.getElementById("themeButton"),
    settingsButton: document.getElementById("settingsButton"),
    helpButton: document.getElementById("helpButton"),
    settingsPopover: document.getElementById("settingsPopover"),
    helpPopover: document.getElementById("helpPopover"),
    quickGridToggle: document.getElementById("quickGridToggle"),
    quickAxisToggle: document.getElementById("quickAxisToggle"),
    quickEnvToggle: document.getElementById("quickEnvToggle"),
    envPresetSelect: document.getElementById("envPresetSelect"),
    hdriButton: document.getElementById("hdriButton"),
    hdriInput: document.getElementById("hdriInput"),
    hdriName: document.getElementById("hdriName"),
    environmentName: document.getElementById("environmentName"),
    environmentFile: document.getElementById("environmentFile"),
    envRotationRange: document.getElementById("envRotationRange"),
    envRotationValue: document.getElementById("envRotationValue"),
    viewFitButton: document.getElementById("viewFitButton"),
    viewResetButton: document.getElementById("viewResetButton"),
    viewWireButton: document.getElementById("viewWireButton"),
    viewRotateButton: document.getElementById("viewRotateButton"),
    viewPanButton: document.getElementById("viewPanButton"),
    viewMeasureButton: document.getElementById("viewMeasureButton"),
    viewShotButton: document.getElementById("viewShotButton"),
    screenshotPopover: document.getElementById("screenshotPopover"),
    screenshotCloseButton: document.getElementById("screenshotCloseButton"),
    screenshotScaleSelect: document.getElementById("screenshotScaleSelect"),
    screenshotTransparentToggle: document.getElementById("screenshotTransparentToggle"),
    screenshotCopyButton: document.getElementById("screenshotCopyButton"),
    screenshotSaveButton: document.getElementById("screenshotSaveButton"),
    viewFullscreenButton: document.getElementById("viewFullscreenButton"),
    measureLabel: document.getElementById("measureLabel"),
    measurePanelTitle: document.getElementById("measurePanelTitle"),
    measureClearButton: document.getElementById("measureClearButton"),
    measureSummary: document.getElementById("measureSummary"),
    measureHistory: document.getElementById("measureHistory"),
    activeTreeFile: document.getElementById("activeTreeFile"),
    footerProgressLabel: document.getElementById("footerProgressLabel"),
    footerProgressBar: document.getElementById("footerProgressBar"),
    metricTriangles: document.getElementById("metricTriangles"),
    metricVertices: document.getElementById("metricVertices"),
    metricMeshes: document.getElementById("metricMeshes"),
    metricMaterials: document.getElementById("metricMaterials"),
    metricDrawCalls: document.getElementById("metricDrawCalls"),
    metricFps: document.getElementById("metricFps")
  };

  const {
    SUPPORTED_MODELS: supportedModels,
    MODEL_PRIORITY: modelPriority,
    TEXTURE_EXTENSIONS: textureExtensions,
    MATERIAL_EXTENSIONS: materialExtensions,
    BUFFER_EXTENSIONS: bufferExtensions,
    ENVIRONMENT_EXTENSIONS: environmentExtensions,
    RECENT_KEY: recentKey,
    THEME_KEY: themeKey,
    PANEL_STATE_KEY: panelStateKey
  } = await import("./app/constants.mjs");
  const {
    getExtension,
    stripExtension,
    formatCount,
    formatNumber,
    describeModelFormat,
    formatLoadedTime,
    formatMeasureDistance,
    formatMeasureAxis,
    formatMeasureVector,
    formatBytes,
    formatError,
    escapeHtml,
    shortName
  } = await import("./app/utils.mjs");
  let fbxLoaderPromise = null;

  const state = {
    engine: null,
    scene: null,
    camera: null,
    hemiLight: null,
    keyLight: null,
    pointLight: null,
    gridRoot: null,
    axisRoot: null,
    environmentTexture: null,
    environmentObjectUrl: null,
    environmentLabel: "工作室",
    environmentFileName: "内置环境",
    activeContainer: null,
    activeFile: null,
    activeFileKey: "",
    activeFiles: [],
    projectProfile: null,
    resourceDiagnostics: null,
    collapsedFileFolders: new Set(),
    animationItems: [],
    activeAnimationIndex: -1,
    animationPlaying: false,
    animationSpeed: 1,
    drawCalls: 0,
    modelBounds: null,
    wireframe: false,
    autoRotate: false,
    panMode: false,
    isPanning: false,
    panStart: null,
    pointerInput: null,
    measureMode: false,
    measurePoints: [],
    measureMeshes: [],
    measureMaterial: null,
    measurements: [],
    materialVisibility: new Map(),
    materialDefaults: new Map(),
    activeMaterialId: null,
    highlightedMaterialMeshes: [],
    meshVisibility: new Map(),
    activeMeshId: null,
    highlightedSceneMeshes: []
  };

  const { createFileTools } = await import("./app/files.mjs");
  const fileTools = createFileTools({
    els,
    state,
    BABYLON: window.BABYLON,
    supportedModels,
    modelPriority,
    textureExtensions,
    materialExtensions,
    bufferExtensions,
    environmentExtensions,
    recentKey,
    getExtension,
    stripExtension,
    formatCount,
    formatBytes,
    escapeHtml,
    loadFileList,
    loadModelPackage,
    fitCamera,
    setStatus
  });
  const {
    buildProjectProfile,
    renderProjectSummary,
    renderFileTree,
    handleFileTreeClick,
    isModelFile,
    getFileDisplayPath,
    getFileKey,
    pickMainModel,
    registerLocalFiles,
    renderRecent,
    rememberRecent,
    handleRecentClick,
    clearRecent,
    updateActiveTreeFile
  } = fileTools;

  const { createResourceTools } = await import("./app/resources.mjs");
  const resourceTools = createResourceTools({
    els,
    textureExtensions,
    materialExtensions,
    bufferExtensions,
    environmentExtensions,
    buildProjectProfile,
    getExtension,
    getFileDisplayPath,
    shortName,
    formatCount,
    formatBytes,
    escapeHtml,
    updateViewportHud
  });
  const {
    analyzeModelResources,
    buildPackageOnlyDiagnostics,
    augmentResourceDiagnosticsWithRuntime,
    renderResourceDiagnostics,
    buildResourceHealthReport,
    getReferencedResourcePaths,
    normalizeResourcePath
  } = resourceTools;
  fileTools.setResourceTools({
    getReferencedResourcePaths,
    normalizeResourcePath
  });

  const { createUiControls } = await import("./app/ui-controls.mjs");
  const {
    bindCollapsiblePanels,
    bindUtilityControls,
    applyStoredTheme,
    closeUtilityPopovers
  } = createUiControls({
    els,
    panelStateKey,
    themeKey,
    setStatus
  });

  if (!window.BABYLON) {
    setStatus("Babylon.js 未加载，请检查网络或改成本地依赖。", true);
    els.engineStatus.textContent = "引擎未就绪";
    return;
  }

  const { createScreenshotTools } = await import("./app/screenshot.mjs");
  const {
    toggleScreenshotPopover,
    closeScreenshotPopover,
    exportScreenshot
  } = createScreenshotTools({
    els,
    state,
    BABYLON: window.BABYLON,
    closeUtilityPopovers,
    setStatus,
    stripExtension
  });

  const { createMeasurementTools } = await import("./app/measurements.mjs");
  const {
    toggleMeasureMode,
    setMeasureMode,
    handleMeasureCanvasClick,
    renderMeasurePanel,
    clearMeasurement,
    clearMeasurementHistory,
    updateMeasureLabel
  } = createMeasurementTools({
    els,
    state,
    BABYLON: window.BABYLON,
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
  });

  const { createMaterialTools } = await import("./app/materials.mjs");
  const {
    renderMaterials,
    captureMaterialDefaults,
    handleMaterialListClick,
    handleMaterialEditorInput,
    handleMaterialEditorChange,
    showAllMaterials,
    applyVisibilityState,
    clearMaterialHighlight,
    getActiveMaterials,
    getMeshMaterials
  } = createMaterialTools({
    els,
    state,
    BABYLON: window.BABYLON,
    formatCount,
    escapeHtml,
    shortName,
    hexToColor3,
    getRenderableMeshes,
    calculateMeshBounds,
    renderMeshes,
    clearSceneHighlight,
    setStatus
  });

  const { createAnimationTools } = await import("./app/animations.mjs");
  const {
    setupAnimations,
    resetAnimations,
    selectAnimation,
    handleAnimationListClick,
    toggleAnimationPlayback,
    stopActiveAnimation,
    applyAnimationSpeed,
    renderAnimations
  } = createAnimationTools({
    els,
    state,
    readControlNumber,
    formatCount,
    escapeHtml,
    setStatus,
    updateViewChip
  });

  initScene();
  applyStoredTheme();
  bindUi();
  bindRuntimeOpenEvents();
  setInfo();
  setStatus("就绪");
  loadLaunchModelPackage();

  function initScene() {
    state.engine = new BABYLON.Engine(els.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      alpha: true,
      adaptToDeviceRatio: true
    });

    state.scene = new BABYLON.Scene(state.engine);
    state.scene.clearColor = new BABYLON.Color4(0.065, 0.085, 0.11, 1);
    state.scene.imageProcessingConfiguration.exposure = 1;
    state.scene.imageProcessingConfiguration.contrast = 1.12;

    state.camera = new BABYLON.ArcRotateCamera(
      "mainCamera",
      Math.PI * 0.72,
      Math.PI * 0.34,
      9,
      BABYLON.Vector3.Zero(),
      state.scene
    );
    state.camera.attachControl(els.canvas, true);
    state.camera.minZ = 0.01;
    state.camera.maxZ = 100000;
    state.camera.lowerRadiusLimit = 0.05;
    state.camera.upperRadiusLimit = 50000;
    state.camera.panningSensibility = 58;
    state.camera.wheelPrecision = 42;
    state.camera.inertia = 0.72;
    state.camera.useAutoRotationBehavior = false;

    state.hemiLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0.2, 1, 0.35), state.scene);
    state.hemiLight.groundColor = new BABYLON.Color3(0.16, 0.19, 0.23);

    state.keyLight = new BABYLON.DirectionalLight("keyLight", new BABYLON.Vector3(-0.45, -0.9, -0.35), state.scene);
    state.keyLight.position = new BABYLON.Vector3(16, 24, 18);

    state.pointLight = new BABYLON.PointLight("pointLight", state.camera.position.clone(), state.scene);
    applyLightingControls();

    state.gridRoot = createGrid(state.scene, 20, 1);
    state.axisRoot = createAxis(state.scene, 2.2);

    loadStudioEnvironment();

    state.engine.runRenderLoop(() => {
      if (state.autoRotate && state.activeContainer) {
        state.camera.alpha += 0.0028;
      }
      if (state.pointLight && els.pointLightToggle?.checked) {
        state.pointLight.position.copyFrom(state.camera.position);
      }
      beginDrawCallFrame();
      state.scene.render();
      state.drawCalls = readDrawCallFrame();
      updateMeasureLabel();
    });

    window.addEventListener("resize", () => state.engine.resize());
    els.engineStatus.textContent = `渲染引擎 ${BABYLON.Engine.Version || "就绪"}`;
    window.setInterval(() => {
      if (els.metricFps) {
        els.metricFps.textContent = Math.round(state.engine.getFps()).toString();
      }
      if (els.metricDrawCalls) {
        els.metricDrawCalls.textContent = formatCount(getDrawCallCount());
      }
      updateViewportHud();
    }, 650);
  }

  function createGrid(scene, size, step) {
    const root = new BABYLON.TransformNode("utilityGridRoot", scene);
    const minorLines = [];
    for (let i = -size; i <= size; i += step) {
      if (i === 0) continue;
      minorLines.push([new BABYLON.Vector3(-size, 0, i), new BABYLON.Vector3(size, 0, i)]);
      minorLines.push([new BABYLON.Vector3(i, 0, -size), new BABYLON.Vector3(i, 0, size)]);
    }

    const grid = BABYLON.MeshBuilder.CreateLineSystem("utilityGrid", { lines: minorLines }, scene);
    grid.color = new BABYLON.Color3(0.28, 0.34, 0.41);
    grid.alpha = 0.46;
    grid.isPickable = false;
    grid.metadata = { modelDeskUtility: true };
    grid.parent = root;

    const xAxis = BABYLON.MeshBuilder.CreateLines(
      "gridXAxis",
      { points: [new BABYLON.Vector3(-size, 0, 0), new BABYLON.Vector3(size, 0, 0)] },
      scene
    );
    xAxis.color = new BABYLON.Color3(0.76, 0.28, 0.32);
    xAxis.isPickable = false;
    xAxis.metadata = { modelDeskUtility: true };
    xAxis.parent = root;

    const zAxis = BABYLON.MeshBuilder.CreateLines(
      "gridZAxis",
      { points: [new BABYLON.Vector3(0, 0, -size), new BABYLON.Vector3(0, 0, size)] },
      scene
    );
    zAxis.color = new BABYLON.Color3(0.24, 0.62, 0.46);
    zAxis.isPickable = false;
    zAxis.metadata = { modelDeskUtility: true };
    zAxis.parent = root;

    return root;
  }

  function createAxis(scene, length) {
    const root = new BABYLON.TransformNode("axisRoot", scene);
    const axisData = [
      ["axisX", new BABYLON.Vector3(0, 0.02, 0), new BABYLON.Vector3(length, 0.02, 0), new BABYLON.Color3(0.95, 0.25, 0.28)],
      ["axisY", new BABYLON.Vector3(0, 0.02, 0), new BABYLON.Vector3(0, length, 0), new BABYLON.Color3(0.28, 0.72, 0.36)],
      ["axisZ", new BABYLON.Vector3(0, 0.02, 0), new BABYLON.Vector3(0, 0.02, length), new BABYLON.Color3(0.28, 0.48, 0.96)]
    ];
    axisData.forEach(([name, start, end, color]) => {
      const line = BABYLON.MeshBuilder.CreateLines(name, { points: [start, end] }, scene);
      line.color = color;
      line.isPickable = false;
      line.metadata = { modelDeskUtility: true };
      line.parent = root;
    });
    return root;
  }

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

  function bindExposureControl() {
    bindRangeNumberPair(els.exposureRange, els.exposureValue, () => {
      if (state.scene) {
        state.scene.imageProcessingConfiguration.exposure = readControlNumber(els.exposureRange, 1);
      }
    });
  }

  function bindLightControl(config) {
    bindRangeNumberPair(config.range, config.value, () => applyLightControl(config));
    config.toggle?.addEventListener("change", () => applyLightControl(config));
    config.color?.addEventListener("input", () => applyLightControl(config));
    applyLightControl(config);
  }

  function bindAnimationSpeedControl() {
    bindRangeNumberPair(els.animationSpeedRange, els.animationSpeedValue, applyAnimationSpeed);
  }

  function bindEnvironmentControls() {
    bindRangeNumberPair(els.envRotationRange, els.envRotationValue, applyEnvironmentRotation);
    els.envPresetSelect?.addEventListener("change", () => {
      if (els.envPresetSelect.value === "studio") {
        loadStudioEnvironment();
      } else if (els.envPresetSelect.value === "none") {
        setEnvironmentTexture(null, "无", "无环境");
      } else if (!state.environmentTexture) {
        els.hdriInput?.click();
      }
    });
    els.hdriButton?.addEventListener("click", () => els.hdriInput?.click());
    els.hdriInput?.addEventListener("change", () => {
      const file = els.hdriInput.files?.[0];
      if (file) loadCustomEnvironment(file);
      els.hdriInput.value = "";
    });
    updateEnvironmentUi();
  }

  function loadStudioEnvironment() {
    try {
      const texture = BABYLON.CubeTexture.CreateFromPrefilteredData(
        "./vendor/babylon/studio.env",
        state.scene
      );
      setEnvironmentTexture(texture, "工作室", "内置环境");
    } catch (error) {
      setEnvironmentTexture(null, "无", "内置环境不可用");
    }
  }

  function loadCustomEnvironment(file) {
    const extension = getExtension(file.name);
    const localName = `environment-${Date.now()}-${file.name}`;
    let texture = null;

    try {
      registerEnvironmentFile(file, localName);
      if (extension === ".env") {
        texture = BABYLON.CubeTexture.CreateFromPrefilteredData(`file:${localName}`, state.scene);
      } else if (extension === ".hdr" && BABYLON.HDRCubeTexture) {
        texture = new BABYLON.HDRCubeTexture(`file:${localName}`, state.scene, 256, false, true, false, true);
      } else {
        setStatus("仅支持 .env 或 .hdr 环境文件", true);
        return;
      }
    } catch (error) {
      setStatus(`环境文件加载失败：${error?.message || error}`, true);
      return;
    }

    releaseEnvironmentObjectUrl();
    setEnvironmentTexture(texture, "自定义", file.name);
    if (els.envPresetSelect) els.envPresetSelect.value = "custom";
    setStatus(`已加载环境：${file.name}`);
  }

  function registerEnvironmentFile(file, localName) {
    if (!BABYLON.FilesInputStore?.FilesToLoad) return;
    file.correctName = localName;
    BABYLON.FilesInputStore.FilesToLoad[localName] = file;
    BABYLON.FilesInputStore.FilesToLoad[localName.toLowerCase()] = file;
    BABYLON.FilesInputStore.FilesToLoad[file.name] = file;
    BABYLON.FilesInputStore.FilesToLoad[file.name.toLowerCase()] = file;
  }

  function setEnvironmentTexture(texture, label, fileName) {
    if (state.environmentTexture && state.environmentTexture !== texture) {
      state.environmentTexture.dispose?.();
    }
    if (!texture || label !== "自定义") releaseEnvironmentObjectUrl();

    state.environmentTexture = texture;
    state.environmentLabel = label;
    state.environmentFileName = fileName;
    applyEnvironmentRotation();
    state.scene.environmentTexture = els.envToggle?.checked ? texture : null;
    updateEnvironmentUi();
    updateViewChip();
  }

  function releaseEnvironmentObjectUrl() {
    if (state.environmentObjectUrl) {
      URL.revokeObjectURL(state.environmentObjectUrl);
      state.environmentObjectUrl = null;
    }
  }

  function applyEnvironmentRotation() {
    const degrees = readControlNumber(els.envRotationRange, 0);
    if (state.environmentTexture && "rotationY" in state.environmentTexture) {
      state.environmentTexture.rotationY = BABYLON.Tools.ToRadians(degrees);
    }
  }

  function updateEnvironmentUi() {
    if (els.environmentName) els.environmentName.textContent = state.environmentLabel;
    if (els.environmentFile) els.environmentFile.textContent = state.environmentFileName;
    if (els.hdriName) els.hdriName.textContent = state.environmentFileName;
    if (els.envPresetSelect && state.environmentLabel !== "自定义") {
      els.envPresetSelect.value = state.environmentTexture ? "studio" : "none";
    }
  }

  function bindRangeNumberPair(range, value, onChange) {
    range?.addEventListener("input", () => {
      if (value) value.value = formatInputNumber(readControlNumber(range, 0));
      onChange();
    });
    value?.addEventListener("input", () => {
      if (value.value === "") return;
      if (range) range.value = String(clampControlNumber(value, readControlNumber(value, 0)));
      onChange();
    });
    value?.addEventListener("change", () => {
      const nextValue = clampControlNumber(value, readControlNumber(value, 0));
      value.value = formatInputNumber(nextValue);
      if (range) range.value = String(nextValue);
      onChange();
    });
  }

  function applyLightingControls() {
    if (state.scene) {
      state.scene.imageProcessingConfiguration.exposure = readControlNumber(els.exposureRange, 1);
    }
    applyLightControl({
      toggle: els.keyLightToggle,
      color: els.keyLightColor,
      range: els.keyRange,
      value: els.keyLightValue,
      light: state.keyLight
    });
    applyLightControl({
      toggle: els.ambientLightToggle,
      color: els.ambientLightColor,
      range: els.ambientRange,
      value: els.ambientLightValue,
      light: state.hemiLight
    });
    applyLightControl({
      toggle: els.pointLightToggle,
      color: els.pointLightColor,
      range: els.pointRange,
      value: els.pointLightValue,
      light: state.pointLight
    });
  }

  function applyLightControl({ toggle, color, range, value, light }) {
    if (!light) return;
    const intensity = readControlNumber(range, readControlNumber(value, 1));
    const enabled = toggle?.checked ?? true;
    light.intensity = enabled ? intensity : 0;

    const lightColor = hexToColor3(color?.value || "#ffffff");
    if ("diffuse" in light) light.diffuse = lightColor;
    if ("specular" in light) light.specular = lightColor;
  }

  function readControlNumber(input, fallback) {
    const value = Number(input?.value);
    return Number.isFinite(value) ? value : fallback;
  }

  function clampControlNumber(input, value) {
    const min = Number(input?.min);
    const max = Number(input?.max);
    let nextValue = Number.isFinite(value) ? value : 0;
    if (Number.isFinite(min)) nextValue = Math.max(min, nextValue);
    if (Number.isFinite(max)) nextValue = Math.min(max, nextValue);
    return nextValue;
  }

  function formatInputNumber(value) {
    return Number(value || 0).toFixed(2);
  }

  function hexToColor3(value) {
    const normalized = String(value || "#ffffff").replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
      return BABYLON.Color3.White();
    }
    const r = parseInt(normalized.slice(0, 2), 16) / 255;
    const g = parseInt(normalized.slice(2, 4), 16) / 255;
    const b = parseInt(normalized.slice(4, 6), 16) / 255;
    return new BABYLON.Color3(r, g, b);
  }

  function bindRuntimeOpenEvents() {
    const listen = window.__TAURI__?.event?.listen;
    if (!listen) return;

    listen("modeldesk-open-model-package", async (event) => {
      const payload = event?.payload || {};
      if (payload.error) {
        setStatus(`打开关联文件失败：${payload.error}`, true);
        return;
      }

      const modelPackage = payload.model_package || payload.modelPackage;
      if (!modelPackage) {
        return;
      }

      try {
        await loadModelPackage(modelPackage, { label: "关联文件" });
      } catch (error) {
        setStatus(`打开关联文件失败：${error?.message || error}`, true);
        console.error(error);
      }
    }).catch((error) => {
      setStatus(`运行时文件监听失败：${error?.message || error}`, true);
      console.error(error);
    });
  }

  async function openModelFolder() {
    const invoke = window.__TAURI__?.core?.invoke;
    if (!invoke) {
      els.folderInput?.click();
      return;
    }

    try {
      setStatus("请选择模型文件夹");
      const modelPackage = await invoke("open_model_package_from_folder");
      if (!modelPackage) {
        setStatus(state.activeFile ? `已加载 ${state.activeFile.name}` : "就绪");
        return;
      }
      await loadModelPackage(modelPackage, { label: "文件夹" });
    } catch (error) {
      setStatus(`打开文件夹失败：${error?.message || error}`, true);
      console.error(error);
    }
  }

  async function loadFileList(fileList, preferredName = null) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const mainFile = pickMainModel(files, preferredName);
    if (!mainFile) {
      state.activeFiles = files;
      state.activeFile = null;
      state.activeFileKey = "";
      state.projectProfile = buildProjectProfile(files, null);
      renderProjectSummary(state.projectProfile);
      state.resourceDiagnostics = buildPackageOnlyDiagnostics(files);
      renderResourceDiagnostics(state.resourceDiagnostics);
      renderFileTree(files, null);
      setStatus("没有找到可加载的模型文件。", true);
      return;
    }

    state.activeFiles = files;
    state.activeFile = mainFile;
    state.activeFileKey = getFileDisplayPath(mainFile);
    state.projectProfile = buildProjectProfile(files, mainFile);
    renderProjectSummary(state.projectProfile);
    const resourceDiagnostics = await analyzeModelResources(files, mainFile);
    state.resourceDiagnostics = resourceDiagnostics;
    state.wireframe = false;
    state.autoRotate = false;
    state.materialVisibility = new Map();
    state.materialDefaults = new Map();
    state.activeMaterialId = null;
    state.meshVisibility = new Map();
    state.activeMeshId = null;
    if (els.sceneSearchInput) els.sceneSearchInput.value = "";
    els.wireButton?.classList.remove("is-active");
    els.autoRotateButton?.classList.remove("is-active");
    els.viewWireButton?.classList.remove("is-active");
    els.viewRotateButton?.classList.remove("is-active");
    els.emptyOverlay.classList.add("is-hidden");
    renderFileTree(files, mainFile);
    renderResourceDiagnostics(resourceDiagnostics);
    setProgress(3, `准备 ${mainFile.name}`);
    setStatus(`正在加载 ${mainFile.name}`);

    try {
      clearActiveModel({ keepResourceDiagnostics: true });
      renderResourceDiagnostics(resourceDiagnostics);
      registerLocalFiles(files);
      const extension = getExtension(mainFile.name);
      const container = extension === ".fbx"
        ? await loadFbxAssetContainer(mainFile)
        : await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "file:",
            mainFile.name,
            state.scene,
            (event) => handleProgress(event),
            extension
          );

      state.activeContainer = container;
      container.addAllToScene();
      setupAnimations(container);
      normalizeLoadedMeshes(container.meshes);
      fitCamera();
      updateStats(mainFile, container);
      augmentResourceDiagnosticsWithRuntime(resourceDiagnostics, container);
      renderResourceDiagnostics(resourceDiagnostics);
      setProgress(100, "加载完成");
      window.setTimeout(hideProgress, 520);
      if (resourceDiagnostics.missing?.length) {
        setStatus(`已加载 ${mainFile.name}，缺失资源 ${formatCount(resourceDiagnostics.missing.length)} 个`, true);
      } else if (resourceDiagnostics.error) {
        setStatus(`已加载 ${mainFile.name}，资源诊断失败`, true);
      } else {
        setStatus(`已加载 ${mainFile.name}`);
      }
      els.modelBadge.textContent = mainFile.name;
      updateActiveTreeFile(mainFile.name);
    } catch (error) {
      hideProgress();
      els.emptyOverlay.classList.remove("is-hidden");
      clearActiveModel({ keepResourceDiagnostics: true });
      state.resourceDiagnostics = resourceDiagnostics;
      state.activeFile = null;
      state.activeFileKey = "";
      renderFileTree(files, null);
      renderResourceDiagnostics(resourceDiagnostics);
      setInfo();
      setStatus(formatError(error), true);
      console.error(error);
    } finally {
      els.fileInput.value = "";
      els.folderInput.value = "";
    }
  }

  async function loadLaunchModelPackage() {
    const invoke = window.__TAURI__?.core?.invoke;
    if (!invoke) return;

    try {
      const modelPackage = await invoke("get_launch_model_package");
      if (!modelPackage) return;

      await loadModelPackage(modelPackage, { label: "关联文件" });
    } catch (error) {
      setStatus(`打开关联文件失败：${error?.message || error}`, true);
      console.error(error);
    }
  }

  async function loadModelPackage(modelPackage, options = {}) {
    const label = options.label || "模型";
    setStatus(`正在读取${label} ${modelPackage.main_file}`);
    const files = modelPackage.files.map((file) => packageFileToFile(file, modelPackage));
    await loadFileList(files, modelPackage.main_file);

    if (modelPackage.truncated) {
      setStatus(`已加载 ${modelPackage.main_file}，部分同目录资源超出读取上限`);
    }
  }

  function packageFileToFile(packageFile, modelPackage = null) {
    const bytes = base64ToBytes(packageFile.data_base64);
    const file = new File([bytes], packageFile.name, {
      type: mimeTypeForName(packageFile.name),
      lastModified: Date.now()
    });
    file.modelDeskRelativePath = packageFile.relative_path;
    if (modelPackage?.main_file === packageFile.relative_path) {
      file.modelDeskSourcePath = modelPackage.source_path;
    }
    return file;
  }

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
  function base64ToBytes(value) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  function mimeTypeForName(name) {
    const extension = getExtension(name);
    const types = {
      ".glb": "model/gltf-binary",
      ".gltf": "model/gltf+json",
      ".obj": "model/obj",
      ".stl": "model/stl",
      ".fbx": "application/octet-stream",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp"
    };
    return types[extension] || "application/octet-stream";
  }

  async function loadFbxAssetContainer(file) {
    setProgress(28, "解析 FBX");
    const { FBXLoader } = await getFbxLoaderModule();
    const loader = new FBXLoader();
    const buffer = await file.arrayBuffer();
    const root = loader.parse(buffer, "");
    root.updateMatrixWorld(true);
    return convertFbxObjectToContainer(root);
  }

  function getFbxLoaderModule() {
    if (!fbxLoaderPromise) {
      const loaderUrl = new URL("./vendor/three/examples/jsm/loaders/FBXLoader.js", window.location.href).href;
      fbxLoaderPromise = import(loaderUrl);
    }
    return fbxLoaderPromise;
  }

  function convertFbxObjectToContainer(root) {
    const meshes = [];
    const materials = [];
    const materialCache = new Map();

    root.traverse((object) => {
      if (!object.isMesh || !object.geometry?.attributes?.position) return;
      const mesh = createBabylonMeshFromThree(object, materialCache, materials);
      if (mesh) meshes.push(mesh);
    });

    return {
      meshes,
      materials,
      skeletons: [],
      animationGroups: root.animations || [],
      animations: root.animations || [],
      addAllToScene() {},
      dispose() {
        meshes.forEach((mesh) => mesh.dispose(false, true));
        materials.forEach((material) => material.dispose?.());
      }
    };
  }

  function createBabylonMeshFromThree(object, materialCache, materials) {
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute("position");
    if (!positionAttribute?.array?.length) return null;

    const mesh = new BABYLON.Mesh(object.name || "FBX Mesh", state.scene);
    const vertexData = new BABYLON.VertexData();
    vertexData.positions = Array.from(positionAttribute.array);

    const normalAttribute = geometry.getAttribute("normal");
    if (normalAttribute?.array?.length) {
      vertexData.normals = Array.from(normalAttribute.array);
    }

    const uvAttribute = geometry.getAttribute("uv");
    if (uvAttribute?.array?.length) {
      vertexData.uvs = Array.from(uvAttribute.array);
    }

    if (geometry.index?.array?.length) {
      vertexData.indices = Array.from(geometry.index.array);
    } else {
      vertexData.indices = Array.from({ length: positionAttribute.count }, (_, index) => index);
    }

    if (!vertexData.normals?.length) {
      vertexData.normals = [];
      BABYLON.VertexData.ComputeNormals(vertexData.positions, vertexData.indices, vertexData.normals);
    }

    vertexData.applyToMesh(mesh);
    object.updateWorldMatrix(true, false);
    const position = object.getWorldPosition(new object.position.constructor());
    const quaternion = object.getWorldQuaternion(new object.quaternion.constructor());
    const scale = object.getWorldScale(new object.scale.constructor());
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotationQuaternion = new BABYLON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    mesh.scaling.set(scale.x, scale.y, scale.z);
    mesh.material = getBabylonMaterialFromThree(object.material, materialCache, materials);
    mesh.isPickable = true;
    return mesh;
  }

  function getBabylonMaterialFromThree(threeMaterial, materialCache, materials) {
    const source = Array.isArray(threeMaterial) ? threeMaterial[0] : threeMaterial;
    const key = source?.uuid || source?.id || "default";
    if (materialCache.has(key)) return materialCache.get(key);

    const material = new BABYLON.PBRMaterial(source?.name || "FBX Material", state.scene);
    const color = source?.color;
    material.albedoColor = color
      ? new BABYLON.Color3(color.r ?? 0.7, color.g ?? 0.7, color.b ?? 0.7)
      : new BABYLON.Color3(0.72, 0.72, 0.72);
    material.alpha = Number.isFinite(source?.opacity) ? source.opacity : 1;
    material.metallic = Number.isFinite(source?.metalness) ? source.metalness : 0;
    material.roughness = Number.isFinite(source?.roughness) ? source.roughness : 0.65;
    material.backFaceCulling = false;
    if (source?.transparent || material.alpha < 1) {
      material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
    }
    materialCache.set(key, material);
    materials.push(material);
    return material;
  }

  function clearActiveModel(options = {}) {
    setPanMode(false, { quiet: true });
    setMeasureMode(false, { quiet: true });
    clearMeasurement();
    resetAnimations();
    clearMaterialHighlight();
    clearSceneHighlight();
    if (state.activeContainer) {
      state.activeContainer.dispose();
      state.activeContainer = null;
    }
    state.modelBounds = null;
    state.materialVisibility = new Map();
    state.materialDefaults = new Map();
    state.activeMaterialId = null;
    state.meshVisibility = new Map();
    state.activeMeshId = null;
    state.measurements = [];
    if (!options.keepResourceDiagnostics) {
      state.resourceDiagnostics = null;
      state.projectProfile = null;
      renderProjectSummary(null);
      renderResourceDiagnostics(null);
    }
    if (els.sceneSearchInput) els.sceneSearchInput.value = "";
    els.modelBadge.textContent = "无模型";
    renderMeshes([]);
    renderMaterials([]);
    renderMeasurePanel();
  }

  function normalizeLoadedMeshes(meshes) {
    meshes.forEach((mesh) => {
      mesh.isPickable = true;
      if (mesh.material && "backFaceCulling" in mesh.material) {
        mesh.material.backFaceCulling = false;
      }
    });
  }

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

  function calculateBounds() {
    return calculateMeshBounds(getRenderableMeshes());
  }

  function calculateMeshBounds(meshes) {
    if (!meshes.length) return null;
    let min = new BABYLON.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let max = new BABYLON.Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    meshes.forEach((mesh) => {
      mesh.computeWorldMatrix(true);
      const vectors = mesh.getBoundingInfo().boundingBox.vectorsWorld;
      vectors.forEach((vector) => {
        min = BABYLON.Vector3.Minimize(min, vector);
        max = BABYLON.Vector3.Maximize(max, vector);
      });
    });

    if (!Number.isFinite(min.x) || !Number.isFinite(max.x)) return null;
    return { min, max };
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

  function isPickableModelMesh(mesh) {
    if (!mesh || mesh.metadata?.modelDeskUtility) return false;
    return Boolean(state.activeContainer?.meshes?.includes(mesh));
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

  function updateStats(file, container) {
    const meshes = getRenderableMeshes();
    const materials = getActiveMaterials();
    captureMaterialDefaults(materials);
    const bounds = calculateBounds();
    const triangles = meshes.reduce((sum, mesh) => sum + Math.floor((mesh.getTotalIndices?.() || 0) / 3), 0);
    const vertices = meshes.reduce((sum, mesh) => sum + (mesh.getTotalVertices?.() || 0), 0);
    const size = bounds ? bounds.max.subtract(bounds.min) : null;

    setInfo({
      file: file.name,
      format: describeModelFormat(file.name),
      loadedAt: formatLoadedTime(new Date()),
      fileSize: formatBytes(file.size),
      meshCount: meshes.length,
      triangles,
      vertices,
      materialCount: materials.length,
      skeletonCount: container.skeletons?.length || 0,
      animationCount: container.animationGroups?.length || container.animations?.length || 0,
      bounds: size ? `${formatNumber(size.x)} x ${formatNumber(size.y)} x ${formatNumber(size.z)}` : "-"
    });

    renderMeshes(meshes);
    renderMaterials(materials);
    setFooterMetrics({ triangles, vertices, meshes: meshes.length, materials: materials.length });
    renderMeasurePanel();
    updateViewChip();
  }

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

  function renderMeshes(meshes) {
    const query = (els.sceneSearchInput?.value || "").trim().toLowerCase();
    const visibleMeshes = query
      ? meshes.filter((mesh) => (mesh.name || "Mesh").toLowerCase().includes(query))
      : meshes;
    updateScenePanelTitle(meshes.length, visibleMeshes.length, query);

    if (!meshes.length) {
      els.meshList.className = "empty-list";
      els.meshList.textContent = "未载入模型";
      return;
    }
    if (!visibleMeshes.length) {
      els.meshList.className = "empty-list";
      els.meshList.textContent = "无匹配网格";
      return;
    }

    els.meshList.className = "mesh-list";
    els.meshList.innerHTML = visibleMeshes
      .slice(0, 80)
      .map((mesh) => {
        const triangles = Math.floor((mesh.getTotalIndices?.() || 0) / 3);
        const id = getMeshId(mesh);
        const active = state.activeMeshId === id;
        const visible = isMeshVisible(mesh);
        const classes = [
          "mesh-item",
          active ? "is-active" : "",
          visible ? "" : "is-hidden-mesh"
        ].filter(Boolean).join(" ");
        return `<div class="${classes}" data-mesh-id="${escapeHtml(id)}">
          <svg><use href="#icon-box"></use></svg>
          <div class="mesh-meta">
            <strong title="${escapeHtml(mesh.name)}">${escapeHtml(mesh.name || "Mesh")}</strong>
            <span>${formatCount(triangles)} tris</span>
          </div>
          <div class="mesh-actions">
            <button type="button" data-mesh-action="focus" title="定位网格" aria-label="定位网格"><svg><use href="#icon-target"></use></svg></button>
            <button class="${visible ? "" : "is-off"}" type="button" data-mesh-action="toggle" title="${visible ? "隐藏网格" : "显示网格"}" aria-label="${visible ? "隐藏网格" : "显示网格"}"><svg><use href="#icon-eye"></use></svg></button>
          </div>
        </div>`;
      })
      .join("");
  }

  function updateScenePanelTitle(total, visible, query) {
    if (!els.scenePanelTitle) return;
    if (!total) {
      els.scenePanelTitle.textContent = "场景层级";
      return;
    }
    els.scenePanelTitle.textContent = query
      ? `场景层级 (${formatCount(visible)} / ${formatCount(total)})`
      : `场景层级 (${formatCount(total)})`;
  }

  function handleMeshListClick(event) {
    const item = event.target.closest("[data-mesh-id]");
    if (!item || !els.meshList.contains(item)) return;

    const mesh = findMeshById(item.dataset.meshId);
    if (!mesh) return;

    const action = event.target.closest("[data-mesh-action]")?.dataset.meshAction || "focus";
    if (action === "toggle") {
      toggleMeshVisibility(mesh);
      return;
    }

    focusMesh(mesh);
  }

  function toggleMeshVisibility(mesh) {
    const id = getMeshId(mesh);
    const nextVisible = !isMeshVisible(mesh);
    state.meshVisibility.set(id, nextVisible);
    applyVisibilityState();

    if (!nextVisible && state.activeMeshId === id) {
      clearSceneHighlight();
      state.activeMeshId = null;
    }

    renderMeshes(getRenderableMeshes());
    setStatus(`${mesh.name || "Mesh"} ${nextVisible ? "已显示" : "已隐藏"}`);
  }

  function focusMesh(mesh) {
    const id = getMeshId(mesh);
    if (!isMeshVisible(mesh)) {
      state.meshVisibility.set(id, true);
      applyVisibilityState();
    }

    state.activeMeshId = id;
    state.activeMaterialId = null;
    clearMaterialHighlight();
    clearSceneHighlight();
    state.highlightedSceneMeshes = [mesh];
    mesh.renderOutline = true;
    mesh.outlineColor = new BABYLON.Color3(0.95, 0.46, 0.18);
    mesh.outlineWidth = 0.035;

    fitCameraToMeshes([mesh]);
    renderMeshes(getRenderableMeshes());
    renderMaterials(getActiveMaterials());
    setStatus(`已定位网格：${mesh.name || "Mesh"}`);
  }

  function clearSceneHighlight() {
    state.highlightedSceneMeshes.forEach((mesh) => {
      if (!mesh.isDisposed?.()) {
        mesh.renderOutline = false;
      }
    });
    state.highlightedSceneMeshes = [];
  }

  function findMeshById(id) {
    return getRenderableMeshes().find((mesh) => getMeshId(mesh) === String(id));
  }

  function getMeshId(mesh) {
    return String(mesh.uniqueId);
  }

  function isMeshVisible(mesh) {
    return state.meshVisibility.get(getMeshId(mesh)) !== false;
  }

  function getRenderableMeshes() {
    if (!state.activeContainer) return [];
    return state.activeContainer.meshes.filter((mesh) => {
      const vertices = mesh.getTotalVertices?.() || 0;
      return vertices > 0 && mesh.getBoundingInfo;
    });
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

})();
