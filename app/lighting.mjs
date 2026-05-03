export function createLightingTools(config) {
  const {
    els,
    state,
    BABYLON,
    getExtension,
    setStatus,
    updateViewChip
  } = config;

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

  return {
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
  };
}
