export function createSceneRuntime(config) {
  const {
    els,
    state,
    BABYLON,
    applyLightingControls,
    loadStudioEnvironment,
    beginDrawCallFrame,
    readDrawCallFrame,
    updateMeasureLabel,
    formatCount,
    getDrawCallCount,
    updateViewportHud
  } = config;

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

  return {
    initScene
  };
}
