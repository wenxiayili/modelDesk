use base64::{engine::general_purpose, Engine as _};
use serde::Serialize;
use std::{
    env, fs,
    path::{Path, PathBuf},
};
use tauri::{Emitter, Manager};

const MODEL_EXTENSIONS: &[&str] = &["glb", "gltf", "obj", "stl", "fbx", "babylon"];
const PACKAGE_EXTENSIONS: &[&str] = &[
    "glb", "gltf", "obj", "stl", "fbx", "babylon", "bin", "mtl", "png", "jpg", "jpeg", "webp",
    "bmp", "tga", "dds", "ktx", "ktx2", "env", "hdr",
];
const MAX_PACKAGE_FILES: usize = 500;
const MAX_PACKAGE_BYTES: u64 = 256 * 1024 * 1024;
const MAX_SCAN_DEPTH: usize = 3;
const OPEN_MODEL_PACKAGE_EVENT: &str = "modeldesk-open-model-package";

#[derive(Clone, Serialize)]
struct ModelPackage {
    source_path: String,
    main_file: String,
    files: Vec<ModelPackageFile>,
    total_bytes: u64,
    truncated: bool,
}

#[derive(Clone, Serialize)]
struct ModelPackageFile {
    name: String,
    relative_path: String,
    size: u64,
    data_base64: String,
}

#[derive(Clone, Serialize)]
struct OpenModelPackageEvent {
    model_package: Option<ModelPackage>,
    error: Option<String>,
}

#[tauri::command]
fn get_launch_model_package() -> Result<Option<ModelPackage>, String> {
    let args = env::args_os().skip(1).map(PathBuf::from);
    let Some(path) = find_model_path(args, None) else {
        return Ok(None);
    };

    read_model_package(&path).map(Some)
}

#[tauri::command]
fn open_model_package_from_path(path: String) -> Result<ModelPackage, String> {
    let path = PathBuf::from(path);
    if !path.is_file() {
        return Err(format!("Model file does not exist: {}", path.display()));
    }
    if !is_model_file(&path) {
        return Err(format!("Unsupported model file: {}", path.display()));
    }

    read_model_package(&path)
}

#[tauri::command]
async fn open_model_package_from_folder() -> Result<Option<ModelPackage>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let Some(folder) = rfd::FileDialog::new()
            .set_title("选择模型文件夹")
            .pick_folder()
        else {
            return Ok(None);
        };

        read_model_package_from_folder(&folder).map(Some)
    })
    .await
    .map_err(|error| format!("Cannot open folder dialog: {error}"))?
}

#[tauri::command]
async fn save_png_with_dialog(data: String, name: String) -> Result<Option<String>, String> {
    let file_name = sanitize_png_file_name(&name);
    tauri::async_runtime::spawn_blocking(move || {
        let Some(mut path) = rfd::FileDialog::new()
            .set_title("保存截图")
            .set_file_name(&file_name)
            .add_filter("PNG Image", &["png"])
            .save_file()
        else {
            return Ok(None);
        };

        if path.extension().is_none() {
            path.set_extension("png");
        }

        let bytes = general_purpose::STANDARD
            .decode(data)
            .map_err(|error| format!("Cannot decode PNG data: {error}"))?;
        fs::write(&path, bytes)
            .map_err(|error| format!("Cannot write screenshot to {}: {error}", path.display()))?;

        Ok(Some(path.display().to_string()))
    })
    .await
    .map_err(|error| format!("Cannot open save dialog: {error}"))?
}

