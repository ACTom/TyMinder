angular.module('kityminderEditor')
    .controller('settings.ctrl', ['$scope', '$modalInstance', 'config', 'currentLang', 'langList', 'currentThemeColor', 'systemLangStr', 'backupConfig', function ($scope, $modalInstance, config, currentLang, langList, currentThemeColor, systemLangStr, backupConfig) {
        
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

        // 当前设置
        $scope.settings = {
            lang: currentLang || 'system',
            themeColor: (currentThemeColor || '#fc8383').toLowerCase(),
            autoBackup: backupConfig.autoBackup !== false,
            backupInterval: String(backupConfig.backupInterval || 5),
            deleteBackupOnSave: backupConfig.deleteBackupOnSave !== false
        };

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

        // 选择语言
        $scope.selectLang = function(lang) {
            $scope.settings.lang = lang;
        };

        // 选择主题色
        $scope.selectThemeColor = function(colorObj) {
            $scope.settings.themeColor = colorObj.color;
        };

        // 检查颜色是否选中（忽略大小写）
        $scope.isColorSelected = function(colorObj) {
            return $scope.settings.themeColor.toLowerCase() === colorObj.color.toLowerCase();
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
            
            $modalInstance.close({
                needRestart: needRestart,
                themeColor: $scope.settings.themeColor,
                autoBackup: $scope.settings.autoBackup,
                backupInterval: parseInt($scope.settings.backupInterval, 10),
                deleteBackupOnSave: $scope.settings.deleteBackupOnSave
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
