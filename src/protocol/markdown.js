/**
 * @fileOverview
 *
 * Markdown 格式导入导出支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {

    var LINE_ENDING_SPLITER = /\r\n|\r|\n/;
    var EMPTY_LINE = '';
    var NOTE_MARK_START = '<!--Note-->';
    var NOTE_MARK_CLOSE = '<!--/Note-->';

    // 默认配置
    var defaultOptions = {
        headingLevels: 6,      // 标题层级数（超出后用无序列表）
        rootAsTitle: true,     // 中心主题作为文档标题
        includeNote: true,     // 包含备注
        includeLink: true      // 包含链接
    };

    function encode(json, options) {
        options = angular.extend({}, defaultOptions, options || {});
        
        if (options.rootAsTitle) {
            // 中心主题作为文档标题（一级标题），子节点从二级开始
            return _build(json, 1, options).join('\n');
        } else {
            // 中心主题不导出，直接从子节点开始，子节点作为一级标题
            var lines = [];
            if (json.children) {
                json.children.forEach(function(child) {
                    lines = lines.concat(_build(child, 1, options));
                });
            }
            return lines.join('\n');
        }
    }

    function _build(node, level, options) {
        var lines = [];
        var text = node.data.text || '';
        var hyperlink = node.data.hyperlink;
        var note = node.data.note;

        level = level || 1;

        // 处理链接
        if (options.includeLink && hyperlink) {
            text = '[' + text + '](' + hyperlink + ')';
        }

        // 判断是否使用标题还是列表
        if (level <= options.headingLevels) {
            // 使用标题
            var sharps = _generateHeaderSharp(level);
            lines.push(sharps + ' ' + text);
            lines.push(EMPTY_LINE);
            
            // 处理备注
            if (options.includeNote && note) {
                var hasSharp = /^#/.test(note);
                if (hasSharp) {
                    lines.push(NOTE_MARK_START);
                    note = note.replace(/^#+/gm, function($0) {
                        return sharps + $0;
                    });
                }
                lines.push(note);
                if (hasSharp) {
                    lines.push(NOTE_MARK_CLOSE);
                }
                lines.push(EMPTY_LINE);
            }
        } else {
            // 使用无序列表
            var indent = _generateIndent(level - options.headingLevels - 1);
            lines.push(indent + '- ' + text);
            
            // 备注作为列表项的子内容
            if (options.includeNote && note) {
                var noteLines = note.split(LINE_ENDING_SPLITER);
                noteLines.forEach(function(noteLine) {
                    if (noteLine.trim()) {
                        lines.push(indent + '  ' + noteLine);
                    }
                });
            }
        }

        // 递归处理子节点
        if (node.children) {
            node.children.forEach(function(child) {
                lines = lines.concat(_build(child, level + 1, options));
            });
        }

        return lines;
    }

    function _generateHeaderSharp(level) {
        var sharps = '';
        while(level--) sharps += '#';
        return sharps;
    }

    function _generateIndent(level) {
        var indent = '';
        for (var i = 0; i < level; i++) {
            indent += '  '; // 两个空格为一级缩进
        }
        return indent;
    }

    function decode(markdown) {
        var json,
            parentMap = {},
            lines, line, lineInfo, level, node, parent, noteProgress, codeBlock,
            lastHeadingLevel = 0;  // 记录最后一个标题的层级

        // 一级标题转换 `{title}\n===` => `# {title}`
        markdown = markdown.replace(/^(.+)\n={3,}/, function($0, $1) {
            return '# ' + $1;
        });

        lines = markdown.split(LINE_ENDING_SPLITER);

        // 按行分析
        for (var i = 0; i < lines.length; i++) {
            line = lines[i];

            lineInfo = _resolveLine(line, lastHeadingLevel);

            // 备注标记处理
            if (lineInfo.noteClose) {
                noteProgress = false;
                continue;
            } else if (lineInfo.noteStart) {
                noteProgress = true;
                continue;
            }

            // 代码块处理
            codeBlock = lineInfo.codeBlock ? !codeBlock : codeBlock;

            // 备注条件：备注标签中，非标题/列表定义，或标题越位
            if (noteProgress || codeBlock) {
                if (node) _pushNote(node, line);
                continue;
            }

            // 如果没有层级信息，作为备注处理
            if (!lineInfo.level) {
                if (node && lineInfo.content && lineInfo.content.trim()) {
                    _pushNote(node, line);
                }
                continue;
            }

            // 标题或列表项处理
            level = lineInfo.level;
            if (lineInfo.isHeading) {
                lastHeadingLevel = level;
            }
            
            // 解析链接
            var nodeData = _parseContent(lineInfo.content);
            node = _initNodeWithData(nodeData, parentMap[level - 1]);
            parentMap[level] = node;
        }

        if (parentMap[1]) {
            _cleanUp(parentMap[1]);
        }
        return parentMap[1];
    }

    // 解析内容，提取链接
    function _parseContent(content) {
        var result = {
            text: content,
            hyperlink: null
        };
        
        // 匹配 Markdown 链接格式 [text](url)
        var linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(content.trim());
        if (linkMatch) {
            result.text = linkMatch[1];
            result.hyperlink = linkMatch[2];
        }
        
        return result;
    }

    function _initNodeWithData(nodeData, parent) {
        var node = {
            data: {
                text: nodeData.text,
                note: ''
            }
        };
        if (nodeData.hyperlink) {
            node.data.hyperlink = nodeData.hyperlink;
        }
        if (parent) {
            if (parent.children) parent.children.push(node);
            else parent.children = [node];
        }
        return node;
    }

    function _pushNote(node, line) {
        node.data.note += line + '\n';
    }

    function _isEmpty(line) {
        return !/\S/.test(line);
    }

    function _resolveLine(line, lastHeadingLevel) {
        // 标题匹配
        var headingMatch = /^(#+)\s+(.*)$/.exec(line);
        if (headingMatch) {
            return {
                level: headingMatch[1].length,
                content: headingMatch[2],
                isHeading: true,
                noteStart: false,
                noteClose: false,
                codeBlock: false
            };
        }
        
        // 无序列表匹配：计算缩进层级
        var listMatch = /^(\s*)[-*+]\s+(.*)$/.exec(line);
        if (listMatch) {
            var indent = listMatch[1].length;
            // 每 2 个空格为一级缩进，加上 lastHeadingLevel + 1 作为基础层级
            var listLevel = lastHeadingLevel + 1 + Math.floor(indent / 2);
            return {
                level: listLevel,
                content: listMatch[2],
                isHeading: false,
                noteStart: false,
                noteClose: false,
                codeBlock: false
            };
        }
        
        // 其他情况
        return {
            level: null,
            content: line,
            isHeading: false,
            noteStart: line == NOTE_MARK_START,
            noteClose: line == NOTE_MARK_CLOSE,
            codeBlock: /^\s*```/.test(line)
        };
    }

    function _cleanUp(node) {
        if (!/\S/.test(node.data.note)) {
            node.data.note = null;
            delete node.data.note;
        } else {
            var notes = node.data.note.split('\n');
            while(notes.length && !/\S/.test(notes[0])) notes.shift();
            while(notes.length && !/\S/.test(notes[notes.length - 1])) notes.pop();
            node.data.note = notes.join('\n');
        }
        if (node.children) node.children.forEach(_cleanUp);
    }

    var protocol = {
        fileDescription: 'Markdown/GFM 格式',
        fileExtension: '.md',
        mineType: 'text/markdown',
        dataType: 'text',

        // 存储当前导出选项
        exportOptions: null,

        // 设置导出选项
        setExportOptions: function(options) {
            this.exportOptions = options;
        },

        encode: function(json, minder) {
            // 使用存储的导出选项（通过 setExportOptions 设置）
            var opts = this.exportOptions || {};
            console.log('[Markdown] Export options:', opts);
            
            // json 可能是完整的 minder JSON（包含 root）或直接是节点
            var root = json.root || json;
            
            // 导出后清除选项
            var result = encode(root, opts);
            this.exportOptions = null;
            return result;
        },

        decode: function(markdown) {
            return decode(markdown);
        }
    };

    return module.exports = protocol;
});
