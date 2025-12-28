angular.module('kityminderEditor')
	.provider('config',  function() {

		this.config = {
			// 右侧面板最小宽度
			ctrlPanelMin: 250,

			// 右侧面板宽度
			ctrlPanelWidth: parseInt(window.localStorage.__dev_minder_ctrlPanelWidth) || 250,

			// 分割线宽度
			dividerWidth: 3,

			// 默认语言
			lang: 'system',

			// 主题色
			themeColor: '#fc8383',

			// 放大缩小比例
			zoom: [10, 20, 30, 50, 80, 100, 120, 150, 200],

			// 自动备份
			autoBackup: true,

			// 备份间隔（分钟）
			backupInterval: 5,

			// 保存时删除备份
			deleteBackupOnSave: true,
		};

		this.init = function() {
			var me = this;
			
			// 从 Rust 注入的 __APP_CONFIG__ 读取配置
			if (window.__APP_CONFIG__) {
				if (window.__APP_CONFIG__.lang) {
					me.config.lang = window.__APP_CONFIG__.lang;
				}
				if (window.__APP_CONFIG__.themeColor) {
					me.config.themeColor = window.__APP_CONFIG__.themeColor;
				}
				if (window.__APP_CONFIG__.autoBackup !== undefined) {
					me.config.autoBackup = window.__APP_CONFIG__.autoBackup;
				}
				if (window.__APP_CONFIG__.backupInterval !== undefined) {
					me.config.backupInterval = window.__APP_CONFIG__.backupInterval;
				}
				if (window.__APP_CONFIG__.deleteBackupOnSave !== undefined) {
					me.config.deleteBackupOnSave = window.__APP_CONFIG__.deleteBackupOnSave;
				}
			}
        };

		this.init();

		this.save = function() {
            var me = this;
            var tauri = window.__TAURI__ || {};
    		var core = tauri.core || tauri.tauri; // 兼容 v1/v2，主要针对 v2 使用 core
			if (core) {
				core.invoke('set_config', { key: 'lang', value: me.config.lang });
				core.invoke('set_config', { key: 'themeColor', value: me.config.themeColor });
				core.invoke('set_config', { key: 'autoBackup', value: me.config.autoBackup });
				core.invoke('set_config', { key: 'backupInterval', value: me.config.backupInterval });
				core.invoke('set_config', { key: 'deleteBackupOnSave', value: me.config.deleteBackupOnSave });
			}
        };

		this.set = function(key, value) {
            var supported = Object.keys(this.config);
            var configObj = {};

            // 支持全配置
            if (typeof key === 'object') {
                configObj = key;
            }
            else {
                configObj[key] = value;
            }

            for (var i in configObj) {
                if (configObj.hasOwnProperty(i) && supported.indexOf(i) !== -1) {
                    this.config[i] = configObj[i];
                }
                else {
                    console.error('Unsupported config key: ', key, ', please choose in :', supported.join(', '));
                    return false;
                }
            }

            return true;
		};

		this.$get = function () {
			var me = this;

			return {
				get: function (key) {
                    if (arguments.length === 0) {
                        return me.config;
                    }

					if (me.config.hasOwnProperty(key)) {
						return me.config[key];
					}

					console.warn('Missing config key pair for : ', key);
					return '';
				},
				set: function(key, value) {
                    return me.set(key, value);
                },
				save: function() {
                    return me.save();
                }

			};
		}
	});