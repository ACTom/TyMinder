//! 备份功能模块

use serde_json::{Value, json};
use tauri::Manager;

/// 获取备份目录路径
pub fn get_backup_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
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
pub fn get_backup_dir(app: tauri::AppHandle) -> Result<String, String> {
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
pub fn get_backup_info(app: tauri::AppHandle, file_name: Option<String>) -> Result<Value, String> {
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
pub fn save_backup(app: tauri::AppHandle, file_name: String, contents: String) -> Result<String, String> {
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
pub fn delete_backup(path: String) -> Result<(), String> {
    std::fs::remove_file(path).map_err(|e| e.to_string())
}

/// 删除指定文件的所有备份
#[tauri::command]
pub fn delete_file_backups(app: tauri::AppHandle, file_name: String) -> Result<u32, String> {
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
