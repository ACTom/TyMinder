// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
use serde_json::{Value, json};
use serde::{Deserialize, Serialize};

/// 窗口状态配置
#[derive(Debug, Clone, Serialize, Deserialize)]
struct WindowState {
    width: f64,
    height: f64,
    x: i32,
    y: i32,
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
fn load_window_state(app: &tauri::AppHandle) -> WindowState {
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
fn save_window_state(app: &tauri::AppHandle, state: &WindowState) {
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

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_config(app: tauri::AppHandle, key: Option<String>) -> Result<Value, String> {
    let config_path = app.path().app_config_dir().map_err(|e| e.to_string())?.join("config.json");
    let content = if config_path.exists() {
        std::fs::read_to_string(config_path).map_err(|e| e.to_string())?
    } else {
        "{}".to_string()
    };
    
    let json: Value = serde_json::from_str(&content).unwrap_or(json!({}));
    
    if let Some(k) = key {
        Ok(json.get(&k).cloned().unwrap_or(Value::Null))
    } else {
        Ok(json)
    }
}

#[tauri::command]
fn set_config(app: tauri::AppHandle, key: String, value: Value) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    if !config_dir.exists() {
        std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    }
    let config_path = config_dir.join("config.json");
    
    let content = if config_path.exists() {
        std::fs::read_to_string(&config_path).unwrap_or("{}".to_string())
    } else {
        "{}".to_string()
    };
    
    let mut json: Value = serde_json::from_str(&content).unwrap_or(json!({}));
    
    if let Some(obj) = json.as_object_mut() {
        obj.insert(key, value);
    } else {
        let mut map = serde_json::Map::new();
        map.insert(key, value);
        json = Value::Object(map);
    }
    
    std::fs::write(config_path, serde_json::to_string_pretty(&json).unwrap()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_system_locale() -> String {
    sys_locale::get_locale().unwrap_or_else(|| "en".to_string())
}


#[tauri::command]
fn save_file(path: String, contents: String) -> Result<(), String> {
    std::fs::write(path, contents).map_err(|e| e.to_string())
}

/// 保存 base64 编码的二进制文件（用于 PNG 等导出）
#[tauri::command]
fn save_file_base64(path: String, base64_data: String) -> Result<(), String> {
    use base64::{Engine as _, engine::general_purpose};
    
    let bytes = general_purpose::STANDARD
        .decode(&base64_data)
        .map_err(|e| format!("Base64 decode error: {}", e))?;
    
    std::fs::write(path, bytes).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

/// 读取二进制文件（用于导入 XMind, MindManager 等 zip 格式文件）
#[tauri::command]
fn read_file_binary(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}

/// 获取文件元信息
#[tauri::command]
fn get_file_info(path: String) -> Result<Value, String> {
    let metadata = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    
    let size = metadata.len();
    
    // 获取创建时间
    let created = metadata.created()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    
    // 获取修改时间
    let modified = metadata.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    
    Ok(json!({
        "path": path,
        "size": size,
        "created": created,
        "modified": modified
    }))
}

// ==================== 备份相关命令 ====================

/// 获取备份目录路径
fn get_backup_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let backup_dir = data_dir.join("backup");
    
    // 确保目录存在
    if !backup_dir.exists() {
        std::fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;
    }
    
    Ok(backup_dir)
}

/// 获取备份目录路径
#[tauri::command]
fn get_backup_dir(app: tauri::AppHandle) -> Result<String, String> {
    let backup_dir = get_backup_path(&app)?;
    Ok(backup_dir.to_string_lossy().to_string())
}

/// 检查备份文件名是否属于指定的原文件
/// 备份文件格式: 文件名_年月日时分秒.km (时间戳为14位数字)
fn is_backup_of_file(backup_name: &str, file_name: &str) -> bool {
    // 备份文件必须以 .km 结尾
    if !backup_name.ends_with(".km") {
        return false;
    }
    
    // 去掉 .km 后缀
    let name_without_ext = &backup_name[..backup_name.len() - 3];
    
    // 必须以 文件名_ 开头
    let prefix = format!("{}_", file_name);
    if !name_without_ext.starts_with(&prefix) {
        return false;
    }
    
    // 前缀后面必须是14位数字（时间戳）
    let timestamp_part = &name_without_ext[prefix.len()..];
    if timestamp_part.len() != 14 {
        return false;
    }
    
    // 检查是否全为数字
    timestamp_part.chars().all(|c| c.is_ascii_digit())
}

/// 获取备份信息（所有备份文件的列表和总大小）
#[tauri::command]
fn get_backup_info(app: tauri::AppHandle, file_name: Option<String>) -> Result<Value, String> {
    let backup_dir = get_backup_path(&app)?;
    
    let mut files: Vec<Value> = Vec::new();
    let mut total_size: u64 = 0;
    
    if backup_dir.exists() {
        for entry in std::fs::read_dir(&backup_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            
            if path.is_file() && path.extension().map_or(false, |ext| ext == "km") {
                let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                
                // 如果指定了文件名，只统计该文件的备份（精确匹配）
                if let Some(ref filter_name) = file_name {
                    if !is_backup_of_file(&name, filter_name) {
                        continue;
                    }
                }
                
                let metadata = std::fs::metadata(&path).ok();
                let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
                let modified = metadata.as_ref()
                    .and_then(|m| m.modified().ok())
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs() as i64)
                    .unwrap_or(0);
                
                total_size += size;
                files.push(json!({
                    "name": name,
                    "path": path.to_string_lossy().to_string(),
                    "size": size,
                    "modified": modified
                }));
            }
        }
    }
    
    // 按修改时间排序（新的在前）
    files.sort_by(|a, b| {
        let a_mod = a.get("modified").and_then(|v| v.as_i64()).unwrap_or(0);
        let b_mod = b.get("modified").and_then(|v| v.as_i64()).unwrap_or(0);
        b_mod.cmp(&a_mod)
    });
    
    Ok(json!({
        "dir": backup_dir.to_string_lossy().to_string(),
        "files": files,
        "count": files.len(),
        "totalSize": total_size
    }))
}

/// 保存备份文件
#[tauri::command]
fn save_backup(app: tauri::AppHandle, file_name: String, contents: String) -> Result<String, String> {
    let backup_dir = get_backup_path(&app)?;
    
    // 生成备份文件名：文件名_年月日时分秒.km
    let now = chrono::Local::now();
    let timestamp = now.format("%Y%m%d%H%M%S").to_string();
    let backup_name = format!("{}_{}.km", file_name, timestamp);
    let backup_path = backup_dir.join(&backup_name);
    
    std::fs::write(&backup_path, contents).map_err(|e| e.to_string())?;
    
    Ok(backup_path.to_string_lossy().to_string())
}

/// 删除备份文件
#[tauri::command]
fn delete_backup(path: String) -> Result<(), String> {
    std::fs::remove_file(path).map_err(|e| e.to_string())
}

/// 删除指定文件的所有备份
#[tauri::command]
fn delete_file_backups(app: tauri::AppHandle, file_name: String) -> Result<u32, String> {
    let backup_dir = get_backup_path(&app)?;
    let mut deleted_count = 0;
    
    if backup_dir.exists() {
        for entry in std::fs::read_dir(&backup_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            
            if path.is_file() {
                let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                // 使用精确匹配，避免误删其他文件的备份
                if is_backup_of_file(&name, &file_name) {
                    if std::fs::remove_file(&path).is_ok() {
                        deleted_count += 1;
                    }
                }
            }
        }
    }
    
    Ok(deleted_count)
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
fn create_window(app: &tauri::AppHandle, file_path: Option<&str>) -> tauri::Result<()> {
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
        Some(path) => format!("\"{}\"" , path.replace("\\", "\\\\").replace("\"", "\\\"")),
        None => "null".to_string()
    };
    let init_script = format!(
        "window.__SYSTEM_LOCALE__ = \"{}\"; window.__OPEN_FILE_PATH__ = {}; window.__APP_CONFIG__ = {{ lang: \"{}\", themeColor: \"{}\", autoBackup: {}, backupInterval: {}, deleteBackupOnSave: {} }};",
        locale, file_path_js, lang, theme_color, auto_backup, backup_interval, delete_backup_on_save
    );

    // 开发模式下使用 devUrl，生产模式使用 App URL
    #[cfg(debug_assertions)]
    let url = tauri::WebviewUrl::External("http://localhost:3000".parse().unwrap());
    
    #[cfg(not(debug_assertions))]
    let url = tauri::WebviewUrl::App("index.html".into());

    let builder = tauri::WebviewWindowBuilder::new(app, &label, url)
        .title("TyMinder")
        .inner_size(window_state.width, window_state.height)
        .min_inner_size(800.0, 400.0)  // 最小窗口尺寸
        .position(window_state.x as f64, window_state.y as f64)
        .decorations(false)
        .drag_and_drop(true)  // 启用文件拖拽
        .initialization_script(&init_script)
        .on_navigation(|url| {
            // 拦截外部链接导航，只允许应用内部 URL
            let url_str = url.as_str();
            // 允许 localhost 和 tauri 内部 URL
            if url_str.starts_with("http://localhost") 
                || url_str.starts_with("https://localhost")
                || url_str.starts_with("tauri://")
                || url_str.starts_with("https://tauri.localhost")
                || url_str.starts_with("http://tauri.localhost") {
                true  // 允许导航
            } else {
                false  // 阻止外部链接导航，由前端处理
            }
        });
    
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
#[tauri::command]
fn new_window(file_path: Option<String>) -> Result<(), String> {
    println!("[TyMinder] new_window called with file_path: {:?}", file_path);
    
    // 获取当前可执行文件的路径
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    
    let mut cmd = std::process::Command::new(&exe_path);
    
    // 如果有文件路径，作为参数传递
    if let Some(path) = file_path {
        cmd.arg(&path);
    }
    
    // 启动新实例
    cmd.spawn().map_err(|e| {
        eprintln!("[TyMinder] Failed to spawn new instance: {}", e);
        e.to_string()
    })?;
    
    println!("[TyMinder] New instance spawned successfully");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 解析命令行参数，获取要打开的文件路径
            let args: Vec<String> = std::env::args().collect();
            let file_path = args.get(1).and_then(|path| {
                // 过滤掉以 - 开头的参数（这些是 Tauri/系统参数）
                if path.starts_with('-') {
                    None
                } else {
                    Some(path.as_str())
                }
            });
            
            // 创建第一个窗口，如果有文件参数则打开该文件
            create_window(app.handle(), file_path)?;
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, save_file, save_file_base64, read_file, read_file_binary, get_file_info, new_window, get_config, set_config, get_system_locale, get_backup_dir, get_backup_info, save_backup, delete_backup, delete_file_backups])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
