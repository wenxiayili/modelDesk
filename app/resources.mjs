export function createResourceTools(config) {
  const {
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
  } = config;

  async function analyzeModelResources(files, mainFile) {
    const diagnostics = createResourceDiagnostics(files, mainFile);
    const extension = getExtension(mainFile.name);
    const index = buildResourceIndex(files);

    try {
      if (extension === ".gltf") {
        const gltf = JSON.parse(await mainFile.text());
        collectGltfResourceReferences(gltf).forEach((reference) => {
          recordResourceReference(diagnostics, reference, index, dirnameResourcePath(getFileDisplayPath(mainFile)));
        });
        diagnostics.applicable = true;
      } else if (extension === ".obj") {
        await analyzeObjResources(files, mainFile, diagnostics, index);
        diagnostics.applicable = true;
      } else if (extension === ".babylon") {
        const scene = JSON.parse(await mainFile.text());
        collectBabylonResourceReferences(scene).forEach((reference) => {
          recordResourceReference(diagnostics, reference, index, dirnameResourcePath(getFileDisplayPath(mainFile)));
        });
        diagnostics.applicable = true;
      } else if (extension === ".glb") {
        diagnostics.applicable = false;
        diagnostics.note = "GLB 通常已内嵌网格、材质和贴图资源";
      } else {
        diagnostics.applicable = false;
        diagnostics.note = "当前格式没有可静态解析的外部资源清单";
      }
    } catch (error) {
      diagnostics.applicable = true;
      diagnostics.error = `资源诊断失败：${error?.message || error}`;
    }

    diagnostics.unused = findUnusedPackageResources(files, mainFile, diagnostics);
    finalizeResourceDiagnostics(diagnostics);
    return diagnostics;
  }

  function buildPackageOnlyDiagnostics(files) {
    const diagnostics = createResourceDiagnostics(files, null);
    diagnostics.note = "已导入资源包，但没有找到可加载的模型文件";
    diagnostics.unused = findUnusedPackageResources(files, null, diagnostics);
    finalizeResourceDiagnostics(diagnostics);
    return diagnostics;
  }

  function createResourceDiagnostics(files, mainFile) {
    return {
      applicable: false,
      total: 0,
      healthScore: 100,
      healthStatus: "未检查",
      found: [],
      missing: [],
      unused: [],
      embedded: 0,
      remote: 0,
      warnings: [],
      error: null,
      note: "",
      runtime: null,
      stats: buildProjectProfile(files, mainFile),
      summary: ""
    };
  }

  function collectGltfResourceReferences(gltf) {
    const references = [];
    (gltf.buffers || []).forEach((buffer, index) => {
      pushResourceReference(references, buffer?.uri, "缓冲", `buffers[${index}]`);
    });
    (gltf.images || []).forEach((image, index) => {
      pushResourceReference(references, image?.uri, "贴图", `images[${index}]`);
    });
    return dedupeResourceReferences(references);
  }

  function collectBabylonResourceReferences(scene) {
    const references = [];
    (scene.textures || []).forEach((texture, index) => {
      pushResourceReference(references, texture?.name || texture?.url, "贴图", `textures[${index}]`);
    });
    (scene.cubeTextures || []).forEach((texture, index) => {
      pushResourceReference(references, texture?.name || texture?.url, "环境", `cubeTextures[${index}]`);
    });
    return dedupeResourceReferences(references);
  }

  async function analyzeObjResources(files, mainFile, diagnostics, index) {
    const objText = await mainFile.text();
    const mainDir = dirnameResourcePath(getFileDisplayPath(mainFile));
    const libraries = parseObjMaterialLibraries(objText);

    if (!libraries.length) {
      diagnostics.note = "OBJ 未声明 .mtl 材质库";
      return;
    }

    for (const library of libraries) {
      const materialRecord = recordResourceReference(
        diagnostics,
        { uri: library, kind: "材质库", source: mainFile.name },
        index,
        mainDir
      );
      if (!materialRecord?.file) continue;

      try {
        const materialText = await materialRecord.file.text();
        const materialDir = dirnameResourcePath(materialRecord.matchedPath || materialRecord.expectedPath);
        parseMtlTextureReferences(materialText, materialRecord.uri).forEach((reference) => {
          recordResourceReference(diagnostics, reference, index, materialDir);
        });
      } catch (error) {
        diagnostics.warnings.push({
          kind: "材质库",
          uri: library,
          message: `无法读取材质库：${error?.message || error}`
        });
      }
    }
  }

  function parseObjMaterialLibraries(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^mtllib\s+/i.test(line))
      .flatMap((line) => line.replace(/^mtllib\s+/i, "").split(/\s+/))
      .filter(Boolean);
  }

  function parseMtlTextureReferences(text, source) {
    const textureKeys = new Set([
      "map_ka",
      "map_kd",
      "map_ks",
      "map_ke",
      "map_ns",
      "map_d",
      "map_bump",
      "bump",
      "disp",
      "decal",
      "norm",
      "refl"
    ]);
    const references = [];
    String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const parts = line.split(/\s+/);
        const key = parts.shift()?.toLowerCase();
        if (!textureKeys.has(key)) return;
        const uri = extractMtlTextureUri(parts);
        pushResourceReference(references, uri, "贴图", source);
      });
    return dedupeResourceReferences(references);
  }

  function extractMtlTextureUri(parts) {
    const values = Array.from(parts || []);
    if (!values.length) return "";
    for (let index = values.length - 1; index >= 0; index -= 1) {
      const token = values[index];
      if (token && !token.startsWith("-")) return values.slice(index).join(" ");
    }
    return values[values.length - 1] || "";
  }

  function pushResourceReference(references, uri, kind, source) {
    if (!uri || typeof uri !== "string") return;
    const cleaned = cleanResourceUri(uri);
    if (!cleaned) return;
    references.push({ uri: cleaned, kind, source });
  }

  function dedupeResourceReferences(references) {
    const seen = new Set();
    return references.filter((reference) => {
      const key = `${reference.kind}|${reference.uri}|${reference.source || ""}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function recordResourceReference(diagnostics, reference, index, baseDir) {
    if (isEmbeddedResource(reference.uri)) {
      diagnostics.embedded += 1;
      return null;
    }
    if (isRemoteResource(reference.uri)) {
      diagnostics.remote += 1;
      return null;
    }

    const expectedPath = normalizeResourcePath(joinResourcePath(baseDir, reference.uri));
    const exactFile = index.byPath.get(expectedPath);
    const fallbackName = normalizeResourcePath(shortName(reference.uri));
    const nameMatches = index.byName.get(fallbackName) || [];
    const fallbackFile = !exactFile && nameMatches.length === 1 ? nameMatches[0] : null;
    const file = exactFile || fallbackFile;
    const record = {
      ...reference,
      expectedPath,
      matchedPath: file ? normalizeResourcePath(getFileDisplayPath(file)) : "",
      matchType: exactFile ? "路径" : fallbackFile ? "文件名" : "",
      file: file || null,
      suggestion: ""
    };
    record.suggestion = buildResourceSuggestion(record);

    if (file && fallbackFile) {
      diagnostics.warnings.push({
        kind: reference.kind || "资源",
        uri: reference.uri,
        message: `${shortName(reference.uri)} 通过文件名匹配，建议修正引用路径或移动到 ${expectedPath}`
      });
    }

    if (file) {
      diagnostics.found.push(record);
    } else {
      diagnostics.missing.push(record);
    }
    return record;
  }

  function buildResourceSuggestion(record) {
    if (!record) return "";
    const expectedPath = record.expectedPath || record.uri || "";
    const expectedDir = dirnameResourcePath(expectedPath);
    const fileName = shortName(record.uri || expectedPath);
    if (record.file && record.matchType === "文件名" && record.matchedPath) {
      return `当前文件在 ${record.matchedPath}，建议移动到 ${expectedPath}，或把模型引用路径改为 ${record.matchedPath}`;
    }
    if (record.file) {
      return "资源可用";
    }
    if (expectedDir) {
      return `把 ${fileName} 放入 ${expectedDir}，或重新选择包含该资源的完整文件夹`;
    }
    return `把 ${fileName} 放到模型同级目录，或重新选择完整资源包`;
  }

  function findUnusedPackageResources(files, mainFile, diagnostics) {
    const usedPaths = new Set();
    if (mainFile) {
      usedPaths.add(normalizeResourcePath(getFileDisplayPath(mainFile)));
    }
    (diagnostics?.found || []).forEach((item) => {
      const path = normalizeResourcePath(item.matchedPath || item.expectedPath);
      if (path) usedPaths.add(path);
    });

    return Array.from(files || [])
      .filter((file) => isPackageResourceFile(file))
      .map((file) => {
        const path = normalizeResourcePath(getFileDisplayPath(file));
        return {
          name: file.name,
          path,
          kind: describeResourceKind(file),
          size: file.size || 0
        };
      })
      .filter((item) => item.path && !usedPaths.has(item.path))
      .sort((left, right) => right.size - left.size);
  }

  function isPackageResourceFile(file) {
    const extension = getExtension(file?.name || "");
    return (
      textureExtensions.includes(extension) ||
      materialExtensions.includes(extension) ||
      bufferExtensions.includes(extension) ||
      environmentExtensions.includes(extension)
    );
  }

  function describeResourceKind(file) {
    const extension = getExtension(file?.name || "");
    if (environmentExtensions.includes(extension)) return "环境";
    if (textureExtensions.includes(extension)) return "贴图";
    if (materialExtensions.includes(extension)) return "材质库";
    if (bufferExtensions.includes(extension)) return "缓冲";
    return "资源";
  }

  function buildResourceIndex(files) {
    const byPath = new Map();
    const byName = new Map();
    Array.from(files || []).forEach((file) => {
      const path = normalizeResourcePath(getFileDisplayPath(file));
      const name = normalizeResourcePath(file.name);
      if (path) byPath.set(path, file);
      if (!byName.has(name)) byName.set(name, []);
      byName.get(name).push(file);
    });
    return { byPath, byName };
  }

  function augmentResourceDiagnosticsWithRuntime(diagnostics, container) {
    if (!diagnostics || !container) return;
    const textures = collectRuntimeTextures(container);
    diagnostics.runtime = {
      textures: textures.length,
      materials: container.materials?.length || 0
    };
    finalizeResourceDiagnostics(diagnostics);
  }

  function collectRuntimeTextures(container) {
    const textures = new Map();
    (container.materials || []).forEach((material) => {
      (material.getActiveTextures?.() || []).forEach((texture) => {
        const key = texture.uniqueId || texture.name || texture.url || texture._texture?.url;
        if (key) textures.set(key, texture);
      });
    });
    return Array.from(textures.values());
  }

  function finalizeResourceDiagnostics(diagnostics) {
    diagnostics.total = diagnostics.found.length + diagnostics.missing.length;
    diagnostics.healthScore = calculateResourceHealthScore(diagnostics);
    diagnostics.healthStatus = getResourceHealthStatus(diagnostics, diagnostics.healthScore);
    diagnostics.summary = summarizeResourceDiagnostics(diagnostics);
    return diagnostics;
  }

  function calculateResourceHealthScore(diagnostics) {
    if (diagnostics.error) return 0;
    const missingPenalty = Math.min((diagnostics.missing?.length || 0) * 24, 72);
    const warningPenalty = Math.min((diagnostics.warnings?.length || 0) * 6, 18);
    const unusedPenalty = Math.min((diagnostics.unused?.length || 0) * 2, 10);
    return Math.max(0, 100 - missingPenalty - warningPenalty - unusedPenalty);
  }

  function getResourceHealthStatus(diagnostics) {
    if (diagnostics.error) return "诊断失败";
    if (diagnostics.missing?.length) return "需要补齐";
    if (diagnostics.warnings?.length) return "需要确认";
    if (diagnostics.unused?.length) return "可清理";
    if (diagnostics.total || diagnostics.runtime?.textures || diagnostics.stats?.totalFiles) return "通过";
    return "未检查";
  }

  function summarizeResourceDiagnostics(diagnostics) {
    if (diagnostics.error) return diagnostics.error;
    if (diagnostics.missing.length) {
      return `缺失 ${formatCount(diagnostics.missing.length)} / ${formatCount(diagnostics.total)} 个外部资源`;
    }
    if (diagnostics.unused?.length) {
      return `资源完整，发现 ${formatCount(diagnostics.unused.length)} 个未引用资源`;
    }
    if (diagnostics.total) {
      return `资源完整，${formatCount(diagnostics.total)} 个外部资源可用`;
    }
    if (diagnostics.runtime?.textures) {
      return `未发现外部缺失，运行时贴图 ${formatCount(diagnostics.runtime.textures)} 个`;
    }
    return diagnostics.note || "未发现外部资源引用";
  }

  function isEmbeddedResource(uri) {
    return /^data:/i.test(uri);
  }

  function isRemoteResource(uri) {
    return /^(blob:|https?:\/\/|file:)/i.test(uri);
  }

  function cleanResourceUri(uri) {
    const clean = String(uri || "").split("#")[0].split("?")[0].replaceAll("\\", "/").trim();
    try {
      return decodeURIComponent(clean);
    } catch {
      return clean;
    }
  }

  function dirnameResourcePath(path) {
    const normalized = normalizeResourcePath(path);
    const slash = normalized.lastIndexOf("/");
    return slash >= 0 ? normalized.slice(0, slash) : "";
  }

  function joinResourcePath(base, relative) {
    return [base, relative].filter(Boolean).join("/");
  }

  function normalizeResourcePath(path) {
    const parts = String(path || "")
      .replaceAll("\\", "/")
      .split("/")
      .filter((part) => part && part !== ".");
    const normalized = [];
    parts.forEach((part) => {
      if (part === "..") {
        normalized.pop();
      } else {
        normalized.push(part);
      }
    });
    return normalized.join("/").toLowerCase();
  }

  function renderResourceDiagnostics(diagnostics) {
    if (!els.resourceSummary || !els.resourceList) return;

    const missingCount = diagnostics?.missing?.length || 0;
    const warningCount = diagnostics?.warnings?.length || 0;
    const unusedCount = diagnostics?.unused?.length || 0;
    if (els.resourcePanelTitle) {
      els.resourcePanelTitle.textContent = missingCount
        ? `资源 (${formatCount(missingCount)})`
        : unusedCount
          ? `资源 (${formatCount(unusedCount)})`
          : "资源";
    }
    if (els.resourceReportButton) {
      els.resourceReportButton.disabled = !diagnostics;
    }

    els.resourceDiagnostics?.classList.toggle("has-warning", Boolean(missingCount || warningCount || diagnostics?.error));

    if (!diagnostics) {
      els.resourceSummary.innerHTML = `<strong>未载入模型</strong><span>选择模型或拖入文件夹后显示依赖诊断</span>`;
      els.resourceList.innerHTML = "";
      if (els.resourceReportButton) els.resourceReportButton.disabled = true;
      updateViewportHud();
      return;
    }

    els.resourceSummary.innerHTML = renderResourceSummary(diagnostics);

    const rows = [];
    if (diagnostics.error) {
      rows.push(renderResourceMessage("错误", diagnostics.error, "is-missing"));
    }
    rows.push(...diagnostics.missing.slice(0, 12).map((item) => renderResourceRow(item, "missing")));
    if (diagnostics.missing.length > 12) {
      rows.push(renderResourceMessage("缺失", `另有 ${formatCount(diagnostics.missing.length - 12)} 个缺失资源`, "is-muted"));
    }
    if (!diagnostics.missing.length) {
      rows.push(...diagnostics.found.slice(0, 8).map((item) => renderResourceRow(item, "found")));
    }
    rows.push(...diagnostics.warnings.slice(0, 4).map((item) => renderResourceMessage("提示", item.message, "is-warning")));
    rows.push(...diagnostics.unused.slice(0, 5).map((item) => renderUnusedResourceRow(item)));
    if (diagnostics.unused.length > 5) {
      rows.push(renderResourceMessage("未引用", `另有 ${formatCount(diagnostics.unused.length - 5)} 个资源未被当前模型引用`, "is-muted"));
    }

    els.resourceList.innerHTML = rows.join("");
    updateViewportHud();
  }

  function renderResourceSummary(diagnostics) {
    const stats = diagnostics.stats || {};
    const chips = [
      ["模型", stats.models],
      ["贴图", stats.textures],
      ["材质包", stats.materials],
      ["缓冲", stats.buffers],
      ["环境", stats.environments]
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `<span>${label} ${formatCount(value)}</span>`)
      .join("");
    const runtime = diagnostics.runtime?.textures
      ? `<span>运行时贴图 ${formatCount(diagnostics.runtime.textures)}</span>`
      : "";
    const embedded = diagnostics.embedded ? `<span>内嵌 ${formatCount(diagnostics.embedded)}</span>` : "";
    const remote = diagnostics.remote ? `<span>远程 ${formatCount(diagnostics.remote)}</span>` : "";
    const unused = diagnostics.unused?.length ? `<span>未引用 ${formatCount(diagnostics.unused.length)}</span>` : "";
    const health = `<span>健康 ${formatCount(diagnostics.healthScore)} · ${escapeHtml(diagnostics.healthStatus)}</span>`;
    return `<strong>${escapeHtml(diagnostics.summary || "资源诊断完成")}</strong>
      <small>${escapeHtml(stats.rootName || "当前资源包")} · ${formatBytes(stats.totalBytes || 0)} / ${formatCount(stats.totalFiles || 0)} 个文件</small>
      <div class="resource-metrics">${health}${chips}${runtime}${embedded}${remote}${unused}</div>`;
  }

  function renderResourceRow(item, status) {
    const found = status === "found";
    const classes = ["resource-row", found ? "is-found" : "is-missing"].join(" ");
    const label = found ? "正常" : "缺失";
    const detail = found
      ? `${item.kind || "资源"} · ${item.matchType || "路径"}匹配 · ${item.matchedPath || item.expectedPath}`
      : `${item.kind || "资源"} · 期望路径 ${item.expectedPath || item.uri}`;
    return `<div class="${classes}" title="${escapeHtml(detail)}">
      <span>${label}</span>
      <div>
        <strong>${escapeHtml(shortName(item.uri))}</strong>
        <small>${escapeHtml(detail)}</small>
        ${item.suggestion ? `<em class="resource-advice">${escapeHtml(item.suggestion)}</em>` : ""}
      </div>
    </div>`;
  }

  function renderUnusedResourceRow(item) {
    const detail = `${item.kind || "资源"} · ${item.path || item.name} · ${formatBytes(item.size || 0)}`;
    return `<div class="resource-row is-unused" title="${escapeHtml(detail)}">
      <span>未引用</span>
      <div>
        <strong>${escapeHtml(item.name || shortName(item.path))}</strong>
        <small>${escapeHtml(detail)}</small>
        <em class="resource-advice">当前模型没有引用它，可保留作备用，也可从交付包中移除以减小体积</em>
      </div>
    </div>`;
  }

  function renderResourceMessage(label, message, className) {
    return `<div class="resource-row ${className}">
      <span>${escapeHtml(label)}</span>
      <div><strong>${escapeHtml(message)}</strong></div>
    </div>`;
  }

  function buildResourceHealthReport(diagnostics, activeFile = null) {
    const stats = diagnostics.stats || {};
    const lines = [
      "# ModelDesk 资源健康报告",
      "",
      `- 生成时间：${new Date().toLocaleString()}`,
      `- 模型文件：${activeFile ? getFileDisplayPath(activeFile) : stats.mainFileName || "未加载"}`,
      `- 资源包：${stats.rootName || "当前资源包"}`,
      `- 健康状态：${diagnostics.healthStatus || "未检查"}`,
      `- 健康分：${formatCount(diagnostics.healthScore)}`,
      `- 文件总量：${formatCount(stats.totalFiles || 0)} 个，${formatBytes(stats.totalBytes || 0)}`,
      `- 外部引用：${formatCount(diagnostics.total || 0)} 个，正常 ${formatCount(diagnostics.found?.length || 0)}，缺失 ${formatCount(diagnostics.missing?.length || 0)}`,
      `- 未引用资源：${formatCount(diagnostics.unused?.length || 0)} 个`,
      ""
    ];

    if (diagnostics.note) {
      lines.push("## 说明", "", diagnostics.note, "");
    }
    if (diagnostics.error) {
      lines.push("## 诊断错误", "", diagnostics.error, "");
    }

    appendMarkdownTable(lines, "缺失资源", ["类型", "引用", "期望路径", "来源", "建议"], diagnostics.missing || [], (item) => [
      item.kind || "资源",
      item.uri || "",
      item.expectedPath || "",
      item.source || "",
      item.suggestion || buildResourceSuggestion(item)
    ]);

    appendMarkdownTable(lines, "路径提示", ["类型", "提示"], diagnostics.warnings || [], (item) => [
      item.kind || "提示",
      item.message || item.uri || ""
    ]);

    appendMarkdownTable(lines, "未引用资源", ["类型", "路径", "大小"], diagnostics.unused || [], (item) => [
      item.kind || "资源",
      item.path || item.name || "",
      formatBytes(item.size || 0)
    ]);

    appendMarkdownTable(lines, "正常引用", ["类型", "引用", "匹配路径", "匹配方式"], diagnostics.found || [], (item) => [
      item.kind || "资源",
      item.uri || "",
      item.matchedPath || item.expectedPath || "",
      item.matchType || "路径"
    ]);

    if (diagnostics.runtime) {
      lines.push("## 运行时统计", "");
      lines.push(`- 材质：${formatCount(diagnostics.runtime.materials || 0)}`);
      lines.push(`- 贴图：${formatCount(diagnostics.runtime.textures || 0)}`);
      lines.push("");
    }

    lines.push("## 判定口径", "");
    lines.push("- 缺失资源：模型文件显式引用，但当前导入包内未找到。");
    lines.push("- 未引用资源：当前导入包内存在贴图、材质库、缓冲或环境文件，但当前模型未显式引用。");
    lines.push("- 文件名匹配：路径不一致但文件名唯一匹配，建议整理目录或修正模型引用路径。");
    lines.push("");
    return `${lines.join("\n")}\n`;
  }

  function appendMarkdownTable(lines, title, headers, items, mapItem) {
    if (!items.length) return;
    lines.push(`## ${title}`, "");
    lines.push(`| ${headers.map(markdownCell).join(" | ")} |`);
    lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
    items.forEach((item) => {
      lines.push(`| ${mapItem(item).map(markdownCell).join(" | ")} |`);
    });
    lines.push("");
  }

  function markdownCell(value) {
    return String(value ?? "")
      .replace(/\r?\n/g, " ")
      .replace(/\|/g, "\\|")
      .trim();
  }

  function getReferencedResourcePaths(diagnostics) {
    const paths = new Set();
    (diagnostics?.found || []).forEach((item) => {
      const path = normalizeResourcePath(item.matchedPath || item.expectedPath);
      if (path) paths.add(path);
    });
    return paths;
  }

  return {
    analyzeModelResources,
    buildPackageOnlyDiagnostics,
    augmentResourceDiagnosticsWithRuntime,
    renderResourceDiagnostics,
    buildResourceHealthReport,
    getReferencedResourcePaths,
    normalizeResourcePath
  };
}
