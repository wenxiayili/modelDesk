export function getExtension(name) {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function stripExtension(name) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function formatCount(value) {
  return new Intl.NumberFormat("zh-CN").format(value || 0);
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

export function describeModelFormat(name) {
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

export function formatLoadedTime(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatMeasureDistance(value) {
  const distance = Number(value || 0);
  const maximumFractionDigits = distance < 1 ? 4 : distance < 100 ? 3 : 2;
  return `${distance.toLocaleString("zh-CN", { maximumFractionDigits })} 模型单位`;
}

export function formatMeasureAxis(value) {
  const number = Number(value || 0);
  const maximumFractionDigits = Math.abs(number) < 1 ? 4 : Math.abs(number) < 100 ? 3 : 2;
  return number.toLocaleString("zh-CN", { maximumFractionDigits });
}

export function formatMeasureVector(delta) {
  return `X ${formatMeasureAxis(delta.x)}, Y ${formatMeasureAxis(delta.y)}, Z ${formatMeasureAxis(delta.z)}`;
}

export function formatBytes(bytes) {
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

export function formatError(error) {
  const message = error?.message || String(error);
  if (/Unable to load|404|Not Found/i.test(message)) {
    return "模型资源不完整，请同时选择 .gltf 关联的 .bin / 贴图文件，或使用文件夹导入。";
  }
  return `加载失败：${message}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function shortName(value) {
  return String(value || "")
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .pop() || "Texture";
}
