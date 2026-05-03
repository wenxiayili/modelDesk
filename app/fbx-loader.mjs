export function createFbxLoaderTools(config) {
  const {
    state,
    BABYLON,
    setProgress
  } = config;

  let fbxLoaderPromise = null;

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

  return {
    loadFbxAssetContainer
  };
}
