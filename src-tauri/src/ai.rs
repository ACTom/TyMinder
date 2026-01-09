//! AI 功能模块

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use tauri::Manager;
use crate::crypto::{get_or_create_encryption_key, encrypt_data, decrypt_data};

/// AI 配置结构
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AiConfig {
    pub provider: String,           // openai, claude, qwen, deepseek, custom
    pub api_key_encrypted: String,  // 加密存储的 API Key
    pub api_url: String,            // API 地址（自定义时使用）
    pub model: String,              // 模型名称
    pub test_passed: bool,          // 测试是否通过
}

/// 保存 AI 配置
#[tauri::command]
pub fn save_ai_config(
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
pub fn get_ai_config(app: tauri::AppHandle) -> Result<Value, String> {
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
pub fn get_decrypted_api_key(app: &tauri::AppHandle) -> Result<String, String> {
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
pub fn get_ai_config_internal(app: &tauri::AppHandle) -> Result<AiConfig, String> {
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
    // 只有 custom 模式才使用自定义 URL
    if config.provider == "custom" && !config.api_url.is_empty() {
        return normalize_api_url(&config.api_url);
    }
    
    match config.provider.as_str() {
        "openai" => "https://api.openai.com/v1/chat/completions".to_string(),
        "claude" => "https://api.anthropic.com/v1/messages".to_string(),
        "qwen" => "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions".to_string(),
        "deepseek" => "https://api.deepseek.com/v1/chat/completions".to_string(),
        _ => normalize_api_url(&config.api_url),
    }
}

/// 规范化 API URL，智能补全路径
fn normalize_api_url(url: &str) -> String {
    let url = url.trim();
    if url.is_empty() {
        return String::new();
    }
    
    // 如果已经是完整路径，直接返回
    if url.ends_with("/chat/completions") {
        return url.to_string();
    }
    
    // 如果以 /v1/ 或 /v1 结尾，补全 chat/completions
    if url.ends_with("/v1/") {
        return format!("{}chat/completions", url);
    }
    if url.ends_with("/v1") {
        return format!("{}/chat/completions", url);
    }
    
    // 如果以 / 结尾，补全 v1/chat/completions
    if url.ends_with('/') {
        return format!("{}v1/chat/completions", url);
    }
    
    // 否则补全 /v1/chat/completions
    format!("{}/v1/chat/completions", url)
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
pub async fn ai_chat(
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
pub async fn test_ai_config(app: tauri::AppHandle) -> Result<String, String> {
    let messages = vec![json!({"role": "user", "content": "Say 'Hello' in one word."})];
    let _result = ai_chat(app.clone(), messages, None).await?;
    
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
    
    // 返回成功标识，前端根据此显示国际化消息
    Ok("OK".to_string())
}
