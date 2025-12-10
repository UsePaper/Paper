mod commands;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_devtools::init());
    #[cfg(not(debug_assertions))]
    let builder = tauri::Builder::default();

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle();

            // Paper (App Menu)
            let paper_menu = Submenu::new(handle, "Paper", true)?;
            let about = PredefinedMenuItem::about(handle, None, None)?;
            let settings =
                MenuItem::with_id(handle, "settings", "Preferences", true, None::<&str>)?;
            let hide = PredefinedMenuItem::hide(handle, None)?;
            let quit = MenuItem::with_id(handle, "quit", "Quit Paper", true, Some("cmd+q"))?;
            paper_menu.append_items(&[&about, &settings, &hide, &quit])?;

            // File
            let file_menu = Submenu::new(handle, "File", true)?;
            let new_item = MenuItem::with_id(handle, "new", "New", true, Some("cmd+n"))?;
            let open_item = MenuItem::with_id(handle, "open", "Open", true, Some("cmd+o"))?;
            let save_item = MenuItem::with_id(handle, "save", "Save", true, Some("cmd+s"))?;
            let save_as_item =
                MenuItem::with_id(handle, "save_as", "Save As", true, Some("cmd+shift+s"))?;
            let close_item = PredefinedMenuItem::close_window(handle, None)?;
            file_menu.append_items(&[
                &new_item,
                &open_item,
                &save_item,
                &save_as_item,
                &close_item,
            ])?;

            // Edit
            let edit_menu = Submenu::new(handle, "Edit", true)?;
            let undo = PredefinedMenuItem::undo(handle, None)?;
            let redo = PredefinedMenuItem::redo(handle, None)?;
            let cut = PredefinedMenuItem::cut(handle, None)?;
            let copy = PredefinedMenuItem::copy(handle, None)?;
            let paste = PredefinedMenuItem::paste(handle, None)?;
            let select_all = PredefinedMenuItem::select_all(handle, None)?;
            edit_menu.append_items(&[&undo, &redo, &cut, &copy, &paste, &select_all])?;

            // View
            let view_menu = Submenu::new(handle, "View", true)?;
            let toggle_status = MenuItem::with_id(
                handle,
                "toggle_status_bar",
                "Toggle Status Bar",
                true,
                None::<&str>,
            )?;
            view_menu.append_items(&[&toggle_status])?;

            // Create the menu
            let menu =
                Menu::with_items(handle, &[&paper_menu, &file_menu, &edit_menu, &view_menu])?;
            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                let id = event.id();
                if id == "new"
                    || id == "open"
                    || id == "save"
                    || id == "save_as"
                    || id == "settings"
                    || id == "toggle_status_bar"
                    || id == "quit"
                {
                    app.emit("menu-event", id.as_ref()).unwrap();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::write_file,
            commands::show_open_dialog,
            commands::show_save_dialog,
            commands::load_settings,
            commands::save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
