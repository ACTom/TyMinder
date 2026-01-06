/**
 * @fileOverview
 *
 * Tauri 原生能力封装层
 * 负责统一管理所有与宿主环境（Tauri）的交互，包括文件系统、窗口控制、系统对话框等。
 */
define(function(require, exports, module) {
    // 检测 Tauri 环境 (适配 Tauri v2)
    var tauri = window.__TAURI__ || {};
    var core = tauri.core || tauri.tauri; // 兼容 v1/v2，主要针对 v2 使用 core
    var windowApi = tauri.window;
    
    var isTauri = !!core;
    var currentWindow = (isTauri && windowApi) ? windowApi.getCurrentWindow() : null;

    var native = {
        /**
         * 是否在 Tauri 环境中运行
         */
        isTauri: isTauri,

        /**
         * 通用 Invoke 调用
         * @param {string} cmd 命令名称
         * @param {object} args 参数
         * @returns {Promise}
         */
        invoke: function(cmd, args) {
            if (!isTauri) {
                console.warn('[Native] invoke called outside Tauri environment:', cmd, args);
                return Promise.reject(new Error('Not in Tauri environment'));
            }
            return core.invoke(cmd, args);
        },

        /**
         * 窗口相关操作
         */
        window: {
            minimize: function() {
                if (currentWindow) currentWindow.minimize();
            },
            maximize: function() {
                if (currentWindow) currentWindow.toggleMaximize();
            },
            close: function() {
                if (currentWindow) currentWindow.close();
            },
            isMaximized: function() {
                if (currentWindow) return currentWindow.isMaximized();
                return Promise.resolve(false);
            },
            startDragging: function() {
                if (currentWindow) currentWindow.startDragging();
            }
        },

        /**
         * 文件操作 (封装 Rust 后端命令或插件)
         */
        file: {
            /**
             * 读取文件内容
             * @param {string} path 绝对路径
             */
            read: function(path) {
                return native.invoke('read_file', { path: path });
            },

            /**
             * 保存文件
             * @param {string} path 绝对路径
             * @param {string} content 文件内容
             */
            save: function(path, content) {
                return native.invoke('save_file', { path: path, contents: content });
            },

            /**
             * 打开文件选择对话框
             * @param {object} options 选项 (filters 等)
             */
            openDialog: function(options) {
                // Tauri 2.0 dialog plugin expects arguments wrapped in an 'options' object for the invoke call
                // if calling via invoke('plugin:dialog|open', ...)
                var dialogOptions = options || {
                    multiple: false,
                    directory: false,
                    filters: [{
                        name: 'Mind Map',
                        extensions: ['km']
                    }]
                };
                return native.invoke('plugin:dialog|open', { options: dialogOptions });
            },

            /**
             * 打开保存文件对话框
             * @param {object} options 选项
             * @param {string} options.defaultName 默认文件名
             * @param {array} options.filters 文件类型过滤器
             */
            saveDialog: function(options) {
                var dialogOptions = {
                    filters: (options && options.filters) || [{
                        name: 'Mind Map',
                        extensions: ['km']
                    }]
                };
                // 支持默认文件名
                if (options && options.defaultName) {
                    dialogOptions.defaultPath = options.defaultName;
                }
                return native.invoke('plugin:dialog|save', { options: dialogOptions });
            },

            /**
             * 获取文件元信息
             * @param {string} path 文件路径
             * @returns {Promise<{path: string, size: number, created: number, modified: number}>}
             */
            getInfo: function(path) {
                return native.invoke('get_file_info', { path: path });
            }
        },
        
        /**
         * 其他应用级操作
         */
        app: {
            /**
             * 创建新窗口
             * @param {string} filePath 可选，要在新窗口中打开的文件路径
             */
            createWindow: function(filePath) {
                return native.invoke('new_window', { filePath: filePath || null })
                    .catch(function(e) {
                        console.error('Failed to create window:', e);
                        throw e;
                    });
            },
            getAppConfig: function(key, defaultValue) {
                return native.invoke('get_config', { key: key }).then(function(val) {
                    return (val === null || val === undefined) ? defaultValue : val;
                });
            },
            setAppConfig: function(key, value) {
                return native.invoke('set_config', { key: key, value: value });
            },
            /**
             * 同步获取系统语言 (由 Rust 在 setup 时注入到 window.__SYSTEM_LOCALE__)
             * @returns {string} e.g. "zh-CN", "en-US"
             */
            getSystemLocaleSync: function() {
                return window.__SYSTEM_LOCALE__ || 'en';
            },
            
            /**
             * 在默认浏览器中打开外部链接
             * @param {string} url 要打开的 URL
             */
            openUrl: function(url) {
                if (!url) return Promise.resolve();
                // 使用 Tauri opener plugin 打开链接
                return native.invoke('plugin:opener|open_url', { url: url });
            }
        },
        
        /**
         * 初始化链接拦截器，使外部链接在默认浏览器中打开
         */
        setupLinkInterceptor: function() {
            if (!isTauri) return;
            
            // 拦截所有链接点击
            document.addEventListener('click', function(e) {
                var target = e.target;
                
                // 查找最近的 <a> 标签或 xlink:href 属性
                while (target && target !== document) {
                    var href = null;
                    
                    // 获取 href，处理 SVG 的 SVGAnimatedString 类型
                    if (target.href) {
                        href = typeof target.href === 'string' ? target.href : 
                               (target.href.baseVal || target.href.animVal || null);
                    }
                    if (!href) {
                        href = target.getAttribute && target.getAttribute('href');
                    }
                    if (!href) {
                        href = target.getAttributeNS && target.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                    }
                    
                    if (href && typeof href === 'string' && href !== '#' && href.indexOf('javascript:') !== 0) {
                        // 检查是否是外部链接（排除应用内部链接）
                        var isExternal = /^(https?|ftp|mailto):/i.test(href) &&
                                         href.indexOf('localhost') === -1 &&
                                         href.indexOf('tauri.localhost') === -1 &&
                                         href.indexOf('127.0.0.1') === -1;
                        
                        if (isExternal) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // 使用 Tauri 原生对话框 API
                            var urlToOpen = href;
                            native.invoke('plugin:dialog|ask', {
                                message: '是否在浏览器中打开外部链接？\n\n' + urlToOpen,
                                title: '打开链接',
                                kind: 'info'
                            }).then(function(confirmed) {
                                if (confirmed) {
                                    native.app.openUrl(urlToOpen).catch(function(err) {
                                        console.error('[Native] Failed to open URL:', urlToOpen, err);
                                    });
                                }
                            }).catch(function(err) {
                                console.error('[Native] Dialog error:', err);
                            });
                            return;
                        }
                    }
                    target = target.parentNode;
                }
            }, true);
        }
    };

    return module.exports = native;
});
