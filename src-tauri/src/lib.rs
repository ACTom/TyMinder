// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
use serde_json::{Value, json};
use serde::{Deserialize, Serialize};
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::Rng;

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

// ==================== AI 功能相关 ====================

/// AI 配置结构
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct AiConfig {
    provider: String,           // openai, claude, qwen, deepseek, custom
    api_key_encrypted: String,  // 加密存储的 API Key
    api_url: String,            // API 地址（自定义时使用）
    model: String,              // 模型名称
    test_passed: bool,          // 测试是否通过
}

/// 获取或创建加密密钥（固定存储在配置目录）
fn get_or_create_encryption_key(app: &tauri::AppHandle) -> Result<[u8; 32], String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let key_path = config_dir.join(".ai_key");
    
    if key_path.exists() {
        let key_hex = std::fs::read_to_string(&key_path).map_err(|e| e.to_string())?;
        let key_bytes = hex::decode(key_hex.trim()).map_err(|e| e.to_string())?;
        if key_bytes.len() == 32 {
            let mut key = [0u8; 32];
            key.copy_from_slice(&key_bytes);
            return Ok(key);
        }
    }
    
    // 生成新密钥
    let mut key = [0u8; 32];
    rand::thread_rng().fill(&mut key);
    
    // 保存密钥
    if !config_dir.exists() {
        std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    }
    std::fs::write(&key_path, hex::encode(key)).map_err(|e| e.to_string())?;
    
    Ok(key)
}

/// 加密数据
fn encrypt_data(key: &[u8; 32], plaintext: &str) -> Result<String, String> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
    
    // 生成随机 nonce
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| e.to_string())?;
    
    // 返回 nonce + ciphertext 的 hex 编码
    let mut result = nonce_bytes.to_vec();
    result.extend(ciphertext);
    Ok(hex::encode(result))
}

/// 解密数据
fn decrypt_data(key: &[u8; 32], encrypted: &str) -> Result<String, String> {
    if encrypted.is_empty() {
        return Ok(String::new());
    }
    
    let data = hex::decode(encrypted).map_err(|e| e.to_string())?;
    if data.len() < 12 {
        return Err("Invalid encrypted data".to_string());
    }
    
    let (nonce_bytes, ciphertext) = data.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);
    
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
    
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed".to_string())?;
    
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

