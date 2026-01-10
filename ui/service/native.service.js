angular.module('kityminderEditor')
    .service('native', function() {
        // 默认实现（非 Tauri 环境）

        function getImpl() {
            var impl = {
                isTauri: false,
                window: {},
                file: {},
                app: {}
            };

            if (window.editor && window.editor.native) {
                return window.editor.native;
            }

            return impl;
        }      

        // 代理属性访问，确保总是访问当前的 impl
        Object.defineProperty(this, 'isTauri', {
            get: function() { return getImpl().isTauri; }
        });

        Object.defineProperty(this, 'window', {
            get: function() { return getImpl().window; }    
        });

        Object.defineProperty(this, 'file', {
            get: function() { return getImpl().file; }
        });

        Object.defineProperty(this, 'app', {
            get: function() { return getImpl().app; }
        });

        Object.defineProperty(this, 'getPlatform', {
            get: function() { return getImpl().getPlatform; }
        });

        Object.defineProperty(this, 'invoke', {
            get: function() { return getImpl().invoke; }
        });
    });
