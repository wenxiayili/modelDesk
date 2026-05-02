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

  const supportedModels = [".glb", ".gltf", ".obj", ".stl", ".fbx", ".babylon"];
  const modelPriority = [".glb", ".gltf", ".babylon", ".fbx", ".obj", ".stl"];
  const textureExtensions = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tga", ".dds", ".ktx", ".ktx2", ".hdr"];
  const materialExtensions = [".mtl"];
  const bufferExtensions = [".bin"];
  const environmentExtensions = [".env", ".hdr"];
  const recentKey = "modeldesk.recent.v1";
  const themeKey = "modeldesk.theme.v1";
  const panelStateKey = "modeldesk.panels.v1";
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

  if (!window.BABYLON) {
    setStatus("Babylon.js 未加载，请检查网络或改成本地依赖。", true);
    els.engineStatus.textContent = "引擎未就绪";
    return;
  }

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

  function bindCollapsiblePanels() {
    const panelStates = readPanelStates();
    document.querySelectorAll("[data-collapsible-panel]").forEach((panel) => {
      const key = panel.dataset.panelKey || "";
      const toggle = panel.querySelector("[data-panel-toggle]");
      setPanelCollapsed(panel, Boolean(panelStates[key]), { persist: false });
      toggle?.addEventListener("click", () => {
        setPanelCollapsed(panel, !panel.classList.contains("is-collapsed"));
      });
    });
  }

  function setPanelCollapsed(panel, collapsed, options = {}) {
    panel.classList.toggle("is-collapsed", collapsed);
    const toggle = panel.querySelector("[data-panel-toggle]");
    toggle?.setAttribute("aria-expanded", String(!collapsed));
    if (options.persist === false) return;
    const key = panel.dataset.panelKey;
    if (!key) return;
    const panelStates = readPanelStates();
    panelStates[key] = Boolean(collapsed);
    window.localStorage.setItem(panelStateKey, JSON.stringify(panelStates));
  }

  function readPanelStates() {
    try {
      return JSON.parse(window.localStorage.getItem(panelStateKey) || "{}") || {};
    } catch {
      return {};
    }
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

  function bindUtilityControls() {
    els.themeButton?.addEventListener("click", toggleTheme);
    els.settingsButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover(els.settingsPopover, els.helpPopover);
    });
    els.helpButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover(els.helpPopover, els.settingsPopover);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".utility-popover") && !event.target.closest(".utility-actions")) {
        closeUtilityPopovers();
      }
    });
    bindQuickToggle(els.quickGridToggle, els.gridToggle);
    bindQuickToggle(els.quickAxisToggle, els.axisToggle);
    bindQuickToggle(els.quickEnvToggle, els.envToggle);
    syncQuickToggles();
  }

  function bindQuickToggle(quickToggle, sourceToggle) {
    quickToggle?.addEventListener("change", () => setSourceToggle(sourceToggle, quickToggle.checked));
    sourceToggle?.addEventListener("change", syncQuickToggles);
  }

  function setSourceToggle(sourceToggle, checked) {
    if (!sourceToggle || sourceToggle.checked === checked) return;
    sourceToggle.checked = checked;
    sourceToggle.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function syncQuickToggles() {
    if (els.quickGridToggle) els.quickGridToggle.checked = els.gridToggle.checked;
    if (els.quickAxisToggle) els.quickAxisToggle.checked = els.axisToggle.checked;
    if (els.quickEnvToggle) els.quickEnvToggle.checked = els.envToggle.checked;
  }

  function togglePopover(target, other) {
    if (!target) return;
    const show = target.hidden;
    closeUtilityPopovers();
    if (other) other.hidden = true;
    target.hidden = !show;
  }

  function closeUtilityPopovers() {
    if (els.settingsPopover) els.settingsPopover.hidden = true;
    if (els.helpPopover) els.helpPopover.hidden = true;
  }

  function applyStoredTheme() {
    const theme = window.localStorage.getItem(themeKey) || "light";
    document.body.classList.toggle("is-dark", theme === "dark");
    els.themeButton?.classList.toggle("is-active", theme === "dark");
  }

  function toggleTheme() {
    const dark = !document.body.classList.contains("is-dark");
    document.body.classList.toggle("is-dark", dark);
    els.themeButton?.classList.toggle("is-active", dark);
    window.localStorage.setItem(themeKey, dark ? "dark" : "light");
    setStatus(dark ? "已切换深色主题" : "已切换浅色主题");
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

  function buildProjectProfile(files, mainFile) {
    const list = Array.from(files || []);
    const profile = {
      rootName: inferProjectRootName(list, mainFile),
      totalFiles: list.length,
      totalBytes: list.reduce((total, file) => total + (file.size || 0), 0),
      models: 0,
      textures: 0,
      materials: 0,
      buffers: 0,
      environments: 0,
      others: 0,
      mainFileName: mainFile?.name || ""
    };

    list.forEach((file) => {
      const extension = getExtension(file.name);
      if (isModelFile(file)) {
        profile.models += 1;
      } else if (environmentExtensions.includes(extension)) {
        profile.environments += 1;
      } else if (textureExtensions.includes(extension)) {
        profile.textures += 1;
      } else if (materialExtensions.includes(extension)) {
        profile.materials += 1;
      } else if (bufferExtensions.includes(extension)) {
        profile.buffers += 1;
      } else {
        profile.others += 1;
      }
    });
    return profile;
  }

  function inferProjectRootName(files, mainFile) {
    const roots = new Map();
    files.forEach((file) => {
      const parts = getFileDisplayPath(file).split("/").filter(Boolean);
      if (parts.length > 1) roots.set(parts[0], (roots.get(parts[0]) || 0) + 1);
    });
    if (roots.size) {
      return Array.from(roots.entries()).sort((a, b) => b[1] - a[1])[0][0];
    }
    return mainFile ? stripExtension(mainFile.name) : "资源包";
  }

  function renderProjectSummary(profile) {
    if (!els.projectSummary) return;
    if (!profile || !profile.totalFiles) {
      els.projectSummary.hidden = true;
      els.projectSummary.innerHTML = "";
      return;
    }

    els.projectSummary.hidden = false;
    const metrics = [
      ["模型", profile.models],
      ["贴图", profile.textures],
      ["材质", profile.materials],
      ["缓冲", profile.buffers],
      ["环境", profile.environments]
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `<span>${label} ${formatCount(value)}</span>`)
      .join("");
    els.projectSummary.innerHTML = `<div>
      <strong title="${escapeHtml(profile.rootName)}">${escapeHtml(profile.rootName)}</strong>
      <small>${formatBytes(profile.totalBytes)} / ${formatCount(profile.totalFiles)} 个文件</small>
    </div>
    <div class="project-metrics">${metrics || `<span>资源 ${formatCount(profile.others)}</span>`}</div>`;
  }

  function renderFileTree(files = state.activeFiles, activeFile = state.activeFile) {
    if (!els.fileTree) return;
    const list = Array.from(files || []);
    const query = (els.fileSearchInput?.value || "").trim().toLowerCase();

    if (!list.length) {
      els.fileTree.innerHTML = `<div class="tree-folder is-open">
          <span class="tree-caret">&#9662;</span>
          <svg class="tree-folder-icon"><use href="#icon-folder"></use></svg>
          <strong>模型</strong>
          <small>0 个模型</small>
        </div>
        <div class="tree-file is-active" id="activeTreeFile">
          <span class="tree-spacer"></span>
          <svg class="tree-item-icon"><use href="#icon-box"></use></svg>
          <span class="tree-file-label">无模型</span>
          <svg class="tree-status"><use href="#icon-eye"></use></svg>
        </div>
        <div class="tree-folder">
          <span class="tree-caret">&#8250;</span>
          <svg class="tree-folder-icon"><use href="#icon-folder"></use></svg>
          <strong>资源</strong>
          <small>0 个文件</small>
        </div>
        <div class="tree-folder">
          <span class="tree-caret">&#8250;</span>
          <svg class="tree-folder-icon"><use href="#icon-folder"></use></svg>
          <strong>示例</strong>
          <small>0 个文件</small>
        </div>`;
      return;
    }

    const root = buildFileTree(list);
    const activeKey = activeFile ? getFileKey(activeFile) : (state.activeFileKey || "").toLowerCase();
    const referencedPaths = getReferencedResourcePaths(state.resourceDiagnostics);
    const rows = [];
    let visibleRows = 0;
    const rowLimit = 360;

    const renderNode = (node, depth) => {
      if (visibleRows >= rowLimit) return;

      Array.from(node.directories.values())
        .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))
        .forEach((directory) => {
          if (!nodeHasMatches(directory, query) || visibleRows >= rowLimit) return;
          const collapsed = state.collapsedFileFolders.has(directory.path) && !query;
          const fileCount = countNodeFiles(directory);
          const modelCount = countNodeModels(directory);
          const label = modelCount ? `${modelCount} 个模型` : `${fileCount} 个文件`;
          rows.push(`<div class="tree-folder ${collapsed ? "" : "is-open"}" data-folder-path="${escapeHtml(directory.path)}" style="--tree-depth:${Math.min(depth, 8)}">
            <span class="tree-caret">${collapsed ? "&#8250;" : "&#9662;"}</span>
            <svg class="tree-folder-icon"><use href="#icon-folder"></use></svg>
            <strong title="${escapeHtml(directory.path)}">${escapeHtml(directory.name)}</strong>
            <small>${escapeHtml(label)}</small>
          </div>`);
          visibleRows += 1;
          if (!collapsed) renderNode(directory, depth + 1);
        });

      node.files
        .filter((entry) => entryMatches(entry, query))
        .sort((a, b) => Number(b.isModel) - Number(a.isModel) || a.name.localeCompare(b.name, "zh-CN"))
        .forEach((entry) => {
          if (visibleRows >= rowLimit) return;
          const fileKey = getFileKey(entry.file);
          const isActive = activeKey && fileKey === activeKey;
          const extension = getExtension(entry.file.name).replace(".", "").toUpperCase() || "文件";
          const isReferenced = referencedPaths.has(normalizeResourcePath(entry.path));
          const classes = [
            "tree-file",
            isActive ? "is-active" : "",
            entry.isModel ? "" : "is-muted",
            isReferenced ? "is-referenced-resource" : ""
          ].filter(Boolean).join(" ");
          const right = entry.isModel
            ? `<svg class="tree-status"><use href="#icon-eye"></use></svg>`
            : `<small>${escapeHtml(isReferenced ? "引用" : extension)}</small>`;
          rows.push(`<div class="${classes}" data-file-index="${entry.index}" data-model-file="${entry.isModel ? "true" : "false"}" style="--tree-depth:${Math.min(depth, 8)}" title="${escapeHtml(entry.path)}">
            <span class="tree-spacer"></span>
            <svg class="tree-item-icon"><use href="#${entry.isModel ? "icon-box" : "icon-folder"}"></use></svg>
            <span class="tree-file-label">${escapeHtml(entry.name)}</span>
            ${right}
          </div>`);
          visibleRows += 1;
        });
    };

    renderNode(root, 0);

    if (!rows.length) {
      els.fileTree.innerHTML = `<div class="tree-empty">没有匹配文件</div>`;
      return;
    }
    if (visibleRows >= rowLimit) {
      rows.push(`<div class="tree-empty">仅显示前 ${rowLimit} 个文件，请使用搜索缩小范围。</div>`);
    }
    els.fileTree.innerHTML = rows.join("");
  }

  function handleFileTreeClick(event) {
    const folder = event.target.closest("[data-folder-path]");
    if (folder && els.fileTree?.contains(folder)) {
      const path = folder.dataset.folderPath || "";
      if (state.collapsedFileFolders.has(path)) {
        state.collapsedFileFolders.delete(path);
      } else {
        state.collapsedFileFolders.add(path);
      }
      renderFileTree();
      return;
    }

    const item = event.target.closest("[data-file-index]");
    if (!item || !els.fileTree?.contains(item) || item.dataset.modelFile !== "true") return;

    const file = state.activeFiles[Number(item.dataset.fileIndex)];
    if (!file) return;
    const filePath = getFileDisplayPath(file);
    if (state.activeContainer && state.activeFile && getFileKey(file) === getFileKey(state.activeFile)) {
      fitCamera();
      return;
    }
    loadFileList(state.activeFiles, filePath);
  }

  function buildFileTree(files) {
    const root = { name: "", path: "", directories: new Map(), files: [] };
    files.forEach((file, index) => {
      const isModel = isModelFile(file);
      const displayPath = getFileDisplayPath(file);
      let parts = displayPath.split("/").filter(Boolean);
      if (!parts.length) parts = [file.name || `file-${index}`];
      if (parts.length === 1) {
        parts = [isModel ? "模型" : "资源", parts[0]];
      }

      let node = root;
      parts.slice(0, -1).forEach((part) => {
        const path = node.path ? `${node.path}/${part}` : part;
        if (!node.directories.has(part)) {
          node.directories.set(part, { name: part, path, directories: new Map(), files: [] });
        }
        node = node.directories.get(part);
      });
      node.files.push({
        file,
        index,
        isModel,
        name: parts[parts.length - 1],
        path: displayPath || file.name || `file-${index}`
      });
    });
    return root;
  }

  function nodeHasMatches(node, query) {
    if (!query) return true;
    if (node.name.toLowerCase().includes(query) || node.path.toLowerCase().includes(query)) return true;
    if (node.files.some((entry) => entryMatches(entry, query))) return true;
    return Array.from(node.directories.values()).some((directory) => nodeHasMatches(directory, query));
  }

  function entryMatches(entry, query) {
    if (!query) return true;
    return `${entry.path} ${entry.file.name} ${getExtension(entry.file.name)}`.toLowerCase().includes(query);
  }

  function countNodeFiles(node) {
    return node.files.length + Array.from(node.directories.values()).reduce((total, directory) => total + countNodeFiles(directory), 0);
  }

  function countNodeModels(node) {
    return node.files.filter((entry) => entry.isModel).length + Array.from(node.directories.values()).reduce((total, directory) => total + countNodeModels(directory), 0);
  }

  function isModelFile(file) {
    return supportedModels.includes(getExtension(file?.name || ""));
  }

  function getFileDisplayPath(file) {
    return (file?.webkitRelativePath || file?.modelDeskRelativePath || file?.name || "").replaceAll("\\", "/");
  }

  function getFileKey(file) {
    return getFileDisplayPath(file).toLowerCase();
  }

  function pickMainModel(files, preferredName = null) {
    if (preferredName) {
      const normalized = preferredName.replaceAll("\\", "/").toLowerCase();
      const preferred = files.find((file) => {
        const relativePath = getFileDisplayPath(file).toLowerCase();
        return relativePath === normalized || file.name.toLowerCase() === normalized;
      });
      if (preferred && supportedModels.includes(getExtension(preferred.name))) {
        return preferred;
      }
    }

    const candidates = files.filter((file) => supportedModels.includes(getExtension(file.name)));
    if (!candidates.length) return null;
    return candidates.sort((a, b) => modelPriority.indexOf(getExtension(a.name)) - modelPriority.indexOf(getExtension(b.name)))[0];
  }

  function registerLocalFiles(files) {
    if (!BABYLON.FilesInputStore?.FilesToLoad) return;
    Object.keys(BABYLON.FilesInputStore.FilesToLoad).forEach((key) => {
      delete BABYLON.FilesInputStore.FilesToLoad[key];
    });

    files.forEach((file) => {
      const relativePath = file.webkitRelativePath || file.modelDeskRelativePath || "";
      file.correctName = relativePath || file.name;
      const keys = new Set([file.name, file.name.toLowerCase()]);
      if (relativePath) {
        keys.add(relativePath);
        keys.add(relativePath.toLowerCase());
        const parts = relativePath.split(/[\\/]/).filter(Boolean);
        for (let index = 0; index < parts.length; index += 1) {
          const key = parts.slice(index).join("/");
          keys.add(key);
          keys.add(key.toLowerCase());
        }
      }
      keys.forEach((key) => {
        BABYLON.FilesInputStore.FilesToLoad[key] = file;
      });
    });
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

  function isPickableModelMesh(mesh) {
    if (!mesh || mesh.metadata?.modelDeskUtility) return false;
    return Boolean(state.activeContainer?.meshes?.includes(mesh));
  }

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

  async function saveScreenshot() {
    return exportScreenshot("save");
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

  function setupAnimations(container) {
    resetAnimations({ keepUi: true });
    const groups = Array.from(container.animationGroups || []);
    state.animationItems = groups.map((group, index) => ({
      group,
      index,
      name: group.name || `Animation ${index + 1}`,
      playable: typeof group.play === "function" && typeof group.stop === "function"
    }));
    state.activeAnimationIndex = state.animationItems.findIndex((item) => item.playable);
    if (state.activeAnimationIndex < 0 && state.animationItems.length) {
      state.activeAnimationIndex = 0;
    }
    applyAnimationSpeed();
    renderAnimations();
  }

  function resetAnimations(options = {}) {
    stopAllAnimations();
    state.animationItems = [];
    state.activeAnimationIndex = -1;
    state.animationPlaying = false;
    if (!options.keepUi) renderAnimations();
    updateViewChip();
  }

  function stopAllAnimations() {
    state.animationItems.forEach((item) => {
      if (typeof item.group?.stop === "function") item.group.stop();
    });
  }

  function selectAnimation(index) {
    if (!Number.isFinite(index) || index < 0 || index >= state.animationItems.length) return;
    const current = getActiveAnimationItem();
    if (current?.playable) current.group.stop();
    state.animationPlaying = false;
    state.activeAnimationIndex = index;
    applyAnimationSpeed();
    renderAnimations();
    const item = getActiveAnimationItem();
    setStatus(item?.playable ? `已选择动画 ${item.name}` : "该动画格式暂不支持播放");
    updateViewChip();
  }

  function handleAnimationListClick(event) {
    const item = event.target.closest("[data-animation-index]");
    if (!item || !els.animationList?.contains(item)) return;
    selectAnimation(Number(item.dataset.animationIndex));
  }

  function toggleAnimationPlayback() {
    const item = getActiveAnimationItem();
    if (!item?.playable) {
      setStatus(state.animationItems.length ? "该动画格式暂不支持播放" : "当前模型没有动画", true);
      return;
    }

    if (state.animationPlaying) {
      if (typeof item.group.pause === "function") {
        item.group.pause();
      } else {
        item.group.stop();
      }
      state.animationPlaying = false;
      setStatus(`已暂停动画 ${item.name}`);
    } else {
      item.group.speedRatio = state.animationSpeed;
      item.group.play(true);
      state.animationPlaying = true;
      setStatus(`正在播放动画 ${item.name}`);
    }
    renderAnimations();
    updateViewChip();
  }

  function stopActiveAnimation() {
    const item = getActiveAnimationItem();
    if (!item?.playable) return;
    item.group.stop();
    state.animationPlaying = false;
    renderAnimations();
    updateViewChip();
    setStatus(`已停止动画 ${item.name}`);
  }

  function applyAnimationSpeed() {
    state.animationSpeed = readControlNumber(els.animationSpeedRange, 1);
    state.animationItems.forEach((item) => {
      if (item.playable) item.group.speedRatio = state.animationSpeed;
    });
  }

  function getActiveAnimationItem() {
    return state.animationItems[state.activeAnimationIndex] || null;
  }

  function renderAnimations() {
    const items = state.animationItems;
    const activeItem = getActiveAnimationItem();
    const canPlay = Boolean(activeItem?.playable);

    if (els.animationPanelTitle) {
      els.animationPanelTitle.textContent = items.length ? `动画 (${formatCount(items.length)})` : "动画";
    }

    if (els.animationSelect) {
      els.animationSelect.disabled = !items.length;
      els.animationSelect.innerHTML = items.length
        ? items.map((item, index) => `<option value="${index}">${escapeHtml(item.name)}${item.playable ? "" : "（仅查看）"}</option>`).join("")
        : `<option value="">无动画</option>`;
      els.animationSelect.value = state.activeAnimationIndex >= 0 ? String(state.activeAnimationIndex) : "";
    }

    [els.animationPlayButton, els.animationStopButton, els.animationSpeedRange, els.animationSpeedValue].forEach((control) => {
      if (control) control.disabled = !canPlay;
    });
    els.animationPlayButton?.classList.toggle("is-active", state.animationPlaying);

    if (!els.animationList) return;
    if (!items.length) {
      els.animationList.className = "empty-list";
      els.animationList.textContent = "未载入动画";
      return;
    }

    els.animationList.className = "animation-list";
    els.animationList.innerHTML = items.map((item, index) => {
      const classes = [
        "animation-item",
        index === state.activeAnimationIndex ? "is-active" : "",
        item.playable ? "" : "is-muted"
      ].filter(Boolean).join(" ");
      const status = item.playable
        ? (index === state.activeAnimationIndex && state.animationPlaying ? "播放中" : "就绪")
        : "仅查看";
      return `<div class="${classes}" data-animation-index="${index}">
        <span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
        <small>${status}</small>
      </div>`;
    }).join("");
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

  function renderMaterials(materials) {
    updateMaterialPanelState(materials);
    if (!materials.length) {
      els.materialList.className = "empty-list";
      els.materialList.textContent = "未载入材质";
      return;
    }
    els.materialList.className = "material-list";
    els.materialList.innerHTML = materials
      .slice(0, 80)
      .map((material) => {
        const type = material.getClassName?.() || "Material";
        const color = materialPreviewColor(material);
        const id = String(material.uniqueId);
        const visible = isMaterialVisible(material);
        const active = state.activeMaterialId === id;
        const meshes = getMeshesForMaterial(material);
        const detail = active ? renderMaterialDetail(material, meshes) : "";
        const classes = [
          "material-item",
          active ? "is-active" : "",
          visible ? "" : "is-hidden-material"
        ].filter(Boolean).join(" ");
        return `<div class="${classes}" data-material-id="${escapeHtml(id)}">
          <i class="material-swatch" style="background:${color}"></i>
          <div class="material-meta">
            <strong title="${escapeHtml(material.name)}">${escapeHtml(material.name || "Material")}</strong>
            <span>${escapeHtml(type)} · ${formatCount(meshes.length)} 个网格</span>
          </div>
          <div class="material-actions">
            <button type="button" data-material-action="focus" title="定位材质网格" aria-label="定位材质网格"><svg><use href="#icon-target"></use></svg></button>
            <button class="${visible ? "" : "is-off"}" type="button" data-material-action="toggle" title="${visible ? "隐藏材质网格" : "显示材质网格"}" aria-label="${visible ? "隐藏材质网格" : "显示材质网格"}"><svg><use href="#icon-eye"></use></svg></button>
          </div>
          ${detail}
        </div>`;
      })
      .join("");
  }

  function updateMaterialPanelState(materials = []) {
    const total = materials.length;
    const hiddenCount = materials.filter((material) => !isMaterialVisible(material)).length;
    if (els.materialPanelTitle) {
      els.materialPanelTitle.textContent = total ? `材质 (${formatCount(total)})` : "材质";
    }
    if (els.materialShowAllButton) {
      els.materialShowAllButton.disabled = hiddenCount === 0;
      els.materialShowAllButton.textContent = hiddenCount ? `全部显示 (${formatCount(hiddenCount)})` : "全部显示";
      els.materialShowAllButton.title = hiddenCount ? "显示所有材质网格" : "所有材质均已显示";
    }
  }

  function renderMaterialDetail(material, meshes) {
    const textures = material.getActiveTextures?.() || [];
    const editor = getMaterialEditorState(material);
    const rows = [
      ["Base", materialColorHex(material)],
      ["Metal", formatMaterialScalar(readMaterialNumber(material, ["metallic", "metallicFactor"]))],
      ["Rough", formatMaterialScalar(readMaterialNumber(material, ["roughness", "roughnessFactor"]))],
      ["Alpha", formatMaterialScalar(material.alpha)],
      ["Faces", material.backFaceCulling === false ? "Double" : "Cull"],
      ["Meshes", formatCount(meshes.length)]
    ];
    const textureNames = textures
      .slice(0, 4)
      .map((texture) => texture.name || texture.url || texture._texture?.url || "Texture")
      .filter(Boolean);
    const textureSummary = textureNames.length
      ? textureNames.map((name) => `<span class="detail-chip" title="${escapeHtml(name)}">${escapeHtml(shortName(name))}</span>`).join("")
      : `<span class="detail-chip is-muted">No textures</span>`;

    return `<div class="material-detail">
      <div class="material-detail-grid">
        ${rows.map(([label, value]) => `<span>${escapeHtml(label)}</span><strong title="${escapeHtml(value)}">${escapeHtml(value)}</strong>`).join("")}
      </div>
      ${renderMaterialEditor(editor)}
      <div class="texture-row"><span>Textures</span><div>${textureSummary}</div></div>
    </div>`;
  }

  function renderMaterialEditor(editor) {
    return `<div class="material-editor">
      <label class="material-color-row">
        <span>Base Color</span>
        <input type="color" data-material-field="baseColor" value="${escapeHtml(editor.baseColor.value)}" ${editor.baseColor.disabled ? "disabled" : ""} />
      </label>
      ${renderMaterialSlider("Metallic", "metallic", editor.metallic)}
      ${renderMaterialSlider("Roughness", "roughness", editor.roughness)}
      ${renderMaterialSlider("Alpha", "alpha", editor.alpha)}
      <button class="material-reset" type="button" data-material-action="restore">Restore Material</button>
    </div>`;
  }

  function renderMaterialSlider(label, field, config) {
    const value = formatSliderValue(config.value);
    return `<label class="material-edit-row">
      <span>${escapeHtml(label)}</span>
      <input type="range" min="0" max="1" step="0.01" data-material-field="${field}" value="${value}" ${config.disabled ? "disabled" : ""} />
      <input class="number-input" type="number" min="0" max="1" step="0.01" data-material-field="${field}" data-material-number="true" value="${value}" ${config.disabled ? "disabled" : ""} />
    </label>`;
  }

  function getMaterialEditorState(material) {
    const colorInfo = getMaterialColorInfo(material);
    const metallic = readMaterialNumber(material, ["metallic", "metallicFactor"]);
    const roughness = readMaterialNumber(material, ["roughness", "roughnessFactor"]);
    return {
      baseColor: {
        value: colorInfo ? color3ToHex(colorInfo.color) : "#b8c0cc",
        disabled: !colorInfo
      },
      metallic: {
        value: Number.isFinite(metallic) ? metallic : 0,
        disabled: !findMaterialNumberKey(material, ["metallic", "metallicFactor"])
      },
      roughness: {
        value: Number.isFinite(roughness) ? roughness : 0,
        disabled: !findMaterialNumberKey(material, ["roughness", "roughnessFactor"])
      },
      alpha: {
        value: Number.isFinite(material.alpha) ? material.alpha : 1,
        disabled: !("alpha" in material)
      }
    };
  }

  function captureMaterialDefaults(materials) {
    materials.forEach((material) => {
      const id = String(material.uniqueId);
      if (state.materialDefaults.has(id)) return;
      const colorInfo = getMaterialColorInfo(material);
      state.materialDefaults.set(id, {
        colorProperty: colorInfo?.property || null,
        color: colorInfo?.color?.clone?.() || null,
        metallicKey: findMaterialNumberKey(material, ["metallic", "metallicFactor"]),
        metallic: readMaterialNumber(material, ["metallic", "metallicFactor"]),
        roughnessKey: findMaterialNumberKey(material, ["roughness", "roughnessFactor"]),
        roughness: readMaterialNumber(material, ["roughness", "roughnessFactor"]),
        alpha: Number.isFinite(material.alpha) ? material.alpha : null,
        transparencyMode: Number.isFinite(material.transparencyMode) ? material.transparencyMode : null
      });
    });
  }

  function readMaterialNumber(material, keys) {
    for (const key of keys) {
      const value = material?.[key];
      if (Number.isFinite(value)) return value;
    }
    return null;
  }

  function findMaterialNumberKey(material, keys) {
    return keys.find((key) => Number.isFinite(material?.[key])) || null;
  }

  function formatMaterialScalar(value) {
    return Number.isFinite(value) ? Number(value).toFixed(2) : "-";
  }

  function formatSliderValue(value) {
    return Math.max(0, Math.min(1, Number(value) || 0)).toFixed(2);
  }

  function handleMaterialListClick(event) {
    const item = event.target.closest("[data-material-id]");
    if (!item || !els.materialList.contains(item)) return;

    const material = findMaterialById(item.dataset.materialId);
    if (!material) return;

    const action = event.target.closest("[data-material-action]")?.dataset.materialAction || "focus";
    if (action === "toggle") {
      toggleMaterialVisibility(material);
      return;
    }
    if (action === "restore") {
      restoreMaterial(material);
      return;
    }
    if (event.target.closest(".material-editor")) {
      return;
    }

    focusMaterial(material);
  }

  function handleMaterialEditorInput(event) {
    const control = event.target.closest("[data-material-field]");
    if (!control || !els.materialList.contains(control)) return;
    const item = control.closest("[data-material-id]");
    const material = item ? findMaterialById(item.dataset.materialId) : null;
    if (!material) return;

    const field = control.dataset.materialField;
    const value = getMaterialControlValue(control);
    applyMaterialField(material, field, value);
    syncMaterialEditorControls(item, field, value);
    updateMaterialPreview(item, material);
  }

  function handleMaterialEditorChange(event) {
    const control = event.target.closest("[data-material-field]");
    if (!control || !els.materialList.contains(control)) return;
    const item = control.closest("[data-material-id]");
    const material = item ? findMaterialById(item.dataset.materialId) : null;
    if (!material) return;

    const field = control.dataset.materialField;
    const value = getMaterialControlValue(control);
    applyMaterialField(material, field, value);
    renderMaterials(getActiveMaterials());
    setStatus(`已更新材质：${material.name || "Material"}`);
  }

  function getMaterialControlValue(control) {
    if (control.type === "color") return control.value;
    return formatSliderValue(Number(control.value));
  }

  function syncMaterialEditorControls(item, field, value) {
    item.querySelectorAll(`[data-material-field="${field}"]`).forEach((control) => {
      if (control.value !== String(value)) control.value = String(value);
    });
  }

  function updateMaterialPreview(item, material) {
    const swatch = item.querySelector(".material-swatch");
    if (swatch) swatch.style.background = materialPreviewColor(material);
  }

  function applyMaterialField(material, field, value) {
    if (field === "baseColor") {
      const colorInfo = getMaterialColorInfo(material);
      if (colorInfo) {
        material[colorInfo.property].copyFrom?.(hexToColor3(value));
      }
    } else if (field === "metallic") {
      setMaterialNumber(material, ["metallic", "metallicFactor"], Number(value));
    } else if (field === "roughness") {
      setMaterialNumber(material, ["roughness", "roughnessFactor"], Number(value));
    } else if (field === "alpha" && "alpha" in material) {
      const alpha = Number(value);
      material.alpha = Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 1));
      if ("transparencyMode" in material && material.alpha < 1) {
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
      }
    }
    markMaterialDirty(material);
  }

  function setMaterialNumber(material, keys, value) {
    const key = findMaterialNumberKey(material, keys);
    if (!key) return;
    material[key] = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  }

  function restoreMaterial(material) {
    const defaults = state.materialDefaults.get(String(material.uniqueId));
    if (!defaults) return;
    if (defaults.colorProperty && defaults.color && material[defaults.colorProperty]) {
      material[defaults.colorProperty].copyFrom(defaults.color);
    }
    if (defaults.metallicKey && Number.isFinite(defaults.metallic)) {
      material[defaults.metallicKey] = defaults.metallic;
    }
    if (defaults.roughnessKey && Number.isFinite(defaults.roughness)) {
      material[defaults.roughnessKey] = defaults.roughness;
    }
    if (Number.isFinite(defaults.alpha) && "alpha" in material) {
      material.alpha = defaults.alpha;
    }
    if (Number.isFinite(defaults.transparencyMode) && "transparencyMode" in material) {
      material.transparencyMode = defaults.transparencyMode;
    }
    markMaterialDirty(material);
    renderMaterials(getActiveMaterials());
    setStatus(`已恢复材质：${material.name || "Material"}`);
  }

  function markMaterialDirty(material) {
    material.markDirty?.();
    if (state.scene && BABYLON.Material?.AllDirtyFlag != null) {
      state.scene.markAllMaterialsAsDirty(BABYLON.Material.AllDirtyFlag);
    }
  }

  function toggleMaterialVisibility(material) {
    const id = String(material.uniqueId);
    const nextVisible = !isMaterialVisible(material);
    state.materialVisibility.set(id, nextVisible);
    applyVisibilityState();

    if (!nextVisible && state.activeMaterialId === id) {
      clearMaterialHighlight();
      state.activeMaterialId = null;
    }

    renderMeshes(getRenderableMeshes());
    renderMaterials(getActiveMaterials());
    setStatus(`${material.name || "Material"} ${nextVisible ? "已显示" : "已隐藏"}`);
  }

  function showAllMaterials() {
    const materials = getActiveMaterials();
    let restored = 0;
    materials.forEach((material) => {
      const id = String(material.uniqueId);
      if (state.materialVisibility.get(id) === false) {
        state.materialVisibility.set(id, true);
        restored += 1;
      }
    });

    if (!restored) {
      updateMaterialPanelState(materials);
      setStatus("所有材质均已显示");
      return;
    }

    applyVisibilityState();
    renderMeshes(getRenderableMeshes());
    renderMaterials(materials);
    setStatus(`已显示全部材质（${formatCount(restored)}）`);
  }

  function applyVisibilityState() {
    getRenderableMeshes().forEach((mesh) => {
      const hiddenByMesh = !isMeshVisible(mesh);
      const hiddenByMaterial = getMeshMaterials(mesh).some((material) => !isMaterialVisible(material));
      const hidden = hiddenByMesh || hiddenByMaterial;
      mesh.setEnabled(!hidden);
    });
  }

  function focusMaterial(material) {
    const meshes = getMeshesForMaterial(material);
    if (!meshes.length) {
      setStatus("没有找到使用该材质的网格", true);
      return;
    }

    state.activeMaterialId = String(material.uniqueId);
    state.activeMeshId = null;
    clearSceneHighlight();
    clearMaterialHighlight();
    state.highlightedMaterialMeshes = meshes;
    meshes.forEach((mesh) => {
      mesh.renderOutline = true;
      mesh.outlineColor = new BABYLON.Color3(0.12, 0.82, 0.76);
      mesh.outlineWidth = 0.035;
    });

    fitCameraToMeshes(meshes);
    renderMaterials(getActiveMaterials());
    setStatus(`已定位材质：${material.name || "Material"}`);
  }

  function clearMaterialHighlight() {
    state.highlightedMaterialMeshes.forEach((mesh) => {
      if (!mesh.isDisposed?.()) {
        mesh.renderOutline = false;
      }
    });
    state.highlightedMaterialMeshes = [];
  }

  function fitCameraToMeshes(meshes) {
    const bounds = calculateMeshBounds(meshes);
    if (!bounds) return;

    const size = bounds.max.subtract(bounds.min);
    const center = BABYLON.Vector3.Center(bounds.min, bounds.max);
    const radius = Math.max(size.length() * 0.72, 0.35);
    state.camera.setTarget(center);
    state.camera.radius = radius * 2.2;
    state.camera.lowerRadiusLimit = Math.max(radius * 0.04, 0.02);
    state.camera.upperRadiusLimit = Math.max(radius * 20, 20);
  }

  function findMaterialById(id) {
    return getActiveMaterials().find((material) => String(material.uniqueId) === String(id));
  }

  function isMaterialVisible(material) {
    return state.materialVisibility.get(String(material.uniqueId)) !== false;
  }

  function getMeshesForMaterial(material) {
    return getRenderableMeshes().filter((mesh) => getMeshMaterials(mesh).includes(material));
  }

  function getMeshMaterials(mesh) {
    if (!mesh?.material) return [];
    if (Array.isArray(mesh.material.subMaterials)) {
      return mesh.material.subMaterials.filter(Boolean);
    }
    return [mesh.material];
  }

  function getMaterialColorInfo(material) {
    const properties = ["albedoColor", "diffuseColor", "baseColor"];
    for (const property of properties) {
      const color = material?.[property];
      if (color && Number.isFinite(color.r) && Number.isFinite(color.g) && Number.isFinite(color.b)) {
        return { property, color };
      }
    }
    return null;
  }

  function materialPreviewColor(material) {
    const color = getMaterialColorInfo(material)?.color;
    if (!color) return "linear-gradient(135deg, #d7dde6, #8e98a8)";
    const r = Math.round((color.r ?? 0.72) * 255);
    const g = Math.round((color.g ?? 0.72) * 255);
    const b = Math.round((color.b ?? 0.72) * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function materialColorHex(material) {
    const color = getMaterialColorInfo(material)?.color;
    if (!color) return "-";
    return color3ToHex(color);
  }

  function color3ToHex(color) {
    const toHex = (value) => Math.max(0, Math.min(255, Math.round((value ?? 0) * 255))).toString(16).padStart(2, "0");
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
  }

  function shortName(value) {
    return String(value || "")
      .replaceAll("\\", "/")
      .split("/")
      .filter(Boolean)
      .pop() || "Texture";
  }

  function renderRecent() {
    if (!els.recentList) return;
    const recent = getRecent();
    if (!recent.length) {
      els.recentList.className = "empty-list";
      els.recentList.textContent = "暂无记录";
      els.recentClearButton?.setAttribute("disabled", "true");
      return;
    }
    els.recentClearButton?.removeAttribute("disabled");
    els.recentList.className = "recent-list";
    els.recentList.innerHTML = recent
      .map(
        (item, index) => {
          const thumbnail = item.thumbnail
            ? `<img src="${escapeHtml(item.thumbnail)}" alt="" />`
            : `<i>${escapeHtml(item.name.slice(0, 2).toUpperCase())}</i>`;
          const classes = ["recent-item", item.sourcePath ? "" : "is-pathless", item.pinned ? "is-pinned" : ""].filter(Boolean).join(" ");
          const title = item.sourcePath ? item.sourcePath : "此记录没有可重新打开的本地路径";
          return `<div class="${classes}" data-recent-index="${index}" title="${escapeHtml(title)}">
            ${thumbnail}
            <div><strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong><span>${escapeHtml(item.meta)}</span></div>
            <button class="recent-pin" type="button" data-recent-action="pin" title="${item.pinned ? "取消固定" : "固定"}" aria-label="${item.pinned ? "取消固定" : "固定"}"><svg><use href="#icon-pin"></use></svg></button>
          </div>`;
        }
      )
      .join("");
  }

  function rememberRecent(file, fileCount, sourcePath = null) {
    const recent = getRecent();
    const existing = recent.find((item) => item.name === file.name && (sourcePath ? item.sourcePath === sourcePath : !item.sourcePath));
    const nextItem = {
      name: file.name,
      sourcePath: sourcePath || existing?.sourcePath || "",
      fileSize: file.size || 0,
      fileCount,
      meta: `${formatBytes(file.size)} / ${fileCount} 个文件`,
      thumbnail: createViewportThumbnail(),
      time: Date.now(),
      pinned: Boolean(existing?.pinned)
    };
    const nextRecent = [nextItem, ...recent.filter((item) => !recentIdentityMatches(item, nextItem))];
    saveRecent(nextRecent);
  }

  async function handleRecentClick(event) {
    const pinButton = event.target.closest("[data-recent-action='pin']");
    if (pinButton) {
      const item = pinButton.closest("[data-recent-index]");
      if (item) toggleRecentPinned(Number(item.dataset.recentIndex));
      return;
    }

    const item = event.target.closest("[data-recent-index]");
    if (!item || !els.recentList?.contains(item)) return;
    const recent = getRecent();
    const entry = recent[Number(item.dataset.recentIndex)];
    if (!entry) return;
    await openRecent(entry);
  }

  async function openRecent(entry) {
    if (!entry.sourcePath) {
      setStatus("此最近记录没有本地路径，请重新选择文件。", true);
      return;
    }
    const invoke = window.__TAURI__?.core?.invoke;
    if (!invoke) {
      setStatus("浏览器预览不能直接读取本地路径，请在 Tauri 应用中打开。", true);
      return;
    }

    try {
      setStatus(`正在打开最近模型 ${entry.name}`);
      const modelPackage = await invoke("open_model_package_from_path", { path: entry.sourcePath });
      await loadModelPackage(modelPackage, { label: "最近模型" });
    } catch (error) {
      setStatus(`打开最近模型失败：${error?.message || error}`, true);
      console.error(error);
    }
  }

  function toggleRecentPinned(index) {
    const recent = getRecent();
    if (!recent[index]) return;
    recent[index].pinned = !recent[index].pinned;
    recent[index].time = Date.now();
    saveRecent(recent);
    setStatus(recent[index].pinned ? `已固定 ${recent[index].name}` : `已取消固定 ${recent[index].name}`);
  }

  function clearRecent() {
    const recent = getRecent();
    const pinned = recent.filter((item) => item.pinned);
    saveRecent(pinned);
    setStatus(pinned.length ? "已清空未固定的最近记录" : "已清空最近记录");
  }

  function saveRecent(items) {
    const normalized = normalizeRecent(items).slice(0, 8);
    window.localStorage.setItem(recentKey, JSON.stringify(normalized));
    renderRecent();
  }

  function recentIdentityMatches(left, right) {
    if (left.sourcePath && right.sourcePath) {
      return left.sourcePath === right.sourcePath;
    }
    return left.name === right.name;
  }

  function createViewportThumbnail() {
    try {
      state.scene.render();
      const targetWidth = 84;
      const targetHeight = 54;
      const thumb = document.createElement("canvas");
      thumb.width = targetWidth;
      thumb.height = targetHeight;
      const context = thumb.getContext("2d");
      if (!context) return "";

      const source = els.canvas;
      const scale = Math.max(targetWidth / source.width, targetHeight / source.height);
      const width = source.width * scale;
      const height = source.height * scale;
      const x = (targetWidth - width) / 2;
      const y = (targetHeight - height) / 2;
      context.fillStyle = "#10151c";
      context.fillRect(0, 0, targetWidth, targetHeight);
      context.drawImage(source, x, y, width, height);
      return thumb.toDataURL("image/jpeg", 0.72);
    } catch {
      return "";
    }
  }

  function getRecent() {
    try {
      return normalizeRecent(JSON.parse(window.localStorage.getItem(recentKey) || "[]"));
    } catch {
      return [];
    }
  }

  function normalizeRecent(items) {
    const list = Array.isArray(items) ? items : [];
    return list
      .filter((item) => item && item.name)
      .map((item) => ({
        name: String(item.name),
        sourcePath: String(item.sourcePath || ""),
        fileSize: Number(item.fileSize || 0),
        fileCount: Number(item.fileCount || 1),
        meta: item.meta || `${formatBytes(item.fileSize)} / ${Number(item.fileCount || 1)} 个文件`,
        thumbnail: String(item.thumbnail || ""),
        time: Number(item.time || 0),
        pinned: Boolean(item.pinned)
      }))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.time - a.time);
  }

  function getRenderableMeshes() {
    if (!state.activeContainer) return [];
    return state.activeContainer.meshes.filter((mesh) => {
      const vertices = mesh.getTotalVertices?.() || 0;
      return vertices > 0 && mesh.getBoundingInfo;
    });
  }

  function getActiveMaterials() {
    if (!state.activeContainer) return [];
    const materials = new Set();
    state.activeContainer.materials.forEach((material) => materials.add(material));
    getRenderableMeshes().forEach((mesh) => {
      if (mesh.material) materials.add(mesh.material);
    });
    return Array.from(materials);
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

  function updateActiveTreeFile(name) {
    if (state.activeFiles.length) {
      renderFileTree(state.activeFiles, state.activeFile);
      return;
    }
    const activeTreeFile = els.fileTree?.querySelector("#activeTreeFile") || els.activeTreeFile;
    if (!activeTreeFile) return;
    const label = activeTreeFile.querySelector(".tree-file-label");
    if (label) {
      label.textContent = name;
      label.title = name;
    }
  }

  function getExtension(name) {
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot).toLowerCase() : "";
  }

  function stripExtension(name) {
    const dot = name.lastIndexOf(".");
    return dot > 0 ? name.slice(0, dot) : name;
  }

  function formatCount(value) {
    return new Intl.NumberFormat("zh-CN").format(value || 0);
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  }

  function describeModelFormat(name) {
    const extension = getExtension(name);
    const formats = {
      ".glb": "glTF 二进制 (.glb)",
      ".gltf": "glTF 2.0 (.gltf)",
      ".obj": "OBJ 模型",
      ".stl": "STL",
      ".fbx": "FBX 模型",
      ".babylon": "Babylon 场景"
    };
    return formats[extension] || extension.replace(".", "").toUpperCase() || "未知";
  }

  function formatLoadedTime(date) {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function formatMeasureDistance(value) {
    const distance = Number(value || 0);
    const maximumFractionDigits = distance < 1 ? 4 : distance < 100 ? 3 : 2;
    return `${distance.toLocaleString("zh-CN", { maximumFractionDigits })} 模型单位`;
  }

  function formatMeasureAxis(value) {
    const number = Number(value || 0);
    const maximumFractionDigits = Math.abs(number) < 1 ? 4 : Math.abs(number) < 100 ? 3 : 2;
    return number.toLocaleString("zh-CN", { maximumFractionDigits });
  }

  function formatMeasureVector(delta) {
    return `X ${formatMeasureAxis(delta.x)}, Y ${formatMeasureAxis(delta.y)}, Z ${formatMeasureAxis(delta.z)}`;
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
  }

  function formatError(error) {
    const message = error?.message || String(error);
    if (/Unable to load|404|Not Found/i.test(message)) {
      return "模型资源不完整，请同时选择 .gltf 关联的 .bin / 贴图文件，或使用文件夹导入。";
    }
    return `加载失败：${message}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