/// 保存 AI 配置
#[tauri::command]
fn save_ai_config(
    app: tauri::AppHandle,
    provider: String,
    api_key: String,
    api_url: String,
    model: String,
) -> Result<(), String> {
    let key = get_or_create_encryption_key(&app)?;
    
    // 加密 API Key
    let api_key_encrypted = if api_key.is_empty() {
        // 如果没有新的 API Key，保留旧的
        let old_config = get_ai_config_internal(&app).ok();
        old_config.map(|c| c.api_key_encrypted).unwrap_or_default()
    } else {
        encrypt_data(&key, &api_key)?
    };
    
    // 新配置需要重新测试
    let config = AiConfig {
        provider,
        api_key_encrypted,
        api_url,
        model,
        test_passed: false,  // 重置测试状态
    };
    
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    if !config_dir.exists() {
        std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    }
    
    let ai_config_path = config_dir.join("ai_config.json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    std::fs::write(ai_config_path, content).map_err(|e| e.to_string())?;
    
    Ok(())
}

/// 获取 AI 配置（返回时 API Key 显示为脱敏形式）
#[tauri::command]
fn get_ai_config(app: tauri::AppHandle) -> Result<Value, String> {
    let config_path = app.path().app_config_dir()
        .map_err(|e| e.to_string())?
        .join("ai_config.json");
    
    if !config_path.exists() {
        return Ok(json!({
            "provider": "openai",
            "hasApiKey": false,
            "testPassed": false,
            "apiUrl": "",
            "model": ""
        }));
    }
    
    let content = std::fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: AiConfig = serde_json::from_str(&content).unwrap_or_default();
    
    Ok(json!({
        "provider": config.provider,
        "hasApiKey": !config.api_key_encrypted.is_empty(),
        "testPassed": config.test_passed,
        "apiUrl": config.api_url,
        "model": config.model
    }))
}

/// 获取实际的 API Key（解密，仅内部使用）
fn get_decrypted_api_key(app: &tauri::AppHandle) -> Result<String, String> {
    let config_path = app.path().app_config_dir()
        .map_err(|e| e.to_string())?
        .join("ai_config.json");
    
    if !config_path.exists() {
        return Err("AI config not found".to_string());
    }
    
    let content = std::fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: AiConfig = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    if config.api_key_encrypted.is_empty() {
        return Err("API Key not configured".to_string());
    }
    
    let key = get_or_create_encryption_key(app)?;
    decrypt_data(&key, &config.api_key_encrypted)
}

/// 获取 AI 配置详情（内部使用）
fn get_ai_config_internal(app: &tauri::AppHandle) -> Result<AiConfig, String> {
    let config_path = app.path().app_config_dir()
        .map_err(|e| e.to_string())?
        .join("ai_config.json");
    
    if !config_path.exists() {
        return Err("AI config not found".to_string());
    }
    
    let content = std::fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

/// 根据提供商获取 API URL
fn get_api_url(config: &AiConfig) -> String {
    if !config.api_url.is_empty() {
        return config.api_url.clone();
    }
    
    match config.provider.as_str() {
        "openai" => "https://api.openai.com/v1/chat/completions".to_string(),
        "claude" => "https://api.anthropic.com/v1/messages".to_string(),
        "qwen" => "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions".to_string(),
        "deepseek" => "https://api.deepseek.com/v1/chat/completions".to_string(),
        _ => config.api_url.clone(),
    }
}

/// 根据提供商获取默认模型
fn get_default_model(provider: &str) -> String {
    match provider {
        "openai" => "gpt-4o-mini".to_string(),
        "claude" => "claude-3-5-sonnet-20241022".to_string(),
        "qwen" => "qwen-plus".to_string(),
        "deepseek" => "deepseek-chat".to_string(),
        _ => String::new(),
    }
}

/// AI 聊天请求
#[tauri::command]
async fn ai_chat(
    app: tauri::AppHandle,
    messages: Vec<Value>,
    system_prompt: Option<String>,
) -> Result<String, String> {
    let config = get_ai_config_internal(&app)?;
    let api_key = get_decrypted_api_key(&app)?;
    let api_url = get_api_url(&config);
    let model = if config.model.is_empty() {
        get_default_model(&config.provider)
    } else {
        config.model.clone()
    };
    
    let client = reqwest::Client::new();
    
    // 构建请求体
    let request_body = if config.provider == "claude" {
        // Claude 使用不同的 API 格式
        json!({
            "model": model,
            "max_tokens": 4096,
            "system": system_prompt.unwrap_or_default(),
            "messages": messages
        })
    } else {
        // OpenAI 兼容格式
        let mut msgs = Vec::new();
        if let Some(sys) = system_prompt {
            msgs.push(json!({"role": "system", "content": sys}));
        }
        msgs.extend(messages);
        json!({
            "model": model,
            "messages": msgs
        })
    };
    
    // 构建请求
    let mut request = client.post(&api_url)
        .header("Content-Type", "application/json");
    
    if config.provider == "claude" {
        request = request
            .header("x-api-key", &api_key)
            .header("anthropic-version", "2023-06-01");
    } else {
        request = request.header("Authorization", format!("Bearer {}", api_key));
    }
    
    let response = request
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API error {}: {}", status, error_text));
    }
    
    let response_json: Value = response.json().await.map_err(|e| e.to_string())?;
    
    // 解析响应
    let content = if config.provider == "claude" {
        response_json["content"][0]["text"]
            .as_str()
            .unwrap_or("")
            .to_string()
    } else {
        response_json["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string()
    };
    
    Ok(content)
}

/// 测试 AI 配置是否有效
#[tauri::command]
async fn test_ai_config(app: tauri::AppHandle) -> Result<String, String> {
    let messages = vec![json!({"role": "user", "content": "Say 'Hello' in one word."})];
    let result = ai_chat(app.clone(), messages, None).await?;
    
    // 测试成功，更新 test_passed 状态
    let config_path = app.path().app_config_dir()
        .map_err(|e| e.to_string())?
        .join("ai_config.json");
    
    if config_path.exists() {
        let content = std::fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
        if let Ok(mut config) = serde_json::from_str::<AiConfig>(&content) {
            config.test_passed = true;
            let new_content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
            std::fs::write(&config_path, new_content).map_err(|e| e.to_string())?;
        }
    }
    
    Ok(result)
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
fn create_window(app: &tauri::AppHandle, file_path: Option<&str>, is_temp: bool) -> tauri::Result<()> {
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
#[tauri::command(rename_all = "camelCase")]
fn new_window(file_path: Option<String>, is_temp: Option<bool>) -> Result<(), String> {
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

/// 保存临时文件并返回路径
#[tauri::command]
fn save_temp_file(app: tauri::AppHandle, contents: String, filename: String) -> Result<String, String> {
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
fn cleanup_temp_file(file_path: String) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);
    
    // 安全检查：只删除 TyMinder 临时目录下的文件
    let temp_dir = std::env::temp_dir().join("TyMinder");
    if path.starts_with(&temp_dir) && path.exists() {
        std::fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

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
        .invoke_handler(tauri::generate_handler![greet, save_file, save_file_base64, read_file, read_file_binary, get_file_info, new_window, save_temp_file, cleanup_temp_file, get_config, set_config, get_system_locale, get_backup_dir, get_backup_info, save_backup, delete_backup, delete_file_backups, save_ai_config, get_ai_config, ai_chat, test_ai_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
