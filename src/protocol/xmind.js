/**
 * @fileOverview XMind 文件格式支持
 * 
 * http://www.xmind.net/developer/
 * XMind files are generated in XMind Workbook (.xmind) format, an open format
 * that is based on the principles of OpenDocument. It consists of a ZIP
 * compressed archive containing separate XML documents for content and styles,
 * a .jpg image file for thumbnails, and directories for related attachments.
 * 
 * 支持两种格式：
 * - 旧版 XMind：读取 content.xml（XML 格式）
 * - 新版 XMind：读取 content.json（JSON 格式）
 */
define(function(require, exports, module) {
    var xml2json = require('../tool/xml2json');

    // 标签 map（优先级和进度图标）
    var markerMap = {
        'priority-1': ['priority', 1],
        'priority-2': ['priority', 2],
        'priority-3': ['priority', 3],
        'priority-4': ['priority', 4],
        'priority-5': ['priority', 5],
        'priority-6': ['priority', 6],
        'priority-7': ['priority', 7],
        'priority-8': ['priority', 8],
        'priority-9': ['priority', 9],

        'task-start': ['progress', 1],
        'task-oct': ['progress', 2],
        'task-quarter': ['progress', 3],
        'task-3oct': ['progress', 4],
        'task-half': ['progress', 5],
        'task-5oct': ['progress', 6],
        'task-3quar': ['progress', 7],
        'task-7oct': ['progress', 8],
        'task-done': ['progress', 9]
    };

    // 反向映射：KM 属性 -> XMind markerId
    var priorityToMarker = {
        1: 'priority-1',
        2: 'priority-2',
        3: 'priority-3',
        4: 'priority-4',
        5: 'priority-5',
        6: 'priority-6',
        7: 'priority-7',
        8: 'priority-8',
        9: 'priority-9'
    };
    
    var progressToMarker = {
        1: 'task-start',
        2: 'task-oct',
        3: 'task-quarter',
        4: 'task-3oct',
        5: 'task-half',
        6: 'task-5oct',
        7: 'task-3quar',
        8: 'task-7oct',
        9: 'task-done'
    };

    // ==================== HTML 转 Markdown ====================
    
    /**
     * 将 XMind 的 HTML 备注转换为 Markdown 格式
     * 支持：加粗、斜体、下划线、有序列表、无序列表、超链接
     * 其他标签去掉保留纯文本
     */
    function htmlToMarkdown(html) {
        if (!html) return '';
        
        var result = html;
        
        // 处理无序列表 <ul><li>...</li></ul>
        result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, function(match, content) {
            var items = [];
            content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function(m, item) {
                // 递归处理列表项内的格式
                items.push('- ' + item.trim());
            });
            return '\n' + items.join('\n') + '\n';
        });
        
        // 处理有序列表 <ol><li>...</li></ol>
        result = result.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, function(match, content) {
            var items = [];
            var index = 1;
            content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function(m, item) {
                items.push(index + '. ' + item.trim());
                index++;
            });
            return '\n' + items.join('\n') + '\n';
        });
        
        // 处理超链接 <a href="url">text</a> -> [text](url)
        result = result.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, function(match, url, text) {
            return '[' + text.trim() + '](' + url + ')';
        });
        
        // 处理加粗 <strong>text</strong> 或 <b>text</b> -> **text**
        result = result.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, function(match, tag, text) {
            return '**' + text + '**';
        });
        
        // 处理斜体 <em>text</em> 或 <i>text</i> -> *text*
        result = result.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, function(match, tag, text) {
            return '*' + text + '*';
        });
        
        // 处理下划线 <u>text</u> -> 纯文本（Markdown 不支持下划线）
        result = result.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '$1');
        
        // 处理换行 <br> 或 <br/>
        result = result.replace(/<br\s*\/?>/gi, '\n');
        
        // 处理 <div> 块级元素 - 每个 div 后加换行
        result = result.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');
        
        // 处理 <p> 段落 - 每个段落后加换行
        result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');
        
        // 移除所有剩余的 HTML 标签
        result = result.replace(/<[^>]+>/g, '');
        
        // 解码 HTML 实体
        result = result.replace(/&lt;/g, '<');
        result = result.replace(/&gt;/g, '>');
        result = result.replace(/&amp;/g, '&');
        result = result.replace(/&quot;/g, '"');
        result = result.replace(/&#39;/g, "'");
        result = result.replace(/&nbsp;/g, ' ');
        
        // 清理多余的空行
        result = result.replace(/\n{3,}/g, '\n\n');
        
        // 去除首尾空白
        result = result.trim();
        
        return result;
    }

    // ==================== Markdown 转 HTML ====================
    
    /**
     * 将 Markdown 备注转换为 XMind 的 HTML 格式
     * 支持：加粗、斜体、有序列表、无序列表、超链接
     */
    function markdownToHtml(markdown) {
        if (!markdown) return '';
        
        var result = markdown;
        
        // 处理加粗 **text** -> <strong>text</strong>
        result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体 *text* -> <em>text</em>
        result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // 处理超链接 [text](url) -> <a href="url">text</a>
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // 处理无序列表
        var lines = result.split('\n');
        var inUl = false;
        var inOl = false;
        var htmlLines = [];
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
            var olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
            
            if (ulMatch) {
                if (!inUl) {
                    if (inOl) {
                        htmlLines.push('</ol>');
                        inOl = false;
                    }
                    htmlLines.push('<ul>');
                    inUl = true;
                }
                htmlLines.push('<li>' + ulMatch[1] + '</li>');
            } else if (olMatch) {
                if (!inOl) {
                    if (inUl) {
                        htmlLines.push('</ul>');
                        inUl = false;
                    }
                    htmlLines.push('<ol>');
                    inOl = true;
                }
                htmlLines.push('<li>' + olMatch[1] + '</li>');
            } else {
                if (inUl) {
                    htmlLines.push('</ul>');
                    inUl = false;
                }
                if (inOl) {
                    htmlLines.push('</ol>');
                    inOl = false;
                }
                if (line.trim()) {
                    htmlLines.push('<div>' + line + '</div>');
                }
            }
        }
        
        if (inUl) htmlLines.push('</ul>');
        if (inOl) htmlLines.push('</ol>');
        
        return htmlLines.join('');
    }

    // ==================== KM 转 XMind JSON（导出） ====================
    
    /**
     * 生成唯一 ID
     */
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * 将 KM 节点转换为 XMind 主题格式
     */
    function kmToXmindTopic(node) {
        var topic = {
            id: generateId(),
            title: (node.data && node.data.text) || ''
        };
        
        var data = node.data || {};
        
        // 处理优先级和进度图标
        var markers = [];
        if (data.priority && priorityToMarker[data.priority]) {
            markers.push({ markerId: priorityToMarker[data.priority] });
        }
        if (data.progress && progressToMarker[data.progress]) {
            markers.push({ markerId: progressToMarker[data.progress] });
        }
        if (markers.length > 0) {
            topic.markers = markers;
        }
        
        // 处理超链接
        if (data.hyperlink) {
            topic.href = data.hyperlink;
        }
        
        // 处理标签（resource）
        if (data.resource) {
            topic.labels = Array.isArray(data.resource) ? data.resource : [data.resource];
        }
        
        // 处理备注（Markdown -> HTML）
        if (data.note) {
            var htmlContent = markdownToHtml(data.note);
            topic.notes = {
                plain: { content: data.note },
                realHTML: { content: htmlContent }
            };
        }
        
        // 处理子节点
        if (node.children && node.children.length > 0) {
            topic.children = {
                attached: node.children.map(function(child) {
                    return kmToXmindTopic(child);
                })
            };
        }
        
        return topic;
    }
    
    /**
     * 将 KM JSON 转换为 XMind 文件内容
     */
    function km2xmind(json) {
        var sheetId = generateId().replace(/-/g, '');
        
        // minder.exportJson() 返回的结构是 { root: {...}, template, theme, version }
        // 节点数据在 json.root 中
        var rootNode = json.root || json;
        var rootTopic = kmToXmindTopic(rootNode);
        rootTopic.class = 'topic';
        rootTopic.structureClass = 'org.xmind.ui.map.unbalanced';
        
        var sheet = {
            id: sheetId,
            class: 'sheet',
            title: rootTopic.title || 'Sheet 1',
            rootTopic: rootTopic,
            topicPositioning: 'fixed'
        };
        
        return [sheet];
    }
    
    /**
     * 生成 content.xml（兼容性警告文件）
     */
    function generateContentXml() {
        return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
            '<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" version="2.0">' +
            '<sheet id="compatibility">' +
            '<topic id="root" structure-class="org.xmind.ui.logic.right">' +
            '<title>Warning / 警告</title>' +
            '<children><topics type="attached">' +
            '<topic id="en"><title>This file was created by TyMinder. Please use XMind 8 Update 3 or later to open.</title></topic>' +
            '<topic id="zh"><title>该文件由 TyMinder 创建，请使用 XMind 8 Update 3 或更新版本打开。</title></topic>' +
            '</topics></children>' +
            '</topic>' +
            '<title>Sheet 1</title>' +
            '</sheet>' +
            '</xmap-content>';
    }
    
    /**
     * 生成 manifest.json
     */
    function generateManifest() {
        return {
            'file-entries': {
                'content.json': {},
                'metadata.json': {}
            }
        };
    }
    
    /**
     * 生成 metadata.json
     */
    function generateMetadata(sheetId) {
        return {
            dataStructureVersion: '2',
            creator: {
                name: 'TyMinder',
                version: '1.0.0'
            },
            activeSheetId: sheetId,
            layoutEngineVersion: '3'
        };
    }

    // ==================== 旧版 XMind（XML 格式）处理 ====================
    
    function processTopicXml(topic, obj) {
        // 处理文本
        obj.data = {
            text: topic.title
        };

        // 处理标签（marker）
        if (topic.marker_refs && topic.marker_refs.marker_ref) {
            var markers = topic.marker_refs.marker_ref;
            var type;
            if (markers.length && markers.length > 0) {
                for (var i in markers) {
                    type = markerMap[markers[i].marker_id];
                    if (type) obj.data[type[0]] = type[1];
                }
            } else {
                type = markerMap[markers.marker_id];
                if (type) obj.data[type[0]] = type[1];
            }
        }

        // 处理超链接
        if (topic['xlink:href']) {
            obj.data.hyperlink = topic['xlink:href'];
        }

        // 处理子节点
        var topics = topic.children && topic.children.topics;
        var subTopics = topics && (topics.topic || topics[0] && topics[0].topic);
        if (subTopics) {
            var tmp = subTopics;
            if (tmp.length && tmp.length > 0) {
                obj.children = [];
                for (var j in tmp) {
                    obj.children.push({});
                    processTopicXml(tmp[j], obj.children[j]);
                }
            } else {
                obj.children = [{}];
                processTopicXml(tmp, obj.children[0]);
            }
        }
    }

    function xml2km(xmlString) {
        var json = xml2json.parse(xmlString);
        var result = {};
        var sheet = json.sheet;
        var topic = (Array.isArray ? Array.isArray(sheet) : (sheet && sheet.length)) ? sheet[0].topic : sheet.topic;
        processTopicXml(topic, result);
        return result;
    }

    // ==================== 新版 XMind（JSON 格式）处理 ====================
    
    function processTopicJson(topic, obj) {
        // 处理文本
        obj.data = {
            text: topic.title || ''
        };

        // 处理标签（markers）- 优先级和进度图标
        if (topic.markers && topic.markers.length > 0) {
            for (var i = 0; i < topic.markers.length; i++) {
                var markerId = topic.markers[i].markerId;
                var type = markerMap[markerId];
                if (type) {
                    obj.data[type[0]] = type[1];
                }
            }
        }

        // 处理超链接
        if (topic.href) {
            obj.data.hyperlink = topic.href;
        }

        // 处理标签（labels）-> 资源标签
        if (topic.labels && topic.labels.length > 0) {
            obj.data.resource = topic.labels;
        }

        // 处理备注（notes）- 优先使用 HTML 并转换为 Markdown
        if (topic.notes) {
            if (topic.notes.realHTML && topic.notes.realHTML.content) {
                // 优先使用 HTML 备注并转换为 Markdown
                obj.data.note = htmlToMarkdown(topic.notes.realHTML.content);
            } else if (topic.notes.plain && topic.notes.plain.content) {
                // 回退到纯文本备注
                obj.data.note = topic.notes.plain.content;
            }
        }

        // 处理子节点（children.attached）
        if (topic.children && topic.children.attached && topic.children.attached.length > 0) {
            obj.children = [];
            for (var j = 0; j < topic.children.attached.length; j++) {
                var child = {};
                processTopicJson(topic.children.attached[j], child);
                obj.children.push(child);
            }
        }
    }

    function json2km(jsonData) {
        var result = {};
        
        // jsonData 是数组，每个元素是一个 sheet（画布）
        // 只读取第一个画布
        var sheets = Array.isArray(jsonData) ? jsonData : [jsonData];
        if (sheets.length === 0) {
            return result;
        }
        
        var firstSheet = sheets[0];
        var rootTopic = firstSheet.rootTopic;
        
        if (rootTopic) {
            processTopicJson(rootTopic, result);
        }
        
        return result;
    }

    // ==================== 协议定义 ====================
    
    var protocol = {
        fileDescription: 'XMind 格式',
        fileExtension: '.xmind',
        dataType: 'blob',
        mineType: 'application/octet-stream',

        decode: function(local) {
            // 使用 JSZip 解析 zip 文件
            return JSZip.loadAsync(local).then(function(zip) {
                // 优先查找 content.json（新版 XMind）
                var jsonFile = null;
                var xmlFile = null;
                
                zip.forEach(function(relativePath, file) {
                    var fileName = relativePath.split('/').pop();
                    if (fileName === 'content.json') {
                        jsonFile = file;
                    } else if (fileName === 'content.xml') {
                        xmlFile = file;
                    }
                });

                // 新版 XMind：使用 content.json
                if (jsonFile) {
                    return jsonFile.async('string').then(function(text) {
                        var jsonData = JSON.parse(text);
                        return json2km(jsonData);
                    });
                }
                
                // 旧版 XMind：使用 content.xml
                if (xmlFile) {
                    return xmlFile.async('string').then(function(text) {
                        return xml2km(text);
                    });
                }

                return Promise.reject(new Error('Content document missing (neither content.json nor content.xml found)'));
            });
        },

        encode: function(json) {
            // 将 KM JSON 转换为 XMind 格式
            var xmindContent = km2xmind(json);
            var sheetId = xmindContent[0].id;
            
            // 创建 ZIP 文件
            var zip = new JSZip();
            
            // 添加文件
            zip.file('content.json', JSON.stringify(xmindContent));
            zip.file('content.xml', generateContentXml());
            zip.file('manifest.json', JSON.stringify(generateManifest()));
            zip.file('metadata.json', JSON.stringify(generateMetadata(sheetId)));
            
            // 生成 Blob
            return zip.generateAsync({ type: 'blob', mimeType: 'application/octet-stream' });
        }
    };

    return module.exports = protocol;
});
