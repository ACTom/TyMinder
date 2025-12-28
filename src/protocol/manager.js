/**
 * @fileOverview 自定义协议管理器
 * 
 * 由于 kityminder-core 没有开放 registerProtocol 接口，
 * 我们自己实现协议注册和转换系统。
 * 
 * 导入流程：外部文件 -> decode -> JSON -> minder.importJson()
 * 导出流程：minder.exportJson() -> JSON -> encode -> 外部文件
 */
define(function(require, exports, module) {

    var protocols = {};

    var ProtocolManager = {
        /**
         * 注册一个协议
         * @param {string} name 协议名称
         * @param {object} protocol 协议对象
         * @param {string} protocol.fileDescription 文件描述
         * @param {string} protocol.fileExtension 文件扩展名
         * @param {string} protocol.dataType 数据类型 'text' | 'blob'
         * @param {function} [protocol.encode] 导出方法：JSON -> 文件内容
         * @param {function} [protocol.decode] 导入方法：文件内容 -> JSON
         */
        register: function(name, protocol) {
            if (!name || !protocol) {
                console.error('[ProtocolManager] Invalid protocol:', name);
                return;
            }
            protocols[name] = protocol;
        },

        /**
         * 获取协议
         * @param {string} name 协议名称
         * @returns {object|null} 协议对象
         */
        get: function(name) {
            return protocols[name] || null;
        },

        /**
         * 获取所有协议名称
         * @returns {string[]}
         */
        getNames: function() {
            return Object.keys(protocols);
        },

        /**
         * 获取支持导入的协议列表
         * @returns {object[]}
         */
        getImportProtocols: function() {
            var result = [];
            for (var name in protocols) {
                if (protocols[name].decode) {
                    result.push({
                        name: name,
                        protocol: protocols[name]
                    });
                }
            }
            return result;
        },

        /**
         * 获取支持导出的协议列表
         * @returns {object[]}
         */
        getExportProtocols: function() {
            var result = [];
            for (var name in protocols) {
                if (protocols[name].encode) {
                    result.push({
                        name: name,
                        protocol: protocols[name]
                    });
                }
            }
            return result;
        },

        /**
         * 根据文件扩展名查找协议
         * @param {string} filePath 文件路径或扩展名
         * @returns {object|null} { name, protocol } 或 null
         */
        findByExtension: function(filePath) {
            var ext = filePath.toLowerCase();
            // 如果是完整路径，提取扩展名
            if (ext.indexOf('.') !== -1) {
                ext = '.' + ext.split('.').pop();
            }
            
            for (var name in protocols) {
                var protocol = protocols[name];
                if (protocol.fileExtension && protocol.fileExtension.toLowerCase() === ext) {
                    return { name: name, protocol: protocol };
                }
            }
            return null;
        },

        /**
         * 获取所有支持导入的文件扩展名
         * @returns {string[]}
         */
        getImportExtensions: function() {
            var extensions = [];
            for (var name in protocols) {
                if (protocols[name].decode && protocols[name].fileExtension) {
                    extensions.push(protocols[name].fileExtension);
                }
            }
            return extensions;
        },

        /**
         * 导入：将外部数据转换为 JSON
         * @param {string} protocolName 协议名称
         * @param {string|Blob} data 原始数据
         * @returns {Promise<object>} JSON 数据
         */
        decode: function(protocolName, data) {
            var protocol = protocols[protocolName];
            if (!protocol) {
                return Promise.reject(new Error('Protocol not found: ' + protocolName));
            }
            if (!protocol.decode) {
                return Promise.reject(new Error('Protocol does not support import: ' + protocolName));
            }

            try {
                var result = protocol.decode(data);
                // 统一返回 Promise
                if (result && typeof result.then === 'function') {
                    return result;
                }
                return Promise.resolve(result);
            } catch (e) {
                return Promise.reject(e);
            }
        },

        /**
         * 导出：将 JSON 转换为外部格式
         * @param {string} protocolName 协议名称
         * @param {object} json JSON 数据
         * @param {object} [minder] minder 实例（某些格式如 PNG/SVG 需要）
         * @returns {Promise<string|Blob>} 导出的数据
         */
        encode: function(protocolName, json, minder) {
            var protocol = protocols[protocolName];
            if (!protocol) {
                return Promise.reject(new Error('Protocol not found: ' + protocolName));
            }
            if (!protocol.encode) {
                return Promise.reject(new Error('Protocol does not support export: ' + protocolName));
            }

            try {
                var result = protocol.encode(json, minder);
                // 统一返回 Promise
                if (result && typeof result.then === 'function') {
                    return result;
                }
                return Promise.resolve(result);
            } catch (e) {
                return Promise.reject(e);
            }
        }
    };

    return module.exports = ProtocolManager;
});
