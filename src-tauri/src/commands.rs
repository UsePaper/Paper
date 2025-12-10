use std::fs;
use std::path::PathBuf;

use rfd::FileDialog;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const SETTINGS_FILE: &str = "settings.json";

#[derive(Debug, Serialize, Deserialize)]
pub struct StoredSettings {
    pub font_family: String,
    pub font_size: f32,
    pub line_height: f32,
    pub content_width: f32,
    pub theme_mode: String,
}

/// Read a UTF-8 file from disk.
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|error| format!("Failed to read file: {}", error))
}

/// Write UTF-8 contents to disk, creating the file if it does not exist.
#[tauri::command]
pub fn write_file(path: String, contents: String) -> Result<(), String> {
    fs::write(&path, contents).map_err(|error| format!("Failed to write file: {}", error))
}

/// Show a native open dialog constrained to markdown-like files.
#[tauri::command]
pub fn show_open_dialog() -> Result<Option<String>, String> {
    let selected = FileDialog::new()
        .add_filter("Markdown", &["md", "markdown"])
        .pick_file();

    Ok(selected.map(|p| p.to_string_lossy().into_owned()))
}

/// Show a native save dialog with an optional default file name.
#[tauri::command]
pub fn show_save_dialog(default_file_name: Option<String>) -> Result<Option<String>, String> {
    let mut builder = FileDialog::new().add_filter("Markdown", &["md", "markdown"]);

    if let Some(default_name) = default_file_name {
        builder = builder.set_file_name(&default_name);
    }

    let selected = builder.save_file();

    Ok(selected.map(|p| p.to_string_lossy().into_owned()))
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut dir = app
        .path()
        .app_config_dir()
        .map_err(|err| format!("Unable to resolve config directory: {err}"))?;
    // Ensure our app config directory exists.
    fs::create_dir_all(&dir).map_err(|err| format!("Unable to create config directory: {err}"))?;
    dir.push(SETTINGS_FILE);
    Ok(dir)
}

/// Load persisted settings from the app config directory.
#[tauri::command]
pub fn load_settings(app: AppHandle) -> Result<Option<StoredSettings>, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }

    let contents =
        fs::read_to_string(&path).map_err(|err| format!("Failed to read settings: {err}"))?;
    let parsed: StoredSettings = serde_json::from_str(&contents)
        .map_err(|err| format!("Failed to parse settings: {err}"))?;
    Ok(Some(parsed))
}

/// Persist settings to the app config directory.
#[tauri::command]
pub fn save_settings(app: AppHandle, settings: StoredSettings) -> Result<(), String> {
    let path = settings_path(&app)?;
    let serialized = serde_json::to_string_pretty(&settings)
        .map_err(|err| format!("Failed to serialize settings: {err}"))?;
    fs::write(&path, serialized).map_err(|err| format!("Failed to write settings: {err}"))?;
    Ok(())
}
