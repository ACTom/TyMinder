//! TyMinder - 思维导图应用
//! 
//! 模块结构:
//! - config: 配置管理
//! - file: 文件操作
//! - backup: 备份功能
//! - crypto: 加密解密
//! - ai: AI 功能
//! - window: 窗口管理

mod config;
mod file;
mod backup;
mod crypto;
mod ai;
mod window;

#[cfg(target_os = "macos")]
use tauri::Manager;

// 重导出命令函数
pub use config::{get_config, set_config, get_system_locale};
pub use file::{save_file, save_file_base64, read_file, read_file_binary, get_file_info, save_temp_file, cleanup_temp_file};
pub use backup::{get_backup_dir, get_backup_info, save_backup, delete_backup, delete_file_backups};
pub use ai::{save_ai_config, get_ai_config, ai_chat, test_ai_config};
pub use window::{new_window, create_window};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "macos")]
            let _ = app;

            #[cfg(not(target_os = "macos"))]
            {
                let args: Vec<String> = std::env::args().collect();
                let is_temp = args.iter().any(|arg| arg == "--temp");
                let file_path = args.iter()
                    .skip(1)
                    .find(|arg| !arg.starts_with('-'))
                    .map(|s| s.as_str());
                create_window(app.handle(), file_path, is_temp)?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // 配置
            get_config,
            set_config,
            get_system_locale,
            // 文件
            save_file,
            save_file_base64,
            read_file,
            read_file_binary,
            get_file_info,
            save_temp_file,
            cleanup_temp_file,
            // 备份
            get_backup_dir,
            get_backup_info,
            save_backup,
            delete_backup,
            delete_file_backups,
            // AI
            save_ai_config,
            get_ai_config,
            ai_chat,
            test_ai_config,
            // 窗口
            new_window,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, _event| {
            #[cfg(target_os = "macos")]
            match _event {
                tauri::RunEvent::Opened { urls } => {
                    for url in urls {
                        if url.scheme() == "file" {
                            if let Ok(path) = url.to_file_path() {
                                let path_str = path.to_string_lossy();
                                let _ = create_window(_app_handle, Some(&path_str), false);
                            }
                        }
                    }
                }
                tauri::RunEvent::Ready => {
                    let app_handle = _app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        // 延迟 300ms 等待可能的 Opened 事件触发
                        tokio::time::sleep(std::time::Duration::from_millis(300)).await;
                        
                        if app_handle.webview_windows().is_empty() {
                            let _ = create_window(&app_handle, None, false);
                        }
                    });
                }
                _ => {}
            }
        });
}
