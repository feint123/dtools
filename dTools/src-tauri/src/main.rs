#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod native;
pub mod clipboard;

use std::{sync::atomic::{AtomicBool, Ordering}};

use mouse_position::mouse_position::Mouse;

use native::{native_windows, create_main_window};
use tauri::{
    AppHandle, CustomMenuItem, LogicalSize, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, Window,
};
use tauri_plugin_sql::TauriSql;

use crate::clipboard::{write_clipboard, read_clipboard};



#[derive(serde::Serialize, Default)]
struct MousePosition {
    x: i32,
    y: i32,
}

impl MousePosition {
    fn new(x: i32, y: i32) -> Self {
        Self { x, y }
    }
}
// 全局获取当前的鼠标坐标
#[tauri::command]
fn mouse_position() -> Result<MousePosition, String> {
    let position = Mouse::get_mouse_position();
    match position {
        Mouse::Position { x, y } => return Ok(MousePosition::new(x, y)),
        Mouse::Error => Err("Cannot find mouse position".to_string()),
    }
}

fn main() {
    // 定义系统托盘
    let open_main = CustomMenuItem::new("open_main".to_string(), "打开主界面");
    let mut quit = CustomMenuItem::new("quit".to_string(), "退出");
    // let mut q_clipboard = CustomMenuItem::new("clipboard".to_string(), "快捷剪切板");
    let spotlight = CustomMenuItem::new("spotlight".to_string(), "进入Spotlight模式");
    // 设置菜单快捷键
    quit = quit.accelerator("Command+Q");
    // q_clipboard = q_clipboard.accelerator("CommandOrControl+SHIFT+V");
    // spotlight = spotlight.accelerator("Option+Space");
    let tray_menu = SystemTrayMenu::new()
        .add_item(open_main)
        // .add_item(q_clipboard)
        .add_item(spotlight)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .manage(SpotilightState(AtomicBool::new(false)))
        .setup(|app| {
            // 根据label获取窗口实例
            let window = create_main_window(&app.handle());
            // window.open_devtools();
            Ok(())
        })
        .plugin(TauriSql::default())
        .system_tray(system_tray)
        .on_system_tray_event(system_try_handler)
        .invoke_handler(tauri::generate_handler![
            read_clipboard,
            write_clipboard,
            mouse_position
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/**
 * 处理系统托盘菜单项的点接事件
 */
fn system_try_handler(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let item_handle = app.tray_handle().get_item(&id);
            match id.as_str() {
                // 退出
                "quit" => {
                    // TODO: do something before exsits
                    std::process::exit(0);
                }
                // 快捷搜索
                "spotlight" => {
                    let sl_state = app.state::<'_, SpotilightState>();
                    if !sl_state.0.load(Ordering::Relaxed) {
                        create_spotlight_window(app);
                        let main_window = app.get_window("main").unwrap();
                        main_window.hide().unwrap();
                        item_handle.set_title("退出Spotlight模式").unwrap();
                        sl_state.0.fetch_or(true, Ordering::Relaxed);
                    } else {
                        let window = app.get_window("spotlight").unwrap();
                        window.close().unwrap();
                        item_handle.set_title("进入Spotlight模式").unwrap();
                        sl_state.0.fetch_and(false, Ordering::Relaxed);
                        
                    }
                }
                "open_main" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            }
        }
        _ => {}
    }
}

#[derive(Default)]
struct SpotilightState(AtomicBool);

/**
 * 创建spotlight窗口
 */
fn create_spotlight_window(app: &AppHandle) -> Window {
    let spotlight_window = tauri::WindowBuilder::new(
        app,
        "spotlight", /* the unique window label */
        tauri::WindowUrl::App("spotlight.html".parse().unwrap()),
    )
    .transparent(true)
    .decorations(false)
    .resizable(false)
    .visible(false)
    .build()
    .expect("failed to build window");
    spotlight_window
        .set_size(LogicalSize::new(800, 60))
        .expect("failed to set size");
    native_windows(&spotlight_window, Some(10.), false);
    return spotlight_window;
}