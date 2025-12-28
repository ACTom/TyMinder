/**
 * @fileOverview KityMinder JSON 格式支持
 */
define(function(require, exports, module) {

    var protocol = {
        fileDescription: 'KityMinder 格式',
        fileExtension: '.km',
        dataType: 'text',
        mineType: 'application/json',

        encode: function(json) {
            return JSON.stringify(json);
        },

        decode: function(local) {
            return JSON.parse(local);
        }
    };

    return module.exports = protocol;
});
