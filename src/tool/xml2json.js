/**
 * XML to JSON 转换工具
 * 用于 XMind、MindManager 等格式的 XML 解析
 */
define(function(require, exports, module) {
    
    var xml2json = {
        jsVar: function (s) { 
            return String(s || '').replace(/-/g, "_"); 
        },

        toArray: function (obj) {
            if (!Array.isArray(obj)) {
                return [obj];
            }
            return obj;
        },

        parseNode: function (node) {
            if (!node) return null;
            var self = this;
            var txt = '', obj = null, att = null;
            
            if (node.childNodes) {
                if (node.childNodes.length > 0) {
                    node.childNodes.forEach(function(cn) {
                        var cnt = cn.nodeType, cnn = self.jsVar(cn.localName || cn.nodeName);
                        var cnv = cn.text || cn.nodeValue || '';
            
                        /* comment */
                        if (cnt == 8) {
                            return; // ignore comment node
                        }
                        /* white-space */
                        else if (cnt == 3 || cnt == 4 || !cnn) {
                            if (cnv.match(/^\s+$/)) {
                                return;
                            }
                            txt += cnv.replace(/^\s+/, '').replace(/\s+$/, '');
                        } else {
                            obj = obj || {};
                            if (obj[cnn]) {
                                if (!obj[cnn].length) {
                                    obj[cnn] = self.toArray(obj[cnn]);
                                }
                                obj[cnn] = self.toArray(obj[cnn]);
        
                                obj[cnn].push(self.parseNode(cn, true));
                            } else {
                                obj[cnn] = self.parseNode(cn);
                            }
                        }
                    });
                }
            }

            if (node.attributes && node.tagName != 'title') {
                if (node.attributes.length > 0) {
                    att = {}; obj = obj || {};
                    node.attributes.forEach = [].forEach.bind(node.attributes);
                    node.attributes.forEach(function (at) {
                        var atn = self.jsVar(at.name), atv = at.value;
                        att[atn] = atv;
                        if (obj[atn]) {
                            obj[cnn] = self.toArray(obj[cnn]);
                            obj[atn][obj[atn].length] = atv;
                        }
                        else {
                            obj[atn] = atv;
                        }
                    });
                }
            }

            if (obj) {
                obj = Object.assign({}, (txt != '' ? new String(txt) : {}), obj || {});
                txt = (obj.text) ? ([obj.text || '']).concat([txt]) : txt;
                if (txt) obj.text = txt;
                txt = '';
            }

            var out = obj || txt;
            return out;
        },

        parseXML: function (xml) {
            var root = (xml.nodeType == 9) ? xml.documentElement : xml;
            return this.parseNode(root, true);
        },

        xml2json: function (str) {
            var domParser = new DOMParser();
            var dom = domParser.parseFromString(str, 'application/xml');
        
            var json = this.parseXML(dom);
            return json;
        },

        /**
         * 将 XML 字符串转换为 JSON 对象
         * @param {string} xmlString - XML 字符串
         * @returns {object} JSON 对象
         */
        parse: function(xmlString) {
            return this.xml2json(xmlString);
        }
    };

    return module.exports = xml2json;
});
