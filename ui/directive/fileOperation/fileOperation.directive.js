angular.module('kityminderEditor')
    .directive('fileOperation', ['native', 'document', '$uibModal', '$q', 'config', 'backupService', '$rootScope', function(native, document, $modal, $q, config, backupService, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'ui/directive/fileOperation/fileOperation.html',
            scope: {
                minder: '=',
                exit: '&'
            },
            replace: true,
            link: function($scope) {
                var minder = $scope.minder;

                // 初始化备份服务
                backupService.init(minder);

                // 应用版本号（从 Tauri 读取）
                $scope.appVersion = '0.0.0';
                (function loadAppVersion() {
                    var tauri = window.__TAURI__ || {};
                    if (tauri.app && tauri.app.getVersion) {
                        tauri.app.getVersion().then(function(version) {
                            $scope.appVersion = version;
                            if (!$scope.$$phase && !$scope.$root.$$phase) {
                                $scope.$apply();
                            }
                        });
                    }
                })();

                // 当前激活的菜单面板
                $scope.activeMenu = 'info';

                // 导入格式列表
                $scope.importFormats = [
                    { id: 'md', name: 'Markdown', extensions: '*.md', icon: 'glyphicon-list-alt', protocol: 'markdown', dataType: 'text' },
                    { id: 'txt', name: 'Plain Text', extensions: '*.txt', icon: 'glyphicon-align-left', protocol: 'plain', dataType: 'text' },
                    { id: 'mm', name: 'FreeMind', extensions: '*.mm', icon: 'glyphicon-globe', protocol: 'freemind', dataType: 'text' },
                    { id: 'xmind', name: 'XMind', extensions: '*.xmind', icon: 'glyphicon-th-large', protocol: 'xmind', dataType: 'blob' },
                    { id: 'mmap', name: 'MindManager', extensions: '*.mmap', icon: 'glyphicon-th', protocol: 'mindmanager', dataType: 'blob' }
                ];

                // 导出格式列表
                $scope.exportFormats = [
                    { id: 'md', name: 'Markdown', extensions: '*.md', icon: 'glyphicon-list-alt', protocol: 'markdown', ext: 'md' },
                    { id: 'txt', name: 'Plain Text', extensions: '*.txt', icon: 'glyphicon-align-left', protocol: 'plain', ext: 'txt' },
                    { id: 'xmind', name: 'XMind', extensions: '*.xmind', icon: 'glyphicon-th-large', protocol: 'xmind', ext: 'xmind' },
                    { id: 'png', name: 'PNG Image', extensions: '*.png', icon: 'glyphicon-picture', protocol: 'png', ext: 'png' },
                    { id: 'svg', name: 'SVG Image', extensions: '*.svg', icon: 'glyphicon-picture', protocol: 'svg', ext: 'svg' }
                ];

                // 菜单切换方法
                $scope.showImport = function() {
                    $scope.activeMenu = 'import';
                };

                $scope.showExport = function() {
                    $scope.activeMenu = 'export';
                };

                $scope.showAbout = function() {
                    $scope.activeMenu = 'about';
                };

                $scope.showInfo = function() {
                    $scope.activeMenu = 'info';
                    // 加载文件信息和备份信息
                    updateFileInfo();
                    loadBackupInfo();
                };

                $scope.showRecent = function() {
                    $scope.activeMenu = 'recent';
                    loadRecentFiles();
                };

                // 打开设置对话框
                $scope.showSettings = function() {
                    // 先关闭文件菜单
                    if ($scope.exit) $scope.exit();
                    
                    // 获取当前语言和语言列表
                    var currentLang = config.get('lang') || 'system';
                    var langList = (window.editor && window.editor.lang) ? window.editor.lang.langList : {};
                    var systemLangStr =  (window.editor && window.editor.lang) ? window.editor.lang.t('systemlanguage', 'ui') : 'System Language';
                    
                    // 从 Tauri 配置读取主题色
                    var openSettingsDialog = function(themeColor, backupConfig, aiConfig) {
                        var settingsModal = $modal.open({
                            animation: true,
                            templateUrl: 'ui/dialog/settings/settings.tpl.html',
                            controller: 'settings.ctrl',
                            size: 'md',
                            backdrop: 'static',
                            resolve: {
                                config: function() { return config; },
                                currentLang: function() { return currentLang; },
                                systemLangStr: function() { return systemLangStr; },
                                langList: function() { return langList; },
                                currentThemeColor: function() { return themeColor; },
                                backupConfig: function() { return backupConfig || {}; },
                                aiConfig: function() { return aiConfig || {}; }
                            }
                        });

                        settingsModal.result.then(function(result) {
                            if (result && result.needRestart) {
                                var lang = window.editor && window.editor.lang;
                                var msg = lang ? lang.t('langsavesuccess', 'ui') : 'Language saved. Please restart the app.';
                                alert(msg);
                            }
                            // 更新备份定时器
                            if (result && window.editor && window.editor.minder) {
                                var minder = window.editor.minder;
                                if (minder._backupManager) {
                                    minder._backupManager.updateConfig({
                                        autoBackup: result.autoBackup,
                                        backupInterval: result.backupInterval,
                                        deleteBackupOnSave: result.deleteBackupOnSave
                                    });
                                }
                            }
                            // 通知 AI 配置已更新
                            $rootScope.$broadcast('ai:configSaved');
                        }).catch(function() {
                            // 用户取消
                        });
                    };
                    
                    // 从 Tauri 配置异步读取主题色和备份配置
                    var tauri = window.__TAURI__ || {};
                    var core = tauri.core || tauri.tauri;
                    if (core) {
                        Promise.all([
                            core.invoke('get_config', { key: 'themeColor' }),
                            core.invoke('get_config', { key: 'autoBackup' }),
                            core.invoke('get_config', { key: 'backupInterval' }),
                            core.invoke('get_config', { key: 'deleteBackupOnSave' }),
                            core.invoke('get_ai_config', {})
                        ]).then(function(results) {
                            var backupConfig = {
                                autoBackup: results[1] !== false,
                                backupInterval: results[2] || 5,
                                deleteBackupOnSave: results[3] !== false
                            };
                            var aiConfig = results[4] || { provider: 'openai', hasApiKey: false, apiUrl: '', model: '' };
                            openSettingsDialog(results[0] || '#fc8383', backupConfig, aiConfig);
                        }).catch(function() {
                            openSettingsDialog('#fc8383', {}, { provider: 'openai', hasApiKey: false, apiUrl: '', model: '' });
                        });
                    } else {
                        openSettingsDialog('#fc8383', {}, { provider: 'openai', hasApiKey: false, apiUrl: '', model: '' });
                    }
                };

                // 文件信息
                $scope.fileInfo = {
                    fileName: null,
                    filePath: null,
                    fileSize: null,
                    createdTime: null,
                    modifiedTime: null,
                    isNewFile: true
                };

                // 备份信息
                $scope.backupEnabled = config.get('autoBackup') !== false;
                $scope.backupInfo = {
                    count: 0,
                    totalSize: 0,
                    sizeDisplay: '0 B',
                    dir: ''
                };

                /**
                 * 加载当前文件的备份信息
                 */
                function loadBackupInfo() {
                    if (!$scope.backupEnabled) return;
                    
                    backupService.getCurrentFileBackupInfo().then(function(info) {
                        $scope.backupInfo = {
                            count: info.count || 0,
                            totalSize: info.totalSize || 0,
                            sizeDisplay: formatSize(info.totalSize || 0),
                            dir: info.dir || ''
                        };
                        if (!$scope.$$phase && !$scope.$root.$$phase) {
                            $scope.$apply();
                        }
                    }).catch(function(err) {
                        console.error('Failed to load backup info:', err);
                    });
                }

                /**
                 * 打开备份目录
                 */
                $scope.openBackupDir = function() {
                    if ($scope.backupInfo.dir) {
                        native.invoke('plugin:opener|open_path', { path: $scope.backupInfo.dir }).catch(function(err) {
                            console.error('Failed to open backup dir:', err);
                        });
                    }
                };

                /**
                 * 格式化文件大小
                 */
                function formatSize(bytes) {
                    if (bytes === 0) return '0 B';
                    var k = 1024;
                    var sizes = ['B', 'KB', 'MB', 'GB'];
                    var i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                }

                // 最近打开的文件列表
                $scope.recentFiles = [];
                var RECENT_FILES_KEY = 'recentFiles';
                var MAX_RECENT_FILES = 10;

                /**
                 * 加载最近文件列表
                 */
                function loadRecentFiles() {
                    if (native.isTauri) {
                        native.app.getAppConfig(RECENT_FILES_KEY, null).then(function(data) {
                            try {
                                if (data === null || data === undefined) {
                                    $scope.recentFiles = [];
                                } else if (Array.isArray(data)) {
                                    // 已经是数组
                                    $scope.recentFiles = data;
                                } else if (typeof data === 'string') {
                                    // 是 JSON 字符串，需要解析
                                    $scope.recentFiles = JSON.parse(data) || [];
                                } else {
                                    $scope.recentFiles = [];
                                }
                                // 使用 $timeout 确保在下一个 digest cycle 中更新
                                if (!$scope.$$phase && !$scope.$root.$$phase) {
                                    $scope.$apply();
                                }
                            } catch (e) {
                                console.error('[RecentFiles] Parse error:', e);
                                $scope.recentFiles = [];
                            }
                        });
                    } else {
                        try {
                            $scope.recentFiles = JSON.parse(localStorage.getItem(RECENT_FILES_KEY)) || [];
                        } catch (e) {
                            $scope.recentFiles = [];
                        }
                    }
                }

                /**
                 * 保存最近文件列表
                 */
                function saveRecentFiles() {
                    if (native.isTauri) {
                        // Tauri 直接保存数组，Rust 端会序列化为 JSON
                        native.app.setAppConfig(RECENT_FILES_KEY, $scope.recentFiles);
                    } else {
                        localStorage.setItem(RECENT_FILES_KEY, JSON.stringify($scope.recentFiles));
                    }
                }

                /**
                 * 添加文件到最近列表
                 */
                function addToRecentFiles(filePath) {
                    if (!filePath) return;
                    
                    // 提取文件名
                    var fileName = filePath.split(/[\\/]/).pop();
                    
                    // 移除已存在的相同路径
                    $scope.recentFiles = $scope.recentFiles.filter(function(f) {
                        return f.path !== filePath;
                    });
                    
                    // 添加到开头
                    $scope.recentFiles.unshift({
                        name: fileName,
                        path: filePath
                    });
                    
                    // 限制数量
                    if ($scope.recentFiles.length > MAX_RECENT_FILES) {
                        $scope.recentFiles = $scope.recentFiles.slice(0, MAX_RECENT_FILES);
                    }
                    
                    saveRecentFiles();
                }

                /**
                 * 清空最近文件
                 */
                $scope.clearRecentFiles = function() {
                    $scope.recentFiles = [];
                    saveRecentFiles();
                };

                /**
                 * 打开最近文件
                 */
                $scope.openRecentFile = function(file) {
                    if (!native.isTauri) return;
                    
                    // 先关闭菜单
                    if ($scope.exit) $scope.exit();
                    
                    // 检查未保存的修改
                    checkUnsavedChanges().then(function(result) {
                        if (result === 'save') {
                            return doSave().then(function() { return 'saved'; });
                        }
                        return result;
                    }).then(function(result) {
                        if (result === 'cancel') return;
                        
                        // 读取文件
                        native.file.read(file.path).then(function(contents) {
                            minder.importData('json', contents).then(function() {
                                document.setFilePath(file.path);
                                document.setModified(false);
                                addToRecentFiles(file.path);
                            });
                        }).catch(function(e) {
                            console.error('Failed to open file:', e);
                            alert('Failed to open file: ' + e);
                            // 文件不存在，从列表中移除
                            $scope.recentFiles = $scope.recentFiles.filter(function(f) {
                                return f.path !== file.path;
                            });
                            saveRecentFiles();
                            $scope.$apply();
                        });
                    });
                };

                /**
                 * 格式化文件大小
                 */
                function formatFileSize(bytes) {
                    if (bytes === 0) return '0 B';
                    var k = 1024;
                    var sizes = ['B', 'KB', 'MB', 'GB'];
                    var i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                }

                /**
                 * 格式化时间戳
                 */
                function formatTime(timestamp) {
                    if (!timestamp) return '-';
                    var date = new Date(timestamp * 1000);
                    return date.toLocaleString();
                }

                /**
                 * 更新文件信息显示
                 */
                function updateFileInfo() {
                    var filePath = document.getFilePath();
                    
                    if (!filePath) {
                        $scope.fileInfo = {
                            fileName: document.getFileName(),
                            filePath: null,
                            fileSize: null,
                            createdTime: null,
                            modifiedTime: null,
                            isNewFile: true
                        };
                        return;
                    }

                    $scope.fileInfo.fileName = document.getFileName();
                    $scope.fileInfo.filePath = filePath;
                    $scope.fileInfo.isNewFile = false;

                    // 获取文件元信息
                    if (native.isTauri) {
                        native.file.getInfo(filePath).then(function(info) {
                            $scope.$apply(function() {
                                $scope.fileInfo.fileSize = formatFileSize(info.size);
                                $scope.fileInfo.createdTime = formatTime(info.created);
                                $scope.fileInfo.modifiedTime = formatTime(info.modified);
                            });
                        }).catch(function(e) {
                            console.error('Failed to get file info:', e);
                        });
                    }
                }

                // 初始化时更新文件信息、备份信息和最近文件列表
                updateFileInfo();
                loadBackupInfo();
                loadRecentFiles(); // 初始化时加载，避免保存时覆盖

                // 监听文档路径变化
                $scope.$on('document:pathChanged', function() {
                    updateFileInfo();
                    loadBackupInfo();
                });

                $scope.$on('document:saved', function() {
                    updateFileInfo();
                    loadBackupInfo();
                });

                // 监听文件标签被激活事件
                $scope.$on('fileTab:activated', function() {
                    if ($scope.activeMenu === 'info') {
                        updateFileInfo();
                        loadBackupInfo();
                    }
                });

                // 监听快捷键保存事件 (Ctrl+S)
                $scope.$on('file:save', function() {
                    $scope.saveFile();
                });

                // 监听快捷键打开事件 (Ctrl+O)
                $scope.$on('file:open', function() {
                    $scope.openFile();
                });

                /**
                 * 检查是否有未保存的修改，如果有则弹出保存确认对话框
                 * @returns {Promise} resolve('save'|‘dontsave’|‘cancel’) 或 reject(‘cancel’)
                 */
                function checkUnsavedChanges() {
                    var deferred = $q.defer();
                    
                    if (!document.isModified()) {
                        // 没有修改，直接继续
                        deferred.resolve('dontsave');
                        return deferred.promise;
                    }

                    // 有未保存的修改，弹出对话框
                    var unsavedModal = $modal.open({
                        animation: true,
                        templateUrl: 'ui/dialog/unsaved/unsaved.tpl.html',
                        controller: 'unsaved.ctrl',
                        size: 'md',
                        backdrop: 'static'
                    });

                    unsavedModal.result.then(function(result) {
                        deferred.resolve(result);
                    }, function() {
                        deferred.reject('cancel');
                    });

                    return deferred.promise;
                }

                /**
                 * 执行保存操作（内部使用，返回 Promise）
                 */
                function doSave() {
                    var deferred = $q.defer();
                    var currentFilePath = document.getFilePath();
                    
                    if (currentFilePath) {
                        var data = JSON.stringify(minder.exportJson());
                        native.file.save(currentFilePath, data).then(function() {
                            document.markSaved();
                            deferred.resolve();
                        }).catch(function(e) {
                            deferred.reject(e);
                        });
                    } else {
                        // 需要另存为
                        native.file.saveDialog().then(function(filePath) {
                            if (filePath) {
                                document.setFilePath(filePath);
                                var data = JSON.stringify(minder.exportJson());
                                return native.file.save(filePath, data).then(function() {
                                    document.markSaved();
                                    deferred.resolve();
                                });
                            } else {
                                deferred.reject('cancel');
                            }
                        }).catch(function(e) {
                            deferred.reject(e);
                        });
                    }
                    
                    return deferred.promise;
                }

                /**
                 * 获取默认文件名（使用中心主题文本）
                 * @returns {string} 文件名（不含扩展名）
                 */
                $scope.getDefaultFileName = function() {
                    var root = minder.getRoot();
                    var text = (root && root.data && root.data.text) || 'untitled';
                    // 移除文件名中的特殊字符
                    text = text.replace(/[\\/:*?"<>|]/g, '_');
                    // 限制长度
                    if (text.length > 100) {
                        text = text.substring(0, 100);
                    }
                    return text;
                };
                
                $scope.newFile = function() {
                     if (native.isTauri) {
                         native.app.createWindow().catch(function(e) {
                             console.error('[TyMinder] Failed to create new window:', e);
                         });
                         if ($scope.exit) $scope.exit();
                     } else {
                         // Fallback for non-Tauri: 检查未保存的修改
                         checkUnsavedChanges().then(function(result) {
                             if (result === 'save') {
                                 return doSave().then(function() {
                                     return 'saved';
                                 });
                             }
                             return result;
                         }).then(function(result) {
                             if (result !== 'cancel') {
                                 minder.importData('json', '{"root":{"data":{"text":"Central Topic"}}}');
                                 minder.execCommand('camera', minder.getRoot(), 600);
                                 document.reset();
                                 if ($scope.exit) $scope.exit();
                             }
                         }).catch(function() {
                             // 用户取消
                         });
                     }
                };

                $scope.openFile = function() {
                    if (!native.isTauri) {
                        alert('Tauri API not found. Please run in Tauri environment.');
                        return;
                    }
                    
                    // 先关闭左侧菜单，确保对话框可见
                    if ($scope.exit) $scope.exit();
                    
                    // 检查未保存的修改
                    checkUnsavedChanges().then(function(result) {
                        if (result === 'save') {
                            return doSave().then(function() {
                                return 'saved';
                            });
                        }
                        return result;
                    }).then(function(result) {
                        if (result === 'cancel') {
                            return;
                        }
                        
                        // 打开文件对话框
                        return native.file.openDialog().then(function(selected) {
                            if (selected) {
                                var filePath = Array.isArray(selected) ? selected[0] : selected;
                                return native.file.read(filePath).then(function(contents) {
                                    return { contents: contents, filePath: filePath };
                                });
                            }
                        }).then(function(result) {
                            if (result) {
                                minder.importData('json', result.contents).then(function() {
                                    document.setFilePath(result.filePath);
                                    document.setModified(false);
                                    addToRecentFiles(result.filePath);
                                });
                            }
                        });
                    }).catch(function(e) {
                        if (e !== 'cancel') {
                            console.error(e);
                            alert('Failed to open file: ' + e);
                        }
                    });
                };

                $scope.saveFile = function() {
                    if (!native.isTauri) {
                        alert('Tauri API not found. Please run in Tauri environment.');
                        return;
                    }
                    
                    var currentFilePath = document.getFilePath();
                    if (currentFilePath) {
                        console.log('Saving to existing path:', currentFilePath);
                        var data = JSON.stringify(minder.exportJson());
                        native.file.save(currentFilePath, data).then(function() {
                            document.markSaved();
                            
                            // 保存成功后添加到最近文件列表
                            addToRecentFiles(currentFilePath);
                            
                            // 保存成功后删除备份
                            backupService.deleteCurrentFileBackups();
                            
                            $scope.$apply(function() {
                                if ($scope.exit) $scope.exit();
                            });
                        }).catch(function(e) {
                            console.error('Save error:', e);
                            alert('Failed to save file: ' + (typeof e === 'object' ? JSON.stringify(e) : e));
                        });
                    } else {
                        console.log('No current file path, calling saveAsFile');
                        $scope.saveAsFile();
                    }
                };

                $scope.saveAsFile = function() {
                    if (!native.isTauri) {
                         alert('Tauri API not found. Please run in Tauri environment.');
                         return;
                    }

                    // 使用中心主题作为默认文件名
                    var defaultName = $scope.getDefaultFileName() + '.km';

                    native.file.saveDialog({ defaultName: defaultName })
                    .then(function(filePath) {
                        if (filePath) {
                            document.setFilePath(filePath);
                            $scope.saveFile();
                        }
                    }).catch(function(e) {
                         console.error(e);
                    });
                };

                /**
                 * 执行导入操作
                 * 使用自定义 ProtocolManager 进行格式转换
                 */
                $scope.doImport = function(fmt) {
                    if (!native.isTauri) {
                        alert('Tauri API not found.');
                        return;
                    }

                    if (!window.editor || !window.editor.ProtocolManager) {
                        alert('ProtocolManager not initialized.');
                        return;
                    }

                    // 关闭菜单
                    if ($scope.exit) $scope.exit();

                    // 检查未保存的修改
                    checkUnsavedChanges().then(function(result) {
                        if (result === 'save') {
                            return doSave().then(function() { return 'saved'; });
                        }
                        return result;
                    }).then(function(result) {
                        if (result === 'cancel') return;

                        // 打开文件对话框
                        var filters = [{ name: fmt.name, extensions: [fmt.id] }];
                        return native.invoke('plugin:dialog|open', {
                            options: { multiple: false, filters: filters }
                        }).then(function(selected) {
                            if (selected) {
                                var filePath = Array.isArray(selected) ? selected[0] : selected;
                                
                                // 根据数据类型选择读取方式
                                var readPromise;
                                if (fmt.dataType === 'blob') {
                                    // 二进制文件（XMind, MindManager）
                                    readPromise = native.invoke('read_file_binary', { path: filePath }).then(function(bytes) {
                                        return new Blob([new Uint8Array(bytes)]);
                                    });
                                } else {
                                    // 文本文件
                                    readPromise = native.file.read(filePath);
                                }

                                return readPromise.then(function(data) {
                                    // 使用 ProtocolManager 解码为 JSON
                                    return window.editor.ProtocolManager.decode(fmt.protocol, data);
                                }).then(function(json) {
                                    // 使用 minder.importJson 加载数据
                                    minder.importJson(json);
                                    document.reset();
                                    document.setModified(false);
                                });
                            }
                        });
                    }).catch(function(e) {
                        if (e !== 'cancel') {
                            console.error('Import error:', e);
                            alert('Failed to import: ' + e);
                        }
                    });
                };

                /**
                 * 导出 Markdown 时弹出选项对话框
                 */
                $scope.showMarkdownExportDialog = function(fmt) {
                    var mdModal = $modal.open({
                        animation: true,
                        templateUrl: 'ui/dialog/exportMarkdown/exportMarkdown.tpl.html',
                        controller: 'exportMarkdown.ctrl',
                        size: 'md',
                        backdrop: 'static',
                        resolve: {
                            minder: function() { return minder; },
                            exportCallback: function() { return null; }
                        }
                    });
                    
                    return mdModal.result;
                };

                /**
                 * 执行导出操作
                 * 使用自定义 ProtocolManager 进行格式转换
                 */
                $scope.doExport = function(fmt) {
                    if (!native.isTauri) {
                        alert('Tauri API not found.');
                        return;
                    }

                    if (!window.editor || !window.editor.ProtocolManager) {
                        alert('ProtocolManager not initialized.');
                        return;
                    }

                    // 关闭菜单
                    if ($scope.exit) $scope.exit();

                    // 如果是 Markdown 格式，弹出选项对话框
                    if (fmt.protocol === 'markdown') {
                        $scope.showMarkdownExportDialog(fmt).then(function(options) {
                            // 设置导出选项到协议处理器
                            var protocol = window.editor.ProtocolManager.get('markdown');
                            if (protocol && protocol.setExportOptions) {
                                protocol.setExportOptions(options);
                            }
                            // 执行实际导出
                            $scope.doExportFile(fmt);
                        }).catch(function() {
                            // 用户取消
                        });
                    } else {
                        // 其他格式直接导出
                        $scope.doExportFile(fmt);
                    }
                };

                /**
                 * 实际执行文件导出
                 */
                $scope.doExportFile = function(fmt) {
                    // 使用中心主题作为默认文件名
                    var defaultName = $scope.getDefaultFileName() + '.' + fmt.ext;
                    
                    // 打开保存对话框
                    var filters = [{ name: fmt.name, extensions: [fmt.ext] }];
                    native.invoke('plugin:dialog|save', {
                        options: { 
                            filters: filters,
                            defaultPath: defaultName
                        }
                    }).then(function(filePath) {
                        if (filePath) {
                            // 获取 JSON 数据
                            var json = minder.exportJson();
                            
                            // 使用 ProtocolManager 编码为目标格式
                            return window.editor.ProtocolManager.encode(fmt.protocol, json, minder).then(function(data) {
                                // PNG 是 base64，需要使用二进制保存
                                if (fmt.protocol === 'png') {
                                    // encode 返回的是 data URL
                                    var base64Data = data.split(',')[1] || data;
                                    return native.invoke('save_file_base64', { path: filePath, base64Data: base64Data });
                                } else if (fmt.protocol === 'xmind' || fmt.protocol === 'mindmanager') {
                                    // XMind/MindManager 返回 Blob，需要转换为 base64
                                    return new Promise(function(resolve, reject) {
                                        var reader = new FileReader();
                                        reader.onloadend = function() {
                                            var base64Data = reader.result.split(',')[1];
                                            native.invoke('save_file_base64', { path: filePath, base64Data: base64Data })
                                                .then(resolve).catch(reject);
                                        };
                                        reader.onerror = reject;
                                        reader.readAsDataURL(data);
                                    });
                                } else {
                                    return native.file.save(filePath, data);
                                }
                            });
                        }
                    }).then(function() {
                        console.log('Export completed');
                    }).catch(function(e) {
                        console.error('Export error:', e);
                        alert('Failed to export: ' + e);
                    });
                };
            }
        }
    }]);
