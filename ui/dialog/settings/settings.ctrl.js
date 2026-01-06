angular.module('kityminderEditor')
    .controller('settings.ctrl', ['$scope', '$uibModalInstance', 'config', 'currentLang', 'langList', 'currentThemeColor', 'systemLangStr', 'backupConfig', 'aiConfig', function ($scope, $uibModalInstance, config, currentLang, langList, currentThemeColor, systemLangStr, backupConfig, aiConfig) {
        
        // 当前激活的标签页
        $scope.activeTab = 'general';
        
        $scope.setActiveTab = function(tab) {
            $scope.activeTab = tab;
        };
        
        // 24个预设主题色，按色系排列 (8x3)
        $scope.themeColors = [
            // 第一行：红色系 -> 橙色系 -> 黄色系 -> 绿色系
            { id: 'coral', color: '#fc8383', name: 'Coral' },
            { id: 'red', color: '#e74c3c', name: 'Red' },
            { id: 'wine', color: '#c0392b', name: 'Wine' },
            { id: 'orange', color: '#e67e22', name: 'Orange' },
            { id: 'carrot', color: '#f39c12', name: 'Carrot' },
            { id: 'sun', color: '#f1c40f', name: 'Sun' },
            { id: 'lime', color: '#a4c639', name: 'Lime' },
            { id: 'green', color: '#5cb85c', name: 'Green' },
            
            // 第二行：绿色系 -> 青色系 -> 蓝色系
            { id: 'emerald', color: '#2ecc71', name: 'Emerald' },
            { id: 'forest', color: '#27ae60', name: 'Forest' },
            { id: 'teal', color: '#1abc9c', name: 'Teal' },
            { id: 'darkteal', color: '#16a085', name: 'Dark Teal' },
            { id: 'cyan', color: '#00bcd4', name: 'Cyan' },
            { id: 'sky', color: '#3498db', name: 'Sky Blue' },
            { id: 'ocean', color: '#2980b9', name: 'Ocean' },
            { id: 'blue', color: '#4A90D9', name: 'Blue' },
            
            // 第三行：蓝色系 -> 紫色系 -> 粉色系 -> 灰色系
            { id: 'royal', color: '#3f51b5', name: 'Royal' },
            { id: 'indigo', color: '#5c6bc0', name: 'Indigo' },
            { id: 'purple', color: '#9b59b6', name: 'Purple' },
            { id: 'violet', color: '#8e44ad', name: 'Violet' },
            { id: 'orchid', color: '#ba68c8', name: 'Orchid' },
            { id: 'pink', color: '#e91e63', name: 'Pink' },
            { id: 'slate', color: '#607d8b', name: 'Slate' },
            { id: 'darkblue', color: '#34495e', name: 'Dark Blue' }
        ];

        // AI 提供商列表
        $scope.aiProviders = [
            { key: 'openai', label: 'OpenAI' },
            { key: 'claude', label: 'Claude (Anthropic)' },
            { key: 'qwen', label: '通义千问 (Qwen)' },
            { key: 'deepseek', label: 'DeepSeek' },
            { key: 'custom', label: '自定义 (Custom)' }
        ];

        // 当前设置
        $scope.settings = {
            lang: currentLang || 'system',
            themeColor: (currentThemeColor || '#fc8383').toLowerCase(),
            autoBackup: backupConfig.autoBackup !== false,
            backupInterval: String(backupConfig.backupInterval || 5),
            deleteBackupOnSave: backupConfig.deleteBackupOnSave !== false
        };

        // AI 设置
        $scope.aiSettings = {
            provider: aiConfig.provider || 'openai',
            apiKey: '', // 不显示已存储的密钥
            hasApiKey: aiConfig.hasApiKey || false,
            testPassed: aiConfig.testPassed || false,
            apiUrl: aiConfig.apiUrl || '',
            model: aiConfig.model || ''
        };

        // AI 测试状态
        $scope.aiTesting = false;
        $scope.aiTestResult = '';
        $scope.aiTestSuccess = false;

        // 备份大小显示
        $scope.backupSizeDisplay = '...';
        $scope.backupDir = '';

        // 加载备份信息
        function loadBackupInfo() {
            var tauri = window.__TAURI__ || {};
            var core = tauri.core || tauri.tauri;
            if (core) {
                core.invoke('get_backup_info', {}).then(function(info) {
                    $scope.backupDir = info.dir;
                    $scope.backupSizeDisplay = formatSize(info.totalSize);
                    $scope.$apply();
                }).catch(function(err) {
                    console.error('Failed to get backup info:', err);
                    $scope.backupSizeDisplay = '0 B';
                    $scope.$apply();
                });
            } else {
                $scope.backupSizeDisplay = '0 B';
            }
        }

        // 格式化文件大小
        function formatSize(bytes) {
            if (bytes === 0) return '0 B';
            var k = 1024;
            var sizes = ['B', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // 打开备份目录
        $scope.openBackupDir = function() {
            if ($scope.backupDir) {
                var tauri = window.__TAURI__ || {};
                var core = tauri.core || tauri.tauri;
                if (core) {
                    core.invoke('plugin:opener|open_path', { path: $scope.backupDir }).catch(function(err) {
                        console.error('Failed to open backup dir:', err);
                    });
                }
            }
        };

        loadBackupInfo();

        // 语言列表
        $scope.supportedLangs = [];
        angular.forEach(langList, function(data, key) {
            $scope.supportedLangs.push({
                key: key,
                label: data.lang || key
            });
        });

        // 获取语言标签
        $scope.getLangLabel = function(key) {
            if (key === 'system') {
                return $scope.systemLangLabel || systemLangStr;
            }
            for (var i = 0; i < $scope.supportedLangs.length; i++) {
                if ($scope.supportedLangs[i].key === key) {
                    return $scope.supportedLangs[i].label;
                }
            }
            return key;
        };

        // 获取提供商标签
        $scope.getProviderLabel = function(key) {
            for (var i = 0; i < $scope.aiProviders.length; i++) {
                if ($scope.aiProviders[i].key === key) {
                    return $scope.aiProviders[i].label;
                }
            }
            return key;
        };

        // 选择语言
        $scope.selectLang = function(lang) {
            $scope.settings.lang = lang;
        };

        // 选择 AI 提供商
        $scope.selectProvider = function(provider) {
            $scope.aiSettings.provider = provider;
            // 切换提供商时清空测试结果
            $scope.aiTestResult = '';
        };

        // 选择主题色
        $scope.selectThemeColor = function(colorObj) {
            $scope.settings.themeColor = colorObj.color;
        };

        // 检查颜色是否选中（忽略大小写）
        $scope.isColorSelected = function(colorObj) {
            return $scope.settings.themeColor.toLowerCase() === colorObj.color.toLowerCase();
        };

        // 测试 AI 配置
        $scope.testAiConfig = function() {
            var tauri = window.__TAURI__ || {};
            var core = tauri.core || tauri.tauri;
            if (!core) {
                $scope.aiTestResult = 'Tauri not available';
                $scope.aiTestSuccess = false;
                return;
            }

            // 如果有新输入的 API Key，先保存
            if ($scope.aiSettings.apiKey) {
                $scope.aiTesting = true;
                $scope.aiTestResult = '';
                
                core.invoke('save_ai_config', {
                    provider: $scope.aiSettings.provider,
                    apiKey: $scope.aiSettings.apiKey,
                    apiUrl: $scope.aiSettings.apiUrl || '',
                    model: $scope.aiSettings.model || ''
                }).then(function() {
                    return core.invoke('test_ai_config', {});
                }).then(function(result) {
                    $scope.aiTestResult = '✓ ' + result;
                    $scope.aiTestSuccess = true;
                    $scope.aiSettings.hasApiKey = true;
                    $scope.aiSettings.testPassed = true;
                    $scope.$apply();
                }).catch(function(err) {
                    $scope.aiTestResult = '✗ ' + err;
                    $scope.aiTestSuccess = false;
                    $scope.aiSettings.testPassed = false;
                    $scope.$apply();
                }).finally(function() {
                    $scope.aiTesting = false;
                    $scope.$apply();
                });
            } else if ($scope.aiSettings.hasApiKey) {
                // 使用已存储的 Key 测试
                $scope.aiTesting = true;
                $scope.aiTestResult = '';
                
                core.invoke('test_ai_config', {}).then(function(result) {
                    $scope.aiTestResult = '✓ ' + result;
                    $scope.aiTestSuccess = true;
                    $scope.aiSettings.testPassed = true;
                    $scope.$apply();
                }).catch(function(err) {
                    $scope.aiTestResult = '✗ ' + err;
                    $scope.aiTestSuccess = false;
                    $scope.aiSettings.testPassed = false;
                    $scope.$apply();
                }).finally(function() {
                    $scope.aiTesting = false;
                    $scope.$apply();
                });
            } else {
                $scope.aiTestResult = '请先输入 API Key';
                $scope.aiTestSuccess = false;
            }
        };

        // 计算悬停时的深色
        function darkenColor(hex, percent) {
            var num = parseInt(hex.replace('#', ''), 16);
            var amt = Math.round(2.55 * percent);
            var R = (num >> 16) - amt;
            var G = (num >> 8 & 0x00FF) - amt;
            var B = (num & 0x0000FF) - amt;
            R = R < 0 ? 0 : R;
            G = G < 0 ? 0 : G;
            B = B < 0 ? 0 : B;
            return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
        }

        // 应用主题色到页面
        function applyThemeColor(color) {
            var hoverColor = darkenColor(color, 15);
            document.documentElement.style.setProperty('--theme-color', color);
            document.documentElement.style.setProperty('--theme-color-hover', hoverColor);
        }

        // 保存设置
        $scope.save = function () {
            var tauri = window.__TAURI__ || {};
            var core = tauri.core || tauri.tauri;
            var needRestart = false;
            
            // 检查语言是否改变
            if ($scope.settings.lang !== currentLang) {
                config.set('lang', $scope.settings.lang);
                needRestart = true;
            }
            
            // 保存主题色
            config.set('themeColor', $scope.settings.themeColor);
            
            // 保存备份设置
            config.set('autoBackup', $scope.settings.autoBackup);
            config.set('backupInterval', parseInt($scope.settings.backupInterval, 10));
            config.set('deleteBackupOnSave', $scope.settings.deleteBackupOnSave);
            
            // 应用主题色
            applyThemeColor($scope.settings.themeColor);
            
            // 保存到持久化存储
            config.save();
            
            // 保存 AI 设置
            if (core && ($scope.aiSettings.apiKey || $scope.aiSettings.provider !== aiConfig.provider || 
                $scope.aiSettings.apiUrl !== aiConfig.apiUrl || $scope.aiSettings.model !== aiConfig.model)) {
                core.invoke('save_ai_config', {
                    provider: $scope.aiSettings.provider,
                    apiKey: $scope.aiSettings.apiKey || '',
                    apiUrl: $scope.aiSettings.apiUrl || '',
                    model: $scope.aiSettings.model || ''
                }).catch(function(err) {
                    console.error('Failed to save AI config:', err);
                });
            }
            
            $uibModalInstance.close({
                needRestart: needRestart,
                themeColor: $scope.settings.themeColor,
                autoBackup: $scope.settings.autoBackup,
                backupInterval: parseInt($scope.settings.backupInterval, 10),
                deleteBackupOnSave: $scope.settings.deleteBackupOnSave
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }]);
