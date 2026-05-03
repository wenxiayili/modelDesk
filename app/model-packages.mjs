export function createModelPackageTools(config) {
  const {
    els,
    state,
    getExtension,
    loadFileList,
    setStatus
  } = config;

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

  return {
    bindRuntimeOpenEvents,
    openModelFolder,
    loadLaunchModelPackage,
    loadModelPackage
  };
}
