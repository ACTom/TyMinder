/**
 * 自动备份服务
 * 定时备份当前编辑的思维导图到程序数据目录的 backup 文件夹
 */
angular.module('kityminderEditor')
    .factory('backupService', ['config', 'document', function(config, documentService) {
        
        var service = {
            _timer: null,
            _minder: null,
            _lastBackupContent: null,
            
            /**
             * 初始化备份服务
             * @param {Object} minder - KityMinder 实例
             */
            init: function(minder) {
                this._minder = minder;
                this._startTimer();
                
                // 将 backupManager 挂载到 minder 上，方便外部调用
                minder._backupManager = this;
            },
            
            /**
             * 更新配置
             * @param {Object} cfg - 配置对象
             */
            updateConfig: function(cfg) {
                if (cfg.autoBackup !== undefined) {
                    config.set('autoBackup', cfg.autoBackup);
                }
                if (cfg.backupInterval !== undefined) {
                    config.set('backupInterval', cfg.backupInterval);
                }
                if (cfg.deleteBackupOnSave !== undefined) {
                    config.set('deleteBackupOnSave', cfg.deleteBackupOnSave);
                }
                
                // 重启定时器
                this._stopTimer();
                this._startTimer();
            },
            
            /**
             * 获取当前文件的备份名称前缀
             */
            _getBackupFileName: function() {
                // 从 document 服务获取文件名
                var fileName = documentService.getFileName();
                if (fileName && fileName !== 'Untitled.km') {
                    // 去掉扩展名
                    return fileName.replace(/\.km$/i, '');
                }
                
                // 未保存的文件，使用中心主题作为文件名
                if (this._minder) {
                    var root = this._minder.getRoot();
                    if (root) {
                        var text = root.getText() || 'untitled';
                        // 清理文件名中的非法字符
                        return text.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
                    }
                }
                
                return 'untitled';
            },
            
            /**
             * 执行备份
             */
            doBackup: function() {
                var self = this;
                var autoBackup = config.get('autoBackup');
                
                if (!autoBackup || !this._minder) {
                    return Promise.resolve();
                }
                
                // 检查文件是否有未保存的修改
                if (!documentService.isModified()) {
                    return Promise.resolve();
                }
                
                var tauri = window.__TAURI__ || {};
                var core = tauri.core || tauri.tauri;
                
                if (!core) {
                    return Promise.resolve();
                }
                
                // 导出当前内容
                var json = this._minder.exportJson();
                var content = JSON.stringify(json);
                
                // 如果内容没有变化，不备份
                if (content === this._lastBackupContent) {
                    return Promise.resolve();
                }
                
                var fileName = this._getBackupFileName();
                
                return core.invoke('save_backup', {
                    fileName: fileName,
                    contents: content
                }).then(function(path) {
                    self._lastBackupContent = content;
                    console.log('[Backup] Saved backup to:', path);
                }).catch(function(err) {
                    console.error('[Backup] Failed to save backup:', err);
                });
            },
            
            /**
             * 删除当前文件的所有备份（保存时调用）
             */
            deleteCurrentFileBackups: function() {
                var deleteOnSave = config.get('deleteBackupOnSave');
                
                if (!deleteOnSave) {
                    return Promise.resolve();
                }
                
                var tauri = window.__TAURI__ || {};
                var core = tauri.core || tauri.tauri;
                
                if (!core) {
                    return Promise.resolve();
                }
                
                var fileName = this._getBackupFileName();
                
                return core.invoke('delete_file_backups', {
                    fileName: fileName
                }).then(function(count) {
                    if (count > 0) {
                        console.log('[Backup] Deleted', count, 'backup files for:', fileName);
                    }
                }).catch(function(err) {
                    console.error('[Backup] Failed to delete backups:', err);
                });
            },
            
            /**
             * 获取当前文件的备份信息
             */
            getCurrentFileBackupInfo: function() {
                var tauri = window.__TAURI__ || {};
                var core = tauri.core || tauri.tauri;
                
                if (!core) {
                    return Promise.resolve({ count: 0, totalSize: 0 });
                }
                
                var fileName = this._getBackupFileName();
                
                return core.invoke('get_backup_info', {
                    fileName: fileName
                });
            },
            
            /**
             * 启动定时器
             */
            _startTimer: function() {
                var self = this;
                var autoBackup = config.get('autoBackup');
                
                if (!autoBackup) {
                    return;
                }
                
                var interval = config.get('backupInterval') || 5;
                var intervalMs = interval * 60 * 1000;
                
                this._timer = setInterval(function() {
                    self.doBackup();
                }, intervalMs);
                
                console.log('[Backup] Timer started, interval:', interval, 'minutes');
            },
            
            /**
             * 停止定时器
             */
            _stopTimer: function() {
                if (this._timer) {
                    clearInterval(this._timer);
                    this._timer = null;
                    console.log('[Backup] Timer stopped');
                }
            },
            
            /**
             * 销毁服务
             */
            destroy: function() {
                this._stopTimer();
                this._minder = null;
            }
        };
        
        return service;
    }]);
