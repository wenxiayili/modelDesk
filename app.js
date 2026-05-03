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

  let viewControls = null;
  let materialTools = null;
  let fileTools = null;
  let sceneMeshTools = null;
  let modelPackageTools = null;

  const { createStatusHudTools } = await import("./app/status-hud.mjs");
  const {
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
  } = createStatusHudTools({
    els,
    state,
    formatCount,
    getRenderableMeshes: (...args) => sceneMeshTools?.getRenderableMeshes(...args) || [],
    calculateBounds,
    updateActiveTreeFile: (...args) => fileTools?.updateActiveTreeFile(...args)
  });

  const { createFileTools } = await import("./app/files.mjs");
  fileTools = createFileTools({
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
    loadModelPackage: (...args) => modelPackageTools?.loadModelPackage(...args),
    fitCamera: (...args) => viewControls?.fitCamera(...args),
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

  const { createReportExportTools } = await import("./app/report-export.mjs");
  const { exportResourceHealthReport } = createReportExportTools({
    state,
    stripExtension,
    buildResourceHealthReport,
    setStatus
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

  const { createFbxLoaderTools } = await import("./app/fbx-loader.mjs");
  const { loadFbxAssetContainer } = createFbxLoaderTools({
    state,
    BABYLON: window.BABYLON,
    setProgress
  });

  const { createModelPackageTools } = await import("./app/model-packages.mjs");
  modelPackageTools = createModelPackageTools({
    els,
    state,
    getExtension,
    loadFileList,
    setStatus
  });
  const {
    bindRuntimeOpenEvents,
    openModelFolder,
    loadLaunchModelPackage
  } = modelPackageTools;

  const { createLightingTools } = await import("./app/lighting.mjs");
  const {
    bindExposureControl,
    bindLightControl,
    bindEnvironmentControls,
    loadStudioEnvironment,
    loadCustomEnvironment,
    setEnvironmentTexture,
    applyEnvironmentRotation,
    updateEnvironmentUi,
    bindRangeNumberPair,
    applyLightingControls,
    readControlNumber,
    hexToColor3
  } = createLightingTools({
    els,
    state,
    BABYLON: window.BABYLON,
    getExtension,
    setStatus,
    updateViewChip
  });

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
    setPanMode: (...args) => viewControls?.setPanMode(...args),
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

  const { createViewControls } = await import("./app/view-controls.mjs");
  viewControls = createViewControls({
    els,
    state,
    BABYLON: window.BABYLON,
    calculateBounds,
    getActiveMaterials: (...args) => materialTools?.getActiveMaterials(...args) || [],
    setMeasureMode,
    renderMeasurePanel,
    updateMeasureLabel,
    updateViewChip,
    setStatus
  });
  const {
    fitCamera,
    resetCamera,
    setCameraPreset,
    toggleWireframe,
    toggleAutoRotate,
    togglePanMode,
    handlePanPointerDown,
    handlePanPointerMove,
    handlePanPointerUp,
    toggleViewportFullscreen
  } = viewControls;

  const { createSceneMeshTools } = await import("./app/scene-meshes.mjs");
  sceneMeshTools = createSceneMeshTools({
    els,
    state,
    BABYLON: window.BABYLON,
    calculateMeshBounds,
    applyVisibilityState: (...args) => materialTools?.applyVisibilityState(...args),
    clearMaterialHighlight: (...args) => materialTools?.clearMaterialHighlight(...args),
    renderMaterials: (...args) => materialTools?.renderMaterials(...args),
    getActiveMaterials: (...args) => materialTools?.getActiveMaterials(...args) || [],
    formatCount,
    escapeHtml,
    setStatus
  });
  const {
    renderMeshes,
    handleMeshListClick,
    clearSceneHighlight,
    getRenderableMeshes
  } = sceneMeshTools;

  const { createMaterialTools } = await import("./app/materials.mjs");
  materialTools = createMaterialTools({
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
  } = materialTools;

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

  const { createSceneRuntime } = await import("./app/scene-runtime.mjs");
  const { initScene } = createSceneRuntime({
    els,
    state,
    BABYLON: window.BABYLON,
    applyLightingControls,
    loadStudioEnvironment,
    beginDrawCallFrame,
    readDrawCallFrame,
    updateMeasureLabel,
    formatCount,
    getDrawCallCount,
    updateViewportHud
  });

  const { createEventBindings } = await import("./app/event-bindings.mjs");
  const { bindUi } = createEventBindings({
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
  });

  initScene();
  applyStoredTheme();
  bindUi();
  bindRuntimeOpenEvents();
  setInfo();
  setStatus("就绪");
  loadLaunchModelPackage();

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

  function isPickableModelMesh(mesh) {
    if (!mesh || mesh.metadata?.modelDeskUtility) return false;
    return Boolean(state.activeContainer?.meshes?.includes(mesh));
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

})();
