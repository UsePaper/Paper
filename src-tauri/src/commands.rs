use std::fs;

use rfd::FileDialog;

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
