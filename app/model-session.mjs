export function createModelSessionTools(config) {
  const {
    els,
    state,
    BABYLON,
    getExtension,
    formatCount,
    formatNumber,
    describeModelFormat,
    formatLoadedTime,
    formatBytes,
    formatError,
    pickMainModel,
    buildProjectProfile,
    renderProjectSummary,
    buildPackageOnlyDiagnostics,
    renderResourceDiagnostics,
    renderFileTree,
    getFileDisplayPath,
    analyzeModelResources,
    registerLocalFiles,
    loadFbxAssetContainer,
    handleProgress,
    setProgress,
    hideProgress,
    setStatus,
    setInfo,
    setFooterMetrics,
    updateViewChip,
    updateActiveTreeFile,
    setPanMode,
    setMeasureMode,
    clearMeasurement,
    resetAnimations,
    clearMaterialHighlight,
    clearSceneHighlight,
    setupAnimations,
    fitCamera,
    augmentResourceDiagnosticsWithRuntime,
    renderMeshes,
    renderMaterials,
    renderMeasurePanel,
    getRenderableMeshes,
    getActiveMaterials,
    captureMaterialDefaults
  } = config;

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

  return {
    loadFileList,
    clearActiveModel,
    calculateBounds,
    calculateMeshBounds,
    isPickableModelMesh
  };
}
