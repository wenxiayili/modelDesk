export function createMaterialTools(config) {
  const {
    els,
    state,
    BABYLON,
    formatCount,
    escapeHtml,
    shortName,
    hexToColor3,
    getRenderableMeshes,
    calculateMeshBounds,
    renderMeshes,
    clearSceneHighlight,
    setStatus
  } = config;

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

  function getActiveMaterials() {
    if (!state.activeContainer) return [];
    const materials = new Set();
    state.activeContainer.materials.forEach((material) => materials.add(material));
    getRenderableMeshes().forEach((mesh) => {
      if (mesh.material) materials.add(mesh.material);
    });
    return Array.from(materials);
  }

  function isMeshVisible(mesh) {
    return state.meshVisibility.get(String(mesh.uniqueId)) !== false;
  }

  return {
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
  };
}