#[tauri::command]
async fn save_text_with_dialog(data: String, name: String) -> Result<Option<String>, String> {
    let file_name = sanitize_markdown_file_name(&name);
    tauri::async_runtime::spawn_blocking(move || {
        let Some(mut path) = rfd::FileDialog::new()
            .set_title("保存资源健康报告")
            .set_file_name(&file_name)
            .add_filter("Markdown", &["md"])
            .add_filter("Text", &["txt"])
            .save_file()
        else {
            return Ok(None);
        };

        if path.extension().is_none() {
            path.set_extension("md");
        }

        fs::write(&path, data.as_bytes())
            .map_err(|error| format!("Cannot write report to {}: {error}", path.display()))?;

        Ok(Some(path.display().to_string()))
    })
    .await
    .map_err(|error| format!("Cannot open save dialog: {error}"))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            handle_second_instance(app, args, cwd);
        }))
        .invoke_handler(tauri::generate_handler![
            get_launch_model_package,
            open_model_package_from_path,
            open_model_package_from_folder,
            save_png_with_dialog,
            save_text_with_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while running ModelDesk");
}

fn handle_second_instance(app: &tauri::AppHandle, args: Vec<String>, cwd: String) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }

    let cwd_path = PathBuf::from(&cwd);
    let payload = match find_model_path(args.iter().map(PathBuf::from), Some(&cwd_path)) {
        Some(path) => match read_model_package(&path) {
            Ok(model_package) => OpenModelPackageEvent {
                model_package: Some(model_package),
                error: None,
            },
            Err(error) => OpenModelPackageEvent {
                model_package: None,
                error: Some(error),
            },
        },
        None => OpenModelPackageEvent {
            model_package: None,
            error: None,
        },
    };

    let _ = app.emit(OPEN_MODEL_PACKAGE_EVENT, payload);
}

fn read_model_package(main_path: &Path) -> Result<ModelPackage, String> {
    let main_path = main_path
        .canonicalize()
        .map_err(|error| format!("Cannot resolve model path: {error}"))?;
    let base_dir = main_path
        .parent()
        .ok_or_else(|| "Cannot determine model directory".to_string())?;
    read_model_package_from_base(&main_path, base_dir)
}

fn read_model_package_from_folder(folder: &Path) -> Result<ModelPackage, String> {
    let base_dir = folder
        .canonicalize()
        .map_err(|error| format!("Cannot resolve folder path: {error}"))?;
    if !base_dir.is_dir() {
        return Err(format!("Folder does not exist: {}", base_dir.display()));
    }

    let mut candidates = Vec::new();
    collect_package_candidates(&base_dir, &base_dir, 0, &mut candidates)?;
    candidates.sort();
    candidates.dedup();

    let main_path = pick_main_model_candidate(&candidates)
        .ok_or_else(|| format!("No supported model file found in {}", base_dir.display()))?;
    read_model_package_from_base(&main_path, &base_dir)
}

fn read_model_package_from_base(main_path: &Path, base_dir: &Path) -> Result<ModelPackage, String> {
    let main_path = main_path
        .canonicalize()
        .map_err(|error| format!("Cannot resolve model path: {error}"))?;
    let base_dir = base_dir
        .canonicalize()
        .map_err(|error| format!("Cannot resolve model base folder: {error}"))?;
    let main_relative = relative_slash_path(&base_dir, &main_path)?;
    let mut candidates = Vec::new();

    collect_package_candidates(&base_dir, &base_dir, 0, &mut candidates)?;
    candidates.sort();
    candidates.dedup();

    if !candidates.iter().any(|path| path == &main_path) {
        candidates.insert(0, main_path.clone());
    }

    let mut files = Vec::new();
    let mut total_bytes: u64 = 0;
    let mut truncated = false;

    for path in candidates {
        if files.len() >= MAX_PACKAGE_FILES {
            truncated = true;
            break;
        }

        let metadata = fs::metadata(&path)
            .map_err(|error| format!("Cannot read metadata for {}: {error}", path.display()))?;
        let size = metadata.len();
        if total_bytes.saturating_add(size) > MAX_PACKAGE_BYTES {
            truncated = true;
            break;
        }

        let bytes =
            fs::read(&path).map_err(|error| format!("Cannot read {}: {error}", path.display()))?;
        let relative_path = relative_slash_path(&base_dir, &path)?;
        let name = path
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or_else(|| format!("Invalid file name: {}", path.display()))?
            .to_string();

        total_bytes += size;
        files.push(ModelPackageFile {
            name,
            relative_path,
            size,
            data_base64: general_purpose::STANDARD.encode(bytes),
        });
    }

    Ok(ModelPackage {
        source_path: main_path.display().to_string(),
        main_file: main_relative,
        files,
        total_bytes,
        truncated,
    })
}

