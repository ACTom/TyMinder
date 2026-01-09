//! 加密解密模块

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::Rng;
use tauri::Manager;

/// 获取或创建加密密钥（固定存储在配置目录）
pub fn get_or_create_encryption_key(app: &tauri::AppHandle) -> Result<[u8; 32], String> {
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
pub fn encrypt_data(key: &[u8; 32], plaintext: &str) -> Result<String, String> {
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
pub fn decrypt_data(key: &[u8; 32], encrypted: &str) -> Result<String, String> {
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
