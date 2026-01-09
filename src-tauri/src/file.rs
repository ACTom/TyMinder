//! 文件操作模块

use serde_json::{Value, json};

/// 保存文件
#[tauri::command]
pub fn save_file(path: String, contents: String) -> Result<(), String> {
    std::fs::write(path, contents).map_err(|e| e.to_string())
}

/// 保存 base64 编码的二进制文件（用于 PNG 等导出）
#[tauri::command]
pub fn save_file_base64(path: String, base64_data: String) -> Result<(), String> {
    use base64::{Engine as _, engine::general_purpose};
    
    let bytes = general_purpose::STANDARD
        .decode(&base64_data)
        .map_err(|e| format!("Base64 decode error: {}", e))?;
    
    std::fs::write(path, bytes).map_err(|e| e.to_string())
}

/// 读取文件
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

/// 读取二进制文件（用于导入 XMind, MindManager 等 zip 格式文件）
#[tauri::command]
pub fn read_file_binary(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}

/// 获取文件元信息
#[tauri::command]
pub fn get_file_info(path: String) -> Result<Value, String> {
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

/// 保存临时文件并返回路径
#[tauri::command]
pub fn save_temp_file(app: tauri::AppHandle, contents: String, filename: String) -> Result<String, String> {
    use tauri::Manager;
    
    let temp_dir = app.path().temp_dir().unwrap_or_else(|_| std::env::temp_dir());
    let tyminder_temp = temp_dir.join("TyMinder");
    std::fs::create_dir_all(&tyminder_temp).map_err(|e| e.to_string())?;
    
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();
    let safe_filename = filename.replace(['\\', '/', ':', '*', '?', '"', '<', '>', '|'], "_");
    let file_path = tyminder_temp.join(format!("{}_{}.km", safe_filename, timestamp));
    
    std::fs::write(&file_path, &contents).map_err(|e| e.to_string())?;
    Ok(file_path.to_string_lossy().to_string())
}

/// 清理临时文件
#[tauri::command]
pub fn cleanup_temp_file(file_path: String) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);
    
    // 安全检查：只删除 TyMinder 临时目录下的文件
    let temp_dir = std::env::temp_dir().join("TyMinder");
    if path.starts_with(&temp_dir) && path.exists() {
        std::fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}
