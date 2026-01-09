//! 配置管理模块

use serde_json::{Value, json};
use tauri::Manager;

/// 获取配置
#[tauri::command]
pub fn get_config(app: tauri::AppHandle, key: Option<String>) -> Result<Value, String> {
    let config_path = app.path().app_config_dir()
        .map_err(|e| e.to_string())?
        .join("config.json");
    
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

/// 设置配置
#[tauri::command]
pub fn set_config(app: tauri::AppHandle, key: String, value: Value) -> Result<(), String> {
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
    
    std::fs::write(config_path, serde_json::to_string_pretty(&json).unwrap())
        .map_err(|e| e.to_string())
}

/// 获取系统语言
#[tauri::command]
pub fn get_system_locale() -> String {
    sys_locale::get_locale().unwrap_or_else(|| "en".to_string())
}
