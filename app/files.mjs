export function createFileTools(config) {
  const {
    els,
    state,
    BABYLON,
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
  } = config;

  const resourceTools = {
    getReferencedResourcePaths: () => new Set(),
    normalizeResourcePath: (value) => value
  };

  function setResourceTools(tools) {
    if (typeof tools.getReferencedResourcePaths === "function") {
      resourceTools.getReferencedResourcePaths = tools.getReferencedResourcePaths;
    }
    if (typeof tools.normalizeResourcePath === "function") {
      resourceTools.normalizeResourcePath = tools.normalizeResourcePath;
    }
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
    const referencedPaths = resourceTools.getReferencedResourcePaths(state.resourceDiagnostics);
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
          const isReferenced = referencedPaths.has(resourceTools.normalizeResourcePath(entry.path));
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

  return {
    setResourceTools,
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
    getRecent,
    updateActiveTreeFile
  };
}
