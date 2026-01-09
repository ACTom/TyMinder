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
            let args: Vec<String> = std::env::args().collect();
            let is_temp = args.iter().any(|arg| arg == "--temp");
            let file_path = args.iter()
                .skip(1)
                .find(|arg| !arg.starts_with('-'))
                .map(|s| s.as_str());
            
            create_window(app.handle(), file_path, is_temp)?;
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
