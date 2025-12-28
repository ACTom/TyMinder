/**
 * @fileOverview
 *
 * 协议模块统一入口 - 注册所有导入导出格式
 * 
 * 由于 kityminder-core 没有开放 registerProtocol 接口，
 * 我们自己实现协议管理系统。
 */
define(function(require, exports, module) {
    var ProtocolManager = require('./manager');

    // 注册所有协议
    ProtocolManager.register('json', require('./json'));
    ProtocolManager.register('markdown', require('./markdown'));
    ProtocolManager.register('plain', require('./plain'));
    ProtocolManager.register('freemind', require('./freemind'));
    ProtocolManager.register('png', require('./png'));
    ProtocolManager.register('svg', require('./svg'));
    ProtocolManager.register('xmind', require('./xmind'));
    ProtocolManager.register('mindmanager', require('./mindmanager'));

    return module.exports = ProtocolManager;
});
