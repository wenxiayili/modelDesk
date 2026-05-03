export function createSceneMeshTools(config) {
  const {
    els,
    state,
    BABYLON,
    calculateMeshBounds,
    applyVisibilityState,
    clearMaterialHighlight,
    renderMaterials,
    getActiveMaterials,
    formatCount,
    escapeHtml,
    setStatus
  } = config;

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

  return {
    renderMeshes,
    handleMeshListClick,
    clearSceneHighlight,
    getRenderableMeshes,
    getMeshId,
    isMeshVisible
  };
}