fn pick_main_model_candidate(candidates: &[PathBuf]) -> Option<PathBuf> {
    candidates
        .iter()
        .filter(|path| is_model_file(path))
        .min_by_key(|path| {
            (
                model_extension_rank(path),
                path.components().count(),
                path.display().to_string().to_lowercase(),
            )
        })
        .cloned()
}

fn model_extension_rank(path: &Path) -> usize {
    path.extension()
        .and_then(|extension| extension.to_str())
        .and_then(|extension| {
            MODEL_EXTENSIONS
                .iter()
                .position(|allowed| extension.eq_ignore_ascii_case(allowed))
        })
        .unwrap_or(MODEL_EXTENSIONS.len())
}

fn find_model_path<I>(paths: I, cwd: Option<&Path>) -> Option<PathBuf>
where
    I: IntoIterator<Item = PathBuf>,
{
    paths.into_iter().find_map(|path| {
        let candidate = resolve_candidate_path(path, cwd);
        if candidate.is_file() && is_model_file(&candidate) {
            Some(candidate)
        } else {
            None
        }
    })
}

fn resolve_candidate_path(path: PathBuf, cwd: Option<&Path>) -> PathBuf {
    if path.is_absolute() {
        path
    } else if let Some(cwd) = cwd {
        cwd.join(path)
    } else {
        path
    }
}

fn sanitize_png_file_name(name: &str) -> String {
    let mut sanitized = name
        .chars()
        .map(|character| match character {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
            character if character.is_control() => '_',
            character => character,
        })
        .collect::<String>()
        .trim()
        .to_string();

    if sanitized.is_empty() {
        sanitized = "modeldesk-view.png".to_string();
    }
    if !sanitized.to_ascii_lowercase().ends_with(".png") {
        sanitized.push_str(".png");
    }
    sanitized
}

fn sanitize_markdown_file_name(name: &str) -> String {
    let mut sanitized = name
        .chars()
        .map(|character| match character {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
            character if character.is_control() => '_',
            character => character,
        })
        .collect::<String>()
        .trim()
        .to_string();

    if sanitized.is_empty() {
        sanitized = "modeldesk-resource-report.md".to_string();
    }
    if !sanitized.to_ascii_lowercase().ends_with(".md")
        && !sanitized.to_ascii_lowercase().ends_with(".txt")
    {
        sanitized.push_str(".md");
    }
    sanitized
}

fn collect_package_candidates(
    base_dir: &Path,
    directory: &Path,
    depth: usize,
    candidates: &mut Vec<PathBuf>,
) -> Result<(), String> {
    if depth > MAX_SCAN_DEPTH || candidates.len() >= MAX_PACKAGE_FILES {
        return Ok(());
    }

    for entry in fs::read_dir(directory)
        .map_err(|error| format!("Cannot scan {}: {error}", directory.display()))?
    {
        let entry = entry.map_err(|error| format!("Cannot scan directory entry: {error}"))?;
        let path = entry.path();
        let metadata = entry
            .metadata()
            .map_err(|error| format!("Cannot read metadata for {}: {error}", path.display()))?;

        if metadata.is_dir() {
            collect_package_candidates(base_dir, &path, depth + 1, candidates)?;
        } else if metadata.is_file() && is_package_file(&path) {
            candidates.push(
                path.canonicalize()
                    .map_err(|error| format!("Cannot resolve {}: {error}", path.display()))?,
            );
        }

        if candidates.len() >= MAX_PACKAGE_FILES {
            break;
        }
    }

    let _ = base_dir;
    Ok(())
}

fn is_model_file(path: &Path) -> bool {
    extension_matches(path, MODEL_EXTENSIONS)
}

fn is_package_file(path: &Path) -> bool {
    extension_matches(path, PACKAGE_EXTENSIONS)
}

fn extension_matches(path: &Path, allowed: &[&str]) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| {
            allowed
                .iter()
                .any(|allowed| extension.eq_ignore_ascii_case(allowed))
        })
        .unwrap_or(false)
}

fn relative_slash_path(base_dir: &Path, path: &Path) -> Result<String, String> {
    let relative = path
        .strip_prefix(base_dir)
        .map_err(|error| format!("Cannot make relative path for {}: {error}", path.display()))?;

    Ok(relative
        .components()
        .map(|component| component.as_os_str().to_string_lossy())
        .collect::<Vec<_>>()
        .join("/"))
}
