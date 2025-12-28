/**
 * @fileOverview
 *
 * 文档状态管理服务
 * 负责管理当前打开文档的状态信息，包括文件路径、文件名、修改状态等。
 * 作为单一数据源，供所有需要访问文档状态的组件使用。
 *
 */
angular.module('kityminderEditor')
    .service('document', ['$rootScope', function($rootScope) {
        var state = {
            filePath: null,      // 当前文件绝对路径
            fileName: null,      // 文件名（从 filePath 解析）
            isModified: false,   // 是否有未保存的修改
            isNewFile: true      // 是否是新建的未保存文件
        };

        var defaultFileName = 'Untitled.km';

        /**
         * 从完整路径中提取文件名
         * @param {string} filePath 
         * @returns {string|null}
         */
        function extractFileName(filePath) {
            if (!filePath) return null;
            // 同时处理 Windows 和 Unix 路径
            return filePath.replace(/^.*[\\\/]/, '');
        }

        return {
            /**
             * 获取完整状态对象
             */
            getState: function() {
                return state;
            },

            /**
             * 获取当前文件路径
             */
            getFilePath: function() {
                return state.filePath;
            },

            /**
             * 获取当前文件名
             */
            getFileName: function() {
                return state.fileName || defaultFileName;
            },

            /**
             * 是否有未保存的修改
             */
            isModified: function() {
                return state.isModified;
            },

            /**
             * 是否是新文件（从未保存过）
             */
            isNewFile: function() {
                return state.isNewFile;
            },

            /**
             * 设置当前文件路径
             * @param {string} path 文件绝对路径
             */
            setFilePath: function(path) {
                state.filePath = path;
                state.fileName = extractFileName(path);
                state.isNewFile = !path;
                $rootScope.$broadcast('document:pathChanged', state);
            },

            /**
             * 设置修改状态
             * @param {boolean} modified 
             */
            setModified: function(modified) {
                if (state.isModified !== modified) {
                    state.isModified = modified;
                    $rootScope.$broadcast('document:modifiedChanged', state);
                }
            },

            /**
             * 标记文件已保存
             */
            markSaved: function() {
                state.isModified = false;
                $rootScope.$broadcast('document:saved', state);
            },

            /**
             * 重置状态（新建文件时调用）
             */
            reset: function() {
                state.filePath = null;
                state.fileName = null;
                state.isModified = false;
                state.isNewFile = true;
                $rootScope.$broadcast('document:reset', state);
            },

            /**
             * 设置默认文件名（用于国际化）
             * @param {string} name 
             */
            setDefaultFileName: function(name) {
                if (name) {
                    defaultFileName = name;
                }
            },

            /**
             * 获取用于显示的标题（带修改标记）
             * @returns {string}
             */
            getTitle: function() {
                var name = state.fileName || defaultFileName;
                return state.isModified ? name + ' *' : name;
            }
        };
    }]);
