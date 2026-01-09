//! 窗口管理模块

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::Manager;
use crate::config::get_config;

/// 窗口状态配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowState {
    pub width: f64,
    pub height: f64,
    pub x: i32,
    pub y: i32,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            width: 1024.0,
            height: 600.0,
            x: 100,
            y: 100,
        }
    }
}

/// 读取窗口状态
pub fn load_window_state(app: &tauri::AppHandle) -> WindowState {
    let config_path = match app.path().app_config_dir() {
        Ok(dir) => dir.join("window_state.json"),
        Err(_) => return WindowState::default(),
    };
    
    if config_path.exists() {
        match std::fs::read_to_string(&config_path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => WindowState::default(),
        }
    } else {
        WindowState::default()
    }
}

/// 保存窗口状态
pub fn save_window_state(app: &tauri::AppHandle, state: &WindowState) {
    let config_dir = match app.path().app_config_dir() {
        Ok(dir) => dir,
        Err(_) => return,
    };
    
    if !config_dir.exists() {
        let _ = std::fs::create_dir_all(&config_dir);
    }
    
    let config_path = config_dir.join("window_state.json");
    if let Ok(content) = serde_json::to_string_pretty(state) {
        let _ = std::fs::write(config_path, content);
    }
}

/// 生成唯一的窗口标签
fn generate_window_label() -> String {
    format!("tyminder-{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis())
}

/// 创建新窗口 - 所有窗口都是同级的，没有主窗口之分
/// file_path: 可选的文件路径，如果指定则在窗口初始化后打开该文件
/// is_temp: 是否是临时文件，如果是则打开后不设置文件路径，保存时弹出另存为对话框
pub fn create_window(app: &tauri::AppHandle, file_path: Option<&str>, is_temp: bool) -> tauri::Result<()> {
    let label = generate_window_label();
    
    // 读取保存的窗口状态
    let window_state = load_window_state(app);
    
    // 获取当前系统语言
    let locale = sys_locale::get_locale().unwrap_or_else(|| "en".to_string());
    
    // 读取用户配置
    let config = get_config(app.clone(), None).unwrap_or(json!({}));
    let lang = config.get("lang").and_then(|v| v.as_str()).unwrap_or("system");
    let theme_color = config.get("themeColor").and_then(|v| v.as_str()).unwrap_or("#fc8383");
    let auto_backup = config.get("autoBackup").and_then(|v| v.as_bool()).unwrap_or(true);
    let backup_interval = config.get("backupInterval").and_then(|v| v.as_i64()).unwrap_or(5);
    let delete_backup_on_save = config.get("deleteBackupOnSave").and_then(|v| v.as_bool()).unwrap_or(true);
        
    // 注入系统语言、配置和待打开的文件路径
    let file_path_js = match file_path {
        Some(path) => format!("\"{}\"", path.replace("\\", "\\\\").replace("\"", "\\\"")),
        None => "null".to_string()
    };
    let init_script = format!(
        "window.__SYSTEM_LOCALE__ = \"{}\"; window.__OPEN_FILE_PATH__ = {}; window.__IS_TEMP_FILE__ = {}; window.__APP_CONFIG__ = {{ lang: \"{}\", themeColor: \"{}\", autoBackup: {}, backupInterval: {}, deleteBackupOnSave: {} }};",
        locale, file_path_js, is_temp, lang, theme_color, auto_backup, backup_interval, delete_backup_on_save
    );

    // 开发模式下使用 devUrl，生产模式使用 App URL
    #[cfg(debug_assertions)]
    let url = tauri::WebviewUrl::External("http://localhost:3000".parse().unwrap());
    
    #[cfg(not(debug_assertions))]
    let url = tauri::WebviewUrl::App("index.html".into());

    #[cfg(target_os = "windows")]
    let builder = tauri::WebviewWindowBuilder::new(app, &label, url)
        .title("TyMinder")
        .inner_size(window_state.width, window_state.height)
        .min_inner_size(1000.0, 600.0)
        .position(window_state.x as f64, window_state.y as f64)
        .decorations(false)
        .initialization_script(&init_script)
        .on_navigation(|url: &tauri::Url| {
            let url_str = url.as_str();
            url_str.starts_with("http://localhost") 
                || url_str.starts_with("https://localhost")
                || url_str.starts_with("tauri://")
                || url_str.starts_with("https://tauri.localhost")
                || url_str.starts_with("http://tauri.localhost")
        });
    
    #[cfg(not(target_os = "windows"))]
    let builder = tauri::WebviewWindowBuilder::new(app, &label, url)
        .title("TyMinder")
        .inner_size(window_state.width, window_state.height)
        .min_inner_size(1000.0, 600.0)
        .position(window_state.x as f64, window_state.y as f64)
        .decorations(false)
        .initialization_script(&init_script)
        .on_navigation(|url: &tauri::Url| {
            let url_str = url.as_str();
            url_str.starts_with("http://localhost") 
                || url_str.starts_with("https://localhost")
                || url_str.starts_with("tauri://")
                || url_str.starts_with("https://tauri.localhost")
                || url_str.starts_with("http://tauri.localhost")
        });
    
    // Windows 平台启用文件拖拽
    #[cfg(target_os = "windows")]
    let builder = builder.drag_and_drop(true);
    
    let window = builder.build()?;
    
    // 监听窗口关闭事件，保存窗口状态
    let app_handle = app.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { .. } = event {
            // 获取当前窗口状态并保存
            if let Some(window) = app_handle.webview_windows().values().next() {
                // 如果窗口最大化，不保存尺寸和位置（保留之前的值）
                let maximized = window.is_maximized().unwrap_or(false);
                if maximized {
                    return;
                }
                
                let size = window.inner_size().unwrap_or(tauri::PhysicalSize { width: 1024, height: 600 });
                let pos = window.outer_position().unwrap_or(tauri::PhysicalPosition { x: 100, y: 100 });
                
                let state = WindowState {
                    width: size.width as f64,
                    height: size.height as f64,
                    x: pos.x,
                    y: pos.y,
                };
                save_window_state(&app_handle, &state);
            }
        }
    });
    
    Ok(())
}

/// 新建窗口命令 - 通过启动新的应用程序实例来创建新窗口
#[tauri::command(rename_all = "camelCase")]
pub fn new_window(file_path: Option<String>, is_temp: Option<bool>) -> Result<(), String> {
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let mut cmd = std::process::Command::new(&exe_path);
    
    if let Some(ref path) = file_path {
        cmd.arg(path);
        if is_temp.unwrap_or(false) {
            cmd.arg("--temp");
        }
    }
    
    cmd.spawn().map_err(|e| e.to_string())?;
    Ok(())
}
