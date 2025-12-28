/**
 * @fileOverview MindManager 文件格式支持
 * 
 * http://www.mindjet.com/mindmanager/
 * mindmanager的后缀为.mmap，实际文件格式是zip，解压之后核心文件是Document.xml
 */
define(function(require, exports, module) {
    var xml2json = require('../tool/xml2json');

    // 标签 map
    var markerMap = {
        'urn:mindjet:Prio1': ['PriorityIcon', 1],
        'urn:mindjet:Prio2': ['PriorityIcon', 2],
        'urn:mindjet:Prio3': ['PriorityIcon', 3],
        'urn:mindjet:Prio4': ['PriorityIcon', 4],
        'urn:mindjet:Prio5': ['PriorityIcon', 5],
        '0': ['ProgressIcon', 1],
        '25': ['ProgressIcon', 2],
        '50': ['ProgressIcon', 3],
        '75': ['ProgressIcon', 4],
        '100': ['ProgressIcon', 5]
    };

    function processTopic(topic, obj) {
        //处理文本
        obj.data = {
            text: topic.Text && topic.Text.PlainText || ''
        }; // 节点默认的文本，没有Text属性

        // 处理标签
        if (topic.Task) {
            var type;
            if (topic.Task.TaskPriority) {
                type = markerMap[topic.Task.TaskPriority];
                if (type) obj.data[type[0]] = type[1];
            }

            if (topic.Task.TaskPercentage) {
                type = markerMap[topic.Task.TaskPercentage];
                if (type) obj.data[type[0]] = type[1];
            }
        }

        // 处理超链接
        if (topic.Hyperlink) {
            obj.data.hyperlink = topic.Hyperlink.Url;
        }

        //处理子节点
        if (topic.SubTopics && topic.SubTopics.Topic) {
            var tmp = topic.SubTopics.Topic;
            if (tmp.length && tmp.length > 0) { //多个子节点
                obj.children = [];

                for (var i in tmp) {
                    obj.children.push({});
                    processTopic(tmp[i], obj.children[i]);
                }

            } else { //一个子节点
                obj.children = [{}];
                processTopic(tmp, obj.children[0]);
            }
        }
    }

    function xml2km(xmlString) {
        var json = xml2json.parse(xmlString);
        var result = {};
        processTopic(json.OneTopic.Topic, result);
        return result;
    }

    var protocol = {
        fileDescription: 'MindManager 格式',
        fileExtension: '.mmap',
        dataType: 'blob',

        decode: function(local) {
            // 使用 JSZip 解析 zip 文件
            return JSZip.loadAsync(local).then(function(zip) {
                // 查找 Document.xml 文件
                var docFile = null;
                zip.forEach(function(relativePath, file) {
                    if (relativePath.split('/').pop() === 'Document.xml') {
                        docFile = file;
                    }
                });

                if (!docFile) {
                    return Promise.reject(new Error('Main document missing'));
                }

                return docFile.async('string').then(function(text) {
                    return xml2km(text);
                });
            });
        },

        // 仅支持导入，不支持导出
        encode: null
    };

    return module.exports = protocol;
});
